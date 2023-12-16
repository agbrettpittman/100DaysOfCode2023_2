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

            const { imageDetails, ...rest } = input;
            let tempDirectory: string | null = null;
            let consumedFiles = { directory: null, files: [] };
            let remappedImageDetails = imageDetails;
            
            try {

                if (images?.length){
                    consumedFiles = await consumeFileStreams(images)
                    tempDirectory = consumedFiles.directory;
                }
                
                if (!userId) throw new GraphQLError('Unauthorized', {
                    extensions: {
                        code: 'UNAUTHORIZED',
                        http: { status: 401 }
                    }
                });

                

                if (images?.length) {
                    remappedImageDetails = await validateCharacterImages(
                        tempDirectory, consumedFiles.files, imageDetails
                    );
                }

                console.log("Creating character")
                const character = new CharactersModel({
                    creatorId: userId,
                    ownerId: userId,
                    ...rest
                });
                await character.save();

                if (images?.length) {
                    try {
                        const CharacterId = character._id;
                        const UpdatedCharacter = await hanldeCharacterImages(
                            CharacterId, tempDirectory, remappedImageDetails
                        );
                        return UpdatedCharacter;
                    }
                    catch (err) {
                        // delete character
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

                    await validateCharacterImages(tempDirectory, ConsumedFiles.files);
        
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
        updateCharacterImageDetails: async (obj:{}, { input }, { userId }) => {
            const { characterId, imageId, ...newDetails } = input;
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
            let newImages = [...character.images]
            if (!newImages[imageId]) throw new GraphQLError('Image not found', {
                extensions: {
                    code: 'NOT_FOUND',
                    http: { status: 404 }
                }
            });

            newImages = newImages.map((image, index) => {
                if (index === imageId) {
                    return { ...image, ...newDetails }
                } else if (newDetails.mainPhoto && image.mainPhoto) {
                    return { ...image, mainPhoto: false }
                } else {
                    return image;
                }
            })

            const UpdatedCharacter = await CharactersModel.findByIdAndUpdate(characterId, { images: newImages }, { new: true });

            return UpdatedCharacter;

        },
        deleteCharacter: async (obj:{}, { characterId }, { userId }) => {
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

            // delete images
            for (const image of character.images) {
                fs.rmSync(`uploads/${image.filename}`);
            }

            await CharactersModel.deleteOne({ _id: characterId });
            return true;
        },
        deleteCharacterImage: async (obj:{}, { characterId, imageId }, { userId }) => {
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
            const image = character.images[imageId];
            if (!image) throw new GraphQLError('Image not found', {
                extensions: {
                    code: 'NOT_FOUND',
                    http: { status: 404 }
                }
            });
            fs.rmSync(`uploads/${image.filename}`);
            character.images.splice(imageId, 1);

            // loop through remaining images and rename them
            for (let i = imageId; i < character.images.length; i++) {
                const image = character.images[i];
                const newFileName = `${characterId}-${i}`;
                fs.renameSync(`uploads/${image.filename}`, `uploads/${newFileName}`);
                image.filename = newFileName;
            }

            const UpdatedCharacter = await character.save();
            return UpdatedCharacter;
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