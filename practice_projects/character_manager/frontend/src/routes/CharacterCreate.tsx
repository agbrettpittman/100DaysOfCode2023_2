import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { Character as CharacterType, CharacterAttribute, Maybe, CharacterCreateInput } from "@/__generated__/graphql";
import { createCharacter, updateCharacter } from "@/apiCalls";
import styled from "styled-components";
import { useState, useContext } from "react";
import _ from "lodash";
import { Box, Button, Divider, TextField, Typography, ButtonGroup } from "@mui/material";
import { RootContext } from "@routes/Root";
import FileUploader from "@/components/FileUploader";

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

export default function CharacterCreate() {

    const [CharacterDetails, setCharacterDetails] = useState([{name: '', value: ''}]);
    const [CharacterImages, setCharacterImages] = useState([{
        mainPhoto: true,
        caption: "",
        file: null as File | null
    }]);
    const { getOwnCharacters } = useContext(RootContext)
    const navigate = useNavigate();

    function changeCharacterDetail(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number, key: string) {
        if (!CharacterDetails || !CharacterDetails.length) return;
        if (index === undefined || !key) return;
        if (key !== 'name' && key !== 'value') return;
        if (!CharacterDetails?.[index]) return;
        let newDetails = _.cloneDeep(CharacterDetails);
        newDetails[index]![key] = e.target.value;
        setCharacterDetails(newDetails);
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
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const inputValues: CharacterCreateInput = {
            name: validateFormInput('name'),
            subTitle: validateFormInput('subTitle'),
            description: validateFormInput('description'),
            details: []
        };
  
        function validateFormInput(input: string): string {
            const Value = formData.get(input);
            if (!Value) return '';
            if (typeof Value !== 'string') return '';
            return Value;
        }

        if (!inputValues.name) throw new Error("Name is required");

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

        try {
            const NewCharacter = await createCharacter(inputValues);
            if (!NewCharacter?.data?.createCharacter) throw new Error("Character creation failed")
            const NewCharacterId = NewCharacter.data.createCharacter._id;
            getOwnCharacters();
            navigate(`/Characters/${NewCharacterId}`);
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    return (
        <StyledForm id="contact-form" method="post" onSubmit={handleSubmit}>
            <TextField
                placeholder="Name"
                aria-label="Name"
                name="name"
                variant="standard"
                InputProps={{ style: { fontSize: '2rem' } }}
                fullWidth
            />
            <TextField
                name="subTitle"
                placeholder="Subtitle"
                aria-label="Subtitle"
                variant="standard"
                InputProps={{ style: { fontSize: '1.5rem' } }}
                sx={{ width: '75%' }}
            />
            <TextField
                name="description"
                multiline
                rows={6}
                placeholder="Description of the character..."
                fullWidth
                InputProps={{ style: { fontSize: '1rem', borderRadius: '8px' } }}
            />
            <Typography variant="h6">Details</Typography>
            {CharacterDetails && CharacterDetails.map((detail: Maybe<CharacterAttribute>, index: number) => {
                return (
                    <Box key={index} alignContent={'center'} justifyContent={'center'} display={'flex'} flexDirection={'row'} gap={'1rem'}>
                        <TextField
                            size="small"
                            placeholder="Attribute"
                            aria-label={`Attribute ${index}`}
                            onChange={(e) => changeCharacterDetail(e, index, 'name')}
                        />
                        <TextField
                            size="small"
                            placeholder="Value"
                            aria-label={`Value ${index}`}
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
                    return (
                        <Box key={index} alignContent={'center'} justifyContent={'center'} display={'flex'} flexDirection={'row'} gap={'1rem'}>
                            <FileUploader
                                label={`Image ${index}`}
                                onChange={(files) => changeCharacterImage(index, 'file', files)}
                            />
                            <TextField
                                size="small"
                                placeholder="Caption"
                                aria-label={`Caption ${index}`}
                                onChange={(e) => changeCharacterImage(index, 'caption', e.target.value)}
                            />
                            <Button 
                                variant="text"
                                color="error"
                                aria-label={`Remove ${index}`}
                                onClick={() => {
                                    let newImages = _.cloneDeep(CharacterImages);
                                    newImages.splice(index, 1);
                                    setCharacterImages(newImages);
                                }}
                            >Remove</Button>
                        </Box>
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