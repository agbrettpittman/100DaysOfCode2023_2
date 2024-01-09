import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { 
    Character as CharacterType, 
    CharacterImage as CharacterImageType,
    CharacterAttribute, Maybe, CharacterUpdateInput,
    CharacterImageDetailsInput
} from "@/__generated__/graphql";
import { getFile, updateCharacter } from "@/apiCalls";
import styled from "styled-components";
import { useState, useContext, useEffect } from "react";
import _, { initial } from "lodash";
import { Box, Button, Divider, TextField, Typography, ButtonGroup } from "@mui/material";
import { RootContext } from "@routes/Root";
import { getProtectedFileProps } from "@utils/utilities";
import axios from "axios";
import CharacterImageInput from "@components/CharacterImageInput";

const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    max-width: 40rem;
    padding: 0 1rem;
    box-sizing: border-box;
    gap: 30px;
`;

type CharacterImagePropsType = CharacterImageType & {
    file: File | null;
}

export default function EditCharacter() {

    const { character } = useLoaderData() as {character: CharacterType};
    const { getOwnCharacters } = useContext(RootContext)
    const [CharacterDetails, setCharacterDetails] = useState((character.details?.length) ? character.details : [{name: '', value: ''}]);
    const [CharacterImages, setCharacterImages] = useState([] as CharacterImagePropsType[]);
    const navigate = useNavigate();

    useEffect(() => {
        updateCharacterImages();
    }, [character])

    async function updateCharacterImages() {
        let newCharacterImages = [] as CharacterImagePropsType[];
        if (!character || !character.images) {
            setCharacterImages(newCharacterImages);
            return;
        }
        for (const [index, image] of character.images.entries()) {
            if (!image?.filename) continue;
            const FallBackAlt = `Image ${index + 1}`;
            const Alt = image?.caption || FallBackAlt;
            const ProtectedFileProps = await getProtectedFileProps(image?.filename || "", Alt);
            console.log(ProtectedFileProps)
            try {
                const RetrievedFile = await getFile(image.filename);
                if (!RetrievedFile.data) continue;
                const SuggestedFileName = RetrievedFile.headers['x-suggested-filename'];
                const CreatedFile = new File([RetrievedFile.data], SuggestedFileName, { type: RetrievedFile.headers['content-type'] });
                console.log(CreatedFile)
                // verify data is a file
                newCharacterImages.push({
                    ...image,
                    file: CreatedFile,
                })

            } catch (error) {
                console.log(error);
                newCharacterImages.push({
                    ...image,
                    file: null,
                })
                continue;
            }
        }
        setCharacterImages(newCharacterImages);
    }

    function changeCharacterImage(index: number, key: string, value: any) {
        if (!CharacterImages || !CharacterImages.length) return;
        if (index === undefined || !key) return;
        if (key !== 'mainPhoto' && key !== 'caption' && key !== 'file') return;
        if (!CharacterImages?.[index]) return;
        let newImages = _.cloneDeep(CharacterImages);
        if (key === 'file') {
            if (value.length) {
                newImages[index]![key] = value[0];
            } else {
                newImages[index]![key] = null;
            }
        } else if (key === 'mainPhoto') {
            if (typeof value !== 'boolean') return;
            if (value === true) {
                newImages = newImages.map((image) => {
                    image.mainPhoto = false;
                    return image;
                });
            }
            newImages[index]![key] = value;
        } else {
            if (typeof value !== 'string') return;
            newImages[index]![key] = value;
        }
        setCharacterImages(newImages);
    }

    function changeCharacterDetail(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number, key: string) {
        if (!CharacterDetails || !CharacterDetails.length) return;
        if (index === undefined || !key) return;
        if (key !== 'name' && key !== 'value') return;
        if (!CharacterDetails?.[index]) return;
        let newDetails = _.cloneDeep(CharacterDetails);
        newDetails[index]![key] = e.target.value;
        setCharacterDetails(newDetails);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const inputValues: CharacterUpdateInput = {
            name: validateFormInput('name'),
            subTitle: validateFormInput('subTitle'),
            description: validateFormInput('description'),
            details: [],
            imageDetails: [] as CharacterImageDetailsInput[],
        };
        let images = [] as File[];

        if (!inputValues.name) throw new Error("Name is required");

        function validateFormInput(input: string): string {
            const Value = formData.get(input);
            if (!Value) return '';
            if (typeof Value !== 'string') return '';
            return Value;
        }
  
        if (CharacterDetails && CharacterDetails.length) {
            inputValues.details = CharacterDetails.map( (detail: Maybe<CharacterAttribute>) => {
                if (!detail?.name || !detail?.value) {
                    return null;
                }
                return {
                    name: detail.name,
                    value: detail.value
                }
            }).filter( (detail: Maybe<CharacterAttribute>) => detail !== null);
        }

        if (CharacterImages && CharacterImages.length) {
            let newImageDetails = [] as CharacterImageDetailsInput[];
            let iterator = 0;
            CharacterImages.forEach((image) => {
                if (!image.file) return;
                const NewFileName = `file-${iterator}`;
                newImageDetails.push({
                    mainPhoto: image.mainPhoto,
                    caption: image.caption,
                    filename: NewFileName
                })
                // change the name of the file to be uploaded
                const NewFile = new File([image.file], NewFileName, {type: image.file.type});
                console.log(NewFile);
                images.push(NewFile);
                iterator++;
            })
            inputValues.imageDetails = newImageDetails;
        }

        console.log(inputValues);
        console.log(images);

        try {

            if (!character._id) {
                throw new Error("Missing characterId");
            }
            
            await updateCharacter(character._id, inputValues, images);
            getOwnCharacters();
            navigate(`/Characters/${character._id}`);
        } catch (error) {
            console.log(error);
            return null;
        }
      
    }

    console.log(CharacterImages)

    return (
        <StyledForm id="contact-form" method="post" onSubmit={handleSubmit}>
        <TextField
                placeholder="Name"
                aria-label="Name"
                name="name"
                variant="standard"
                InputProps={{ style: { fontSize: '2rem' } }}
                fullWidth
                defaultValue={character.name}
            />
            <TextField
                name="subTitle"
                placeholder="Subtitle"
                aria-label="Subtitle"
                variant="standard"
                InputProps={{ style: { fontSize: '1.5rem' } }}
                sx={{ width: '75%' }}
                defaultValue={character.subTitle}
            />
            <TextField
                name="description"
                multiline
                rows={6}
                placeholder="Description of the character..."
                fullWidth
                InputProps={{ style: { fontSize: '1rem', borderRadius: '8px' } }}
                defaultValue={character.description}
            />
            <Typography variant="h6">Details</Typography>
            {CharacterDetails && CharacterDetails.map((detail: Maybe<CharacterAttribute>, index: number) => {
                return (
                    <Box key={index} alignContent={'center'} justifyContent={'center'} display={'flex'} flexDirection={'row'} gap={'1rem'}>
                        <TextField
                            size="small"
                            placeholder="Attribute"
                            aria-label={`Attribute ${index}`}
                            defaultValue={detail?.name}
                            onChange={(e) => changeCharacterDetail(e, index, 'name')}
                        />
                        <TextField
                            size="small"
                            placeholder="Value"
                            aria-label={`Value ${index}`}
                            defaultValue={detail?.value}
                            onChange={(e) => changeCharacterDetail(e, index, 'value')}
                        />
                        <Button 
                            variant="text"
                            color="error"
                            aria-label={`Remove ${index}`}
                            onClick={() => {
                                let newDetails = _.cloneDeep(CharacterDetails);
                                newDetails.splice(index, 1);
                                setCharacterDetails(newDetails);
                            }}
                        >Remove</Button>
                    </Box>
                )
            })}
            <Button 
                variant="text"
                color="primary"
                aria-label="Add Detail"
                onClick={() => setCharacterDetails([...CharacterDetails, {name: '', value: ''}])}
            >Add Detail</Button>
            <Typography variant="h6">Pictures</Typography>
            {
                CharacterImages.map((image, index) => {
                    const CurrImageDetails = {
                        ...image,
                        mainPhoto: image.mainPhoto || false,
                        caption: image.caption || '',
                    }
                    return (
                        <CharacterImageInput
                            key={index} index={index} imageDetails={CurrImageDetails} onChange={changeCharacterImage} 
                            onRemove={(index) => {
                                let newImages = _.cloneDeep(CharacterImages);
                                newImages.splice(index, 1);
                                setCharacterImages(newImages);
                            }}
                            initialImage={image.file || undefined}
                        />
                    )
                })
            }
            <Button 
                variant="text"
                color="primary"
                aria-label="Add Picture"
                onClick={() => setCharacterImages([...CharacterImages, {
                    mainPhoto: false,
                    caption: "",
                    file: null
                }])}
            >Add Picture</Button>
            <Divider sx={{ width: '100%' }} />
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'}>
                <Button 
                    type="submit"
                    variant="contained"
                    aria-label="Save"
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    aria-label="Cancel"
                    onClick={() => navigate(-1)}
                >Cancel</Button>
            </Box>
        </StyledForm>
    );
}