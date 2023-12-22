import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { Character as CharacterType, CharacterAttribute, Maybe } from "@/__generated__/graphql";
import { updateCharacter } from "@/apiCalls";
import styled from "styled-components";
import { useState } from "react";
import _ from "lodash";

const NameInput = styled.input`
    font-size: 2rem;
    margin-bottom: 0.5rem;
`;

const StyledForm = styled(Form)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 2rem;
    width: 100%;
    max-width: 40rem;
    padding: 0 1rem;
    box-sizing: border-box;
`;

const FormLabel = styled.label`
    display: flex;
    flex-direction: ${(props: {column?: boolean}) => props.column ? 'column' : 'row'};
    align-items: ${(props: {column?: boolean}) => props.column ? 'flex-start' : 'center'};
    width: 100%;
    margin-bottom: 1rem;
    gap: 1rem;
`;

const DescriptionInput = styled.textarea`
    width: 100%;
    resize: vertical;
    box-shadow: 0px 0px 5px #0000004f;
`;

const ButtonBar = styled.div`
    display: flex;
    justify-content: flex-start;
    width: 100%;
    margin-top: 2rem;
    gap: 1rem;
`;

export default function EditCharacter() {

    const { character } = useLoaderData() as {character: CharacterType};
    const [CharacterDetails, setCharacterDetails] = useState((character.details?.length) ? character.details : [{name: '', value: ''}]);
    const navigate = useNavigate();

    function changeCharacterDetail(e: React.ChangeEvent<HTMLInputElement>, index: number, key: string) {
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
                console.log(detail)
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
      
    }

    console.log(CharacterDetails)

    return (
        <StyledForm id="contact-form" method="post" onSubmit={handleSubmit}>
        <FormLabel>
            <h1>Name: </h1>
            <NameInput
                placeholder="Name"
                aria-label="Name"
                type="text"
                name="name"
                defaultValue={character.name || ''}
            />
        </FormLabel>
        <FormLabel>
            <h3>Subtitle: </h3>
            <input
                type="text"
                name="subTitle"
                placeholder="Subtitle"
                defaultValue={character.subTitle || ''}
            />
        </FormLabel>
        <FormLabel column>
            <h3>Description: </h3>
            <DescriptionInput
                name="description"
                defaultValue={character.description || ''}
                rows={6}
            />
        </FormLabel>

        {CharacterDetails && CharacterDetails.map((detail: Maybe<CharacterAttribute>, index: number) => {
            return (
                <FormLabel key={index}>
                    <input
                        type="text"
                        defaultValue={detail?.name || ''}
                        onChange={(e) => changeCharacterDetail(e, index, 'name')}
                    />
                    <input
                        type="text"
                        defaultValue={detail?.value || ''}
                        onChange={(e) => changeCharacterDetail(e, index, 'value')}
                    />
                    <button type="button" onClick={() => {
                        let newDetails = _.cloneDeep(CharacterDetails);
                        newDetails.splice(index, 1);
                        setCharacterDetails(newDetails);
                    }}>Remove</button>
                </FormLabel>
            )
        })}

        <ButtonBar>
            <button type="button" onClick={() => setCharacterDetails([...CharacterDetails, {name: '', value: ''}])}>Add Detail</button>
        </ButtonBar>

        <ButtonBar>
            <button type="submit">Save</button>
            <button type="button"
                onClick={() => navigate(-1)}
            >Cancel</button>
        </ButtonBar>
        </StyledForm>
    );
}