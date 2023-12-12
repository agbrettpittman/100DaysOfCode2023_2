import { randomBytes, pbkdf2Sync } from "crypto";
import { UsersModel, RefreshTokensModel, CharactersModel } from "./database/schemas.js";
import { GraphQLError } from "graphql";
import jwt from 'jsonwebtoken';
import { GraphQLUpload } from "graphql-upload-ts";
import { consumeFileStreams, hanldeCharacterImages, validateCharacterImages } from "./utils.js";
import { Request } from "express";
import fs from 'fs';
import path from 'path';

const resolvers = {
    Query: {
        users: async () => {
            return await UsersModel.find();
        },
        characters: async () => {
            return await CharactersModel.find();
        }
    },

    Upload: GraphQLUpload,

    Mutation: {
        createUser: async (obj:{}, { input }) => {
            const Salt = randomBytes(128).toString('base64');
            const Hash = pbkdf2Sync(input.password, Salt, 10000, 512, 'sha512').toString('hex');
            input.salt = Salt;
            input.password = Hash;
            const user = new UsersModel(input);
            await user.save();
            return user;
        },
        loginUser: async (obj:{}, { input }) => {
            const { userName, password } = input;
            const InvalidLoginError = new GraphQLError('Invalid login', {
                extensions: {
                    code: 'INVALID_LOGIN',
                    http: { status: 401 }
                }
            });
            try {
                const UserFound = await UsersModel.findOne({ userName });
                if (!UserFound) throw InvalidLoginError;
                const { salt, password: hash } = UserFound;
                const Hash = pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
                if (hash !== Hash) throw InvalidLoginError;
                const expires = new Date();
                expires.setMinutes(expires.getMinutes() + 10);
                const accessToken = jwt.sign({ userId: UserFound._id, expiration: expires }, process.env.JWT_SECRET);
                const refreshToken = randomBytes(128).toString('base64');
                const RefreshTokenEntry = new RefreshTokensModel({ userId: UserFound._id, token: refreshToken, expires: expires });
                await RefreshTokenEntry.save();
                return { accessToken, refreshToken, user: UserFound };
            } catch (err) {
                throw new GraphQLError(err.message, {
                    extensions: {
                        code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                        http: { status: err.extensions?.http?.status || 500 }
                    }
                });
            }
        },
        logoutUser: async (obj:{}, { refreshToken }) => {
            try {
                await RefreshTokensModel.deleteOne({ token: refreshToken });
                return true;
            } catch (err) {
                throw new GraphQLError(err.message, {
                    extensions: {
                        code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                        http: { status: err.extensions?.http?.status || 500 }
                    }
                });
            }
        },
        extendTokens: async (obj:{}, { refreshToken }) => {
            const InvalidRefreshTokenError = new GraphQLError('Invalid refresh token', {
                extensions: {
                    code: 'INVALID_REFRESH_TOKEN',
                    http: { status: 401 }
                }
            });
            try {
                const RefreshTokenEntry = await RefreshTokensModel.findOne({ token: refreshToken });
                if (!RefreshTokenEntry) throw InvalidRefreshTokenError;

                const { userId, expires } = RefreshTokenEntry;
                if (expires < new Date()) {
                    await RefreshTokenEntry.deleteOne({ token: refreshToken });
                    throw InvalidRefreshTokenError;
                }

                const UserFound = await UsersModel.findById(userId);
                if (!UserFound) {
                    await RefreshTokenEntry.deleteOne({ token: refreshToken });
                    throw InvalidRefreshTokenError;
                }

                const newExpiration = new Date();
                newExpiration.setMinutes(expires.getMinutes() + 10);
                await RefreshTokenEntry.updateOne({ expires: newExpiration });
                const accessToken = jwt.sign({ userId: UserFound._id, expiration: newExpiration }, process.env.JWT_SECRET);
                return { accessToken, refreshToken, user: UserFound };
            } catch (err) {
                throw new GraphQLError(err.message, {
                    extensions: {
                        code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                        http: { status: err.extensions?.http?.status || 500 }
                    }
                });
            }
        },
        createCharacter: async (obj:{}, { input, images }, { userId }) => {

            let tempDirectory: string | null = null;
            let consumedFiles = { directory: null, files: [] };
            
            try {

                if (images.length){
                    console.log("Consuming files")
                    consumedFiles = await consumeFileStreams(images)
                    tempDirectory = consumedFiles.directory;
                }
                
                console.log("Authorizing user")
                if (!userId) throw new GraphQLError('Unauthorized', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                });

                if (images.length) {
                    console.log("Validating images")
                    await validateCharacterImages(tempDirectory, consumedFiles.files, input.imageDetails);
                }
                const { imageDetails, ...rest } = input;

                console.log("Creating character")
                const character = new CharactersModel({
                    creatorId: userId,
                    ownerId: userId,
                    ...rest
                });
                await character.save();

                if (images.length) {
                    try {
                        console.log("Adding images to character")
                        const CharacterId = character._id;
                        const UpdatedCharacter = await hanldeCharacterImages(CharacterId, tempDirectory, imageDetails);
                        return UpdatedCharacter;
                    }
                    catch (err) {
                        // delete character
                        console.log(`Deleting character ${character._id}`)
                        await CharactersModel.deleteOne({ _id: character._id });
                        throw err;                      
                    }
                } else {
                    return character;
                }
            } catch (err) {
                throw new GraphQLError(err.message, {
                    extensions: {
                        code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                        http: { status: err.extensions?.http?.status || 500 }
                    }
                });
            } finally {
                if (tempDirectory) {
                    fs.rmSync(tempDirectory, { recursive: true });
                }
            }
        },
        updateCharacter: async (obj:{}, { characterId, input }, { userId }) => {
            if (!userId) throw new GraphQLError('Unauthorized', {
                extensions: {
                    code: 'UNAUTHORIZED',
                    http: { status: 401 }
                }
            });
            const character = await CharactersModel.findById(characterId);
            if (!character) throw new GraphQLError('Character not found', {
                extensions: {
                    code: 'NOT_FOUND',
                    http: { status: 404 }
                }
            });
            if (character.ownerId !== userId) throw new GraphQLError('Unauthorized', {
                extensions: {
                    code: 'UNAUTHORIZED',
                    http: { status: 401 }
                }
            });
            const UpdatedCharacter = await CharactersModel.findByIdAndUpdate(characterId, input, { new: true });
            return UpdatedCharacter
        },
        uploadCharacterImages: async (obj:{}, { characterId, images }, { userId, req, res }) => {

            let tempDirectory: string | null = null;
            
            try {
                    const ConsumedFiles = await consumeFileStreams(images)
                    tempDirectory = ConsumedFiles.directory;

                    if (!userId) throw new GraphQLError('Unauthorized', {
                        extensions: {
                            code: 'UNAUTHORIZED',
                            http: { status: 401 }
                        }
                    });
                    const character = await CharactersModel.findById(characterId);
                    if (!character) throw new GraphQLError('Character not found', {
                        extensions: {
                            code: 'NOT_FOUND',
                            http: { status: 404 }
                        }
                    });
                    if (character.ownerId !== userId) throw new GraphQLError('Unauthorized', {
                        extensions: {
                            code: 'UNAUTHORIZED',
                            http: { status: 401 }
                        }
                    });
        
                    const UpdatedCharacter = await hanldeCharacterImages(characterId, tempDirectory);

                    return UpdatedCharacter;
                    
                } catch (err) {
                    throw new GraphQLError(err.message, {
                        extensions: {
                            code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                            http: { status: err.extensions?.http?.status || 500 }
                        }
                    });
                } finally {
                    console.log(tempDirectory)
                    if (tempDirectory) {
                        fs.rmdirSync(tempDirectory, { recursive: true });
                    }
                }


        },
        transferCharacter: async (obj:{}, { characterId, newOwnerId }, { userId }) => {
            if (!userId) throw new GraphQLError('Unauthorized', {
                extensions: {
                    code: 'UNAUTHORIZED',
                    http: { status: 401 }
                }
            });
            const character = await CharactersModel.findById(characterId);
            if (!character) throw new GraphQLError('Character not found', {
                extensions: {
                    code: 'NOT_FOUND',
                    http: { status: 404 }
                }
            });
            if (character.ownerId !== userId) throw new GraphQLError('Unauthorized', {
                extensions: {
                    code: 'UNAUTHORIZED',
                    http: { status: 401 }
                }
            });
            const UpdatedCharacter = await CharactersModel.findByIdAndUpdate(characterId, { ownerId: newOwnerId }, { new: true });
            return UpdatedCharacter;
        },
    }
};

export default resolvers


/*

curl http://localhost:4000/ \
    -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTY2OTJkNzU1NzE0ODRlZDgwOGMyMDEiLCJleHBpcmF0aW9uIjoiMjAyMy0xMi0wOFQxMzo0OTozMi41OTNaIiwiaWF0IjoxNzAyMDQyNzcyfQ.YJg-YmyYl9TJjEQ_wgo6s2v14ej4qW2oBx5Dwa0kl9U' \
    -H 'Apollo-Require-Preflight: true' \
 -F operations='{"query":"mutation UploadCharacterImages($characterId: String!, $images: [Upload]) {\n  uploadCharacterImages(characterId: $characterId, images: $images) {\n    _id\n    creatorId\n    ownerId\n    name\n    subTitle\n    description\n    details {\n      name\n      value\n    }\n    images {\n      filename\n      mainPhoto\n      caption\n    }\n  }\n}","operationName":"UploadCharacterImages","variables":{"characterId":"65727439c669f1330e4c935d","images":[null,null]}}' \
 -F map='{"0":["variables.images.0"],"1":["variables.images.1"]}' \
 -F 0=@christmasBG.jpg \,
 -F 1=@zztestFile.txt \
 */