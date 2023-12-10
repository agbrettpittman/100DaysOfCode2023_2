import { promisify } from "util";
import mmm from 'mmmagic'
import { finished } from 'stream/promises';
import fs from 'fs';
import { GraphQLError } from "graphql";
import { CharactersModel } from "./database/schemas.js";
import { Types as MonTypes} from "mongoose";

const { Magic, MAGIC_MIME_TYPE } = mmm;

export async function consumeFileStreams(images:[any]) {
    // generate random 32 character string
    const RandomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const TempDirectory = `uploads/tmp/${RandomString}`;
    let files = [];
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
        files
    };
}

export async function hanldeCharacterImages(CharacterId:MonTypes.ObjectId, tempDirectory:string, imageDetails:[any?] = []){
    
    const CurrentCharacter = await CharactersModel.findById(CharacterId)
    let imagesArray = CurrentCharacter?.images || [];
    const StartingIndex = imagesArray.length;
    
    try {

        const files = fs.readdirSync(tempDirectory);
        
        for (const [index, fileName] of files.entries()) {

            const FilePath = `${tempDirectory}/${fileName}`;
            
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
                    fs.renameSync(FilePath, NewFilePath);
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