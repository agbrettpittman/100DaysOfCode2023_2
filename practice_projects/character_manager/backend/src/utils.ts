import { promisify } from "util";
import mmm from 'mmmagic'
import { finished } from 'stream/promises';
import fs from 'fs';
import { GraphQLError } from "graphql";
import { CharactersModel } from "./database/schemas.js";
import { Types as MonTypes} from "mongoose";
import _ from "lodash";

const { Magic, MAGIC_MIME_TYPE } = mmm;

export async function consumeFileStreams(images:[any],imageDetails:any[] = []) {
    try {
        // generate random 32 character string
        const RandomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const TempDirectory = `uploads/tmp/${RandomString}`;
        let files:[any?] = [];
        if (!fs.existsSync(TempDirectory)) {
            fs.mkdirSync(TempDirectory);
        }
        for (const [index, image] of images.entries()) {
            const { createReadStream, filename } = await image;
            const stream = createReadStream();
            const SysFileName = `file-${index}`
            const out = fs.createWriteStream(`${TempDirectory}/${SysFileName}`);
            stream.pipe(out);
            await finished(out);
            files.push({ 
                origFileName: filename,
                sysFileName: SysFileName,
            });
        }
        return { 
            directory: TempDirectory,
            files,
        };

    } catch (err) {
        throw new GraphQLError(err.message, {
            extensions: {
                code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                http: { status: err.extensions?.http?.status || 500 }
            }
        });
    }
}

export async function validateCharacterImages(
    tempDirectory:string, fileNameMappings:any[], imageDetails:any[] = [], characterId:MonTypes.ObjectId = null
) {
    try {
        const files = fs.readdirSync(tempDirectory);

        let mainPhotoFound = false;

        if (characterId) {
            const CurrentCharacter = await CharactersModel.findById(characterId);
            const CurrentImages = CurrentCharacter?.images || [];
            mainPhotoFound = CurrentImages.some((image) => image.mainPhoto);
        }

        // verify that any image details only correspond to one file
        imageDetails.forEach((imageDetailEntry) => {
            const { filename } = imageDetailEntry;
            const MatchingMappings = fileNameMappings.filter((fileNameMapping) => fileNameMapping.origFileName === filename);
            if (MatchingMappings.length > 1) {
                throw new GraphQLError('Multiple files found for the same details entry', {
                    extensions: {
                        code: 'INVALID_FILE_NAME',
                        http: { status: 422 }
                    }
                });
            }
            if (imageDetailEntry.mainPhoto) {
                if (mainPhotoFound) {
                    throw new GraphQLError('Multiple main photos found', {
                        extensions: {
                            code: 'INVALID_FILE_NAME',
                            http: { status: 422 }
                        }
                    });
                } else {
                    mainPhotoFound = true;
                }
            }
        })

        // validate the files themselves
        for (const [index, fileName] of files.entries()) {
            const FilePath = `${tempDirectory}/${fileName}`;
            console.log(`detecting file type for ${FilePath}`);

            // Verify that the file is an image
            const magic = new Magic(MAGIC_MIME_TYPE);
            const detectFilePromise = promisify(magic.detectFile.bind(magic));
            const DetectedMIME = await detectFilePromise(FilePath);
            console.log(`file type detected as ${DetectedMIME}`);
            if (!DetectedMIME.startsWith('image/')) {
                console.log('file is not an image');
                // throw graphql 422 error
                throw new GraphQLError('Files must be images', {
                    extensions: {
                        code: 'INVALID_FILE_TYPE',
                        http: { status: 422 }
                    }
                });
            }

            // verify that there is only one image detail entry for the file
            const { origFileName } = fileNameMappings.find((fileNameMapping) => fileNameMapping.sysFileName === fileName);
            let detailsOfImage = imageDetails.filter((imageDetailEntry) => imageDetailEntry.filename === origFileName);

            if (detailsOfImage.length > 1) {
                throw new GraphQLError('Multiple image details found for the same file', {
                    extensions: {
                        code: 'INVALID_FILE_NAME',
                        http: { status: 422 }
                    }
                });
            }

        }

        return imageDetails.map((imageDetailEntry) => {
            const { filename } = imageDetailEntry;
            const MatchingMappings = fileNameMappings.filter((fileNameMapping) => fileNameMapping.origFileName === filename);
            return {
                ...imageDetailEntry,
                filename: MatchingMappings[0].sysFileName
            }
        });

    } catch (err) {
        throw new GraphQLError(err.message, {
            extensions: {
                code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                http: { status: err.extensions?.http?.status || 500 }
            }
        });
    }
}

export async function deleteAllCharacterImages(CharacterId:MonTypes.ObjectId) {
    const CurrentCharacter = await CharactersModel.findById(CharacterId)
    let imagesArray = CurrentCharacter?.images || [];
    let newImagesArray = imagesArray.filter((image, index) => {
        try {
            const FilePath = `uploads/${image.filename}`;
            try {
                fs.unlinkSync(FilePath);
            } catch (err) {
                // if the file doesn't exist, that's fine
                if (err.code !== 'ENOENT') throw err;
                else console.log(`file ${FilePath} doesn't exist`);
            } 
            console.log(`deleting file details for image ${index}`)
            return false;
        } catch (err) {
            console.log(err);
            return true;
        }
    })

    try {
        const UpdatedCharacter = await CharactersModel.findByIdAndUpdate(
            CharacterId, 
            { images: newImagesArray }, 
            { new: true }
        );
        return UpdatedCharacter;
    } catch (err) {
        throw new GraphQLError(err.message, {
            extensions: {
                code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                http: { status: err.extensions?.http?.status || 500 }
            }
        });
    }

}


export async function hanldeCharacterImages(
    CharacterId:MonTypes.ObjectId, tempDirectory:string, imageDetails:[any?] = []
){
    
    const CurrentCharacter = await CharactersModel.findById(CharacterId)
    let imagesArray = CurrentCharacter?.images || [];
    const StartingIndex = imagesArray.length;
    
    try {

        const files = fs.readdirSync(tempDirectory);
        
        for (const [index, fileName] of files.entries()) {

            const FilePath = `${tempDirectory}/${fileName}`;
            console.log(imageDetails)
            console.log(fileName)
            let detailsOfImage = imageDetails.find((imageDetailEntry) => imageDetailEntry.filename === fileName);

            if (!detailsOfImage) {
                detailsOfImage = {
                    mainPhoto: false,
                    caption: ''
                }
            }

            const SystemFileName = `${CharacterId}-${StartingIndex + index}`;

            imagesArray.push({ 
                filename: SystemFileName, 
                mainPhoto: detailsOfImage.mainPhoto,
                caption: detailsOfImage.caption
            });

            const NewFilePath = `uploads/${SystemFileName}`;
            console.log(`moving ${FilePath} to ${NewFilePath}`);
            fs.renameSync(FilePath, NewFilePath);
        }
    
        const UpdatedCharacter = await CharactersModel.findByIdAndUpdate(
            CharacterId, 
            { images: imagesArray }, 
            { new: true }
        );
    
        return UpdatedCharacter;

    } catch (err) {
        throw new GraphQLError(err.message, {
            extensions: {
                code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                http: { status: err.extensions?.http?.status || 500 }
            }
        });
    }
}