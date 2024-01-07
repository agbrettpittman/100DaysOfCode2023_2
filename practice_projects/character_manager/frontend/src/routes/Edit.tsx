import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { 
    Character as CharacterType, 
    CharacterImage as CharacterImageType,
    CharacterAttribute, Maybe,  
} from "@/__generated__/graphql";
import { getFile, updateCharacter } from "@/apiCalls";
import styled from "styled-components";
import { useState, useContext, useEffect } from "react";
import _ from "lodash";
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
        const updates: { [key: string]: any } = {};
  
        formData.forEach((value, key) => {
            if (typeof value === 'string' || value instanceof File) {
                updates[key] = value.toString();
            }
        });

        if (CharacterDetails && CharacterDetails.length) {
            updates.details = CharacterDetails.map( (detail: Maybe<CharacterAttribute>) => {
                if (!detail?.name || !detail?.value) {
                    return null;
                }
                return {
                    name: detail.name,
                    value: detail.value
                }
            }).filter( (detail: Maybe<CharacterAttribute>) => detail !== null);
        }

        try {

            if (!character._id) {
                throw new Error("Missing characterId");
            }
            
            await updateCharacter(character._id, updates);
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
                            }
                        }/>
                    )
                })
            }
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