import { randomBytes, pbkdf2Sync } from "crypto";
import { UsersModel, RefreshTokensModel, CharactersModel } from "./database/schemas.js";
import { GraphQLError } from "graphql";
import { finished } from 'stream/promises';
import jwt from 'jsonwebtoken';
import { GraphQLUpload } from "graphql-upload-ts";
import mmm from 'mmmagic'
import fs from 'fs';
import { promisify } from "util";

const { Magic, MAGIC_MIME_TYPE } = mmm;

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
        createCharacter: async (obj:{}, { input, images }, { userId}) => {
            if (!userId) throw new GraphQLError('Unauthorized', {
                extensions: {
                    code: 'UNAUTHORIZED',
                    http: { status: 401 }
                }
            });
            const { imageDetails, ...rest } = input;

            if (images.length){
                const UniqueFilenames = [...new Set(imageDetails.map((imageDetail) => imageDetail.filename))];
                if (UniqueFilenames.length !== images.length) throw new GraphQLError('Must have unique filenames', {
                    extensions: {
                        code: 'INVALID_IMAGE_DETAILS',
                        http: { status: 422 }
                    }
                });
            }

            if (imageDetails.length){
                const MainPhotoCount = imageDetails.filter((imageDetail) => imageDetail.mainPhoto).length;
                if (MainPhotoCount !== 1) throw new GraphQLError('Must have exactly one main photo', {
                    extensions: {
                        code: 'INVALID_IMAGE_DETAILS',
                        http: { status: 422 }
                    }
                });
            }


            const character = new CharactersModel({
                creatorId: userId,
                ownerId: userId,
                ...rest
            });
            await character.save();

            const CharacterId = character._id;
            let imagesArray = [];
            
            for (const [index, image] of images.entries()) {

                const { createReadStream, filename, mimetype, encoding } = await image;
                const DetailsOfImage = imageDetails.find((imageDetail) => imageDetail.filename === filename);
                const stream = createReadStream();
      
                const SystemFileName = `${CharacterId}-${index}`;
                const FilePath = `uploads/${SystemFileName}`;

                const out = fs.createWriteStream(FilePath);
                stream.pipe(out);
                
                await finished(out);
                
                console.log(`detecting file type for ${FilePath}`);
                const magic = new Magic(MAGIC_MIME_TYPE);
                const detectFilePromise = promisify(magic.detectFile.bind(magic));

                try {
                    const result = await detectFilePromise(FilePath);
                    console.log(`file type detected as ${result}`);
                    // verify that the file is an image
                    if (!result.startsWith('image/')) {
                        console.log('file is not an image');
                        fs.unlink(FilePath, (err) => {
                            if (err) throw err;
                            console.log(`${FilePath} was deleted`);
                        });
                        // throw graphql 422 error
                        throw new GraphQLError('File must be an image', {
                            extensions: {
                                code: 'INVALID_FILE_TYPE',
                                http: { status: 422 }
                            }
                        });
                    } else {
                        imagesArray.push({ 
                            filename: SystemFileName, 
                            mainPhoto: DetailsOfImage.mainPhoto,
                            caption: DetailsOfImage.caption
                        });
                    }
                } catch (err) {
                    throw new GraphQLError(err.message, {
                        extensions: {
                            code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                            http: { status: err.extensions?.http?.status || 500 }
                        }
                    });
                }
            }

            const UpdatedChracter = await CharactersModel.findByIdAndUpdate(
                CharacterId, 
                { images: imagesArray }, 
                { new: true }
            );

            return UpdatedChracter;
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
        singleUpload: async (obj:{}, { file }) => {
            const { createReadStream, filename, mimetype, encoding } = await file;
            const stream = createReadStream();
      
            const CurrDate = Date.now();
            const FilePath = `uploads/file-${CurrDate}`;

            const out = fs.createWriteStream(FilePath);
            stream.pipe(out);
            
            await finished(out);
            
            console.log(`detecting file type for ${FilePath}`);
            const magic = new Magic(MAGIC_MIME_TYPE);
            const detectFilePromise = promisify(magic.detectFile.bind(magic));

            try {
                const result = await detectFilePromise(FilePath);
                console.log(`file type detected as ${result}`);
                // verify that the file is an image
                if (!result.startsWith('image/')) {
                    console.log('file is not an image');
                    fs.unlink(FilePath, (err) => {
                        if (err) throw err;
                        console.log(`${FilePath} was deleted`);
                    });
                    // throw graphql 422 error
                    throw new GraphQLError('File must be an image', {
                        extensions: {
                            code: 'INVALID_FILE_TYPE',
                            http: { status: 422 }
                        }
                    });
                } else {
                    return { filename, mimetype, encoding };
                }
            } catch (err) {
                throw new GraphQLError(err.message, {
                    extensions: {
                        code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                        http: { status: err.extensions?.http?.status || 500 }
                    }
                });
            }
        },
    }
};

export default resolvers