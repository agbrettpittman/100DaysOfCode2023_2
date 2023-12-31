import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { Character as CharacterType, CharacterAttribute, Maybe } from "@/__generated__/graphql";
import { updateCharacter } from "@/apiCalls";
import styled from "styled-components";
import { useState } from "react";
import _ from "lodash";
import { Box, Button, Divider, TextField, Typography, ButtonGroup } from "@mui/material";

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

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        /*
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
            navigate(`/Characters/${character._id}`);
        } catch (error) {
            console.log(error);
            return null;
        }
        */
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