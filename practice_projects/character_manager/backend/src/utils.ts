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
    const StartingIndex = imagesArray.length;
    
    try {
                
        for (const [index, image] of images.entries()) {
    
            const { createReadStream, filename, mimetype, encoding } = await image;
            const FileNumber = StartingIndex + index;
            let detailsOfImage = imageDetails.find((imageDetail) => imageDetail.filename === filename);
            if (!detailsOfImage) detailsOfImage = { mainPhoto: false, caption: '' };
            const stream = createReadStream();
    
            const SystemFileName = `${CharacterId}-${FileNumber}`;
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

        for (const [index, image] of images.entries()) {
            const FileNumber = StartingIndex + index;
            const SystemFileName = `${CharacterId}-${FileNumber}`;
            const FilePath = `uploads/${SystemFileName}`;
            try {
                fs.unlink(FilePath, (err) => {
                    if (err) throw err;
                    console.log(`${FilePath} was deleted`);
                });
            } catch (err) {
                console.log(`Error deleting ${FilePath}`);
                console.log(err);
            }
        }
        console.log(err.message);
        throw new GraphQLError(err.message, {
            extensions: {
                code: err.extensions?.code || 'INTERNAL_SERVER_ERROR',
                http: { status: err.extensions?.http?.status || 500 }
            }
        });
    }
}