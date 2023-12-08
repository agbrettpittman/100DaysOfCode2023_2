import { promisify } from "util";
import mmm from 'mmmagic'
import { finished } from 'stream/promises';
import fs from 'fs';
import { GraphQLError } from "graphql";
import { CharactersModel } from "./database/schemas.js";
import { Types as MonTypes} from "mongoose";

const { Magic, MAGIC_MIME_TYPE } = mmm;

export async function handleImageUploads(CharacterId:MonTypes.ObjectId, images:[any], imageDetails:[any?] = []){
    

    const CurrentCharacter = await CharactersModel.findById(CharacterId)
    let imagesArray = CurrentCharacter?.images || [];
    let filesWritten = []
    const StartingIndex = imagesArray.length;

    // write all files to disk
    
    try {
        for (const [index, image] of images.entries()) {
    
            const { createReadStream, filename, mimetype, encoding } = await image;
            const FileNumber = StartingIndex + index;
            const stream = createReadStream();
    
            const SystemFileName = `${CharacterId}-${FileNumber}`;
            const FilePath = `uploads/${SystemFileName}`;
    
            const out = fs.createWriteStream(FilePath);
            stream.pipe(out);
            
            await finished(out);

            filesWritten.push({SystemFileName, filename});
        }
    } catch (err) {

        for (const FileWritten of filesWritten) {
            const FilePath = `uploads/${FileWritten.SystemFileName}`;
            fs.unlink(FilePath, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(`${FilePath} was deleted`);
            });
        }

        throw new GraphQLError(err.message, {
            extensions: {
                code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                http: { status: err.extensions?.http?.status || 500 }
            }
        });
    }
    
    try {
                
        for (const {SystemFileName, filename} of filesWritten) {
            
            console.log(`detecting file type for ${SystemFileName}`);
            const magic = new Magic(MAGIC_MIME_TYPE);
            const detectFilePromise = promisify(magic.detectFile.bind(magic));
            let detailsOfImage = imageDetails.find((imageDetail) => imageDetail.filename === filename);
            if (!detailsOfImage) detailsOfImage = { mainPhoto: false, caption: '' };
    
            try {
                const result = await detectFilePromise(`uploads/${SystemFileName}`);
                console.log(`file type detected as ${result}`);
                // verify that the file is an image
                if (!result.startsWith('image/')) {
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
                        mainPhoto: detailsOfImage.mainPhoto,
                        caption: detailsOfImage.caption
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
        
        const UpdatedCharacter = await CharactersModel.findByIdAndUpdate(
            CharacterId, 
            { images: imagesArray }, 
            { new: true }
        );
    
        return UpdatedCharacter;

    } catch (err) {
        
        for (const FileWritten of filesWritten) {
            const FilePath = `uploads/${FileWritten.SystemFileName}`;
            fs.unlink(FilePath, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(`${FilePath} was deleted`);
            });
        }

        console.log(err.message);
        console.log("got past loop")

        throw new GraphQLError(err.message, {
            extensions: {
                code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                http: { status: err.extensions?.http?.status || 500 }
            }
        });
    }
}