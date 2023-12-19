import { Form, useLoaderData, redirect, useNavigate } from "react-router-dom";
import { Character as CharacterType } from "@/__generated__/graphql";
import { updateCharacter } from "@/apiCalls";
import styled from "styled-components";

export async function action({ request, params }: { request: any, params: any }) {
    const formData = await request.formData();
    const updates: { [key: string]: string } = Object.fromEntries(formData)

    try {

        if (!params.characterId) {
            throw new Error("Missing characterId");
        } else if (typeof params.characterId !== "string") {
            throw new Error("Invalid characterId");
        }
        
        await updateCharacter(params.characterId, updates);
        return redirect(`/Characters/${params.characterId}`);
    } catch (error) {
        console.log(error);
        return null;
    }

  }

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
    const navigate = useNavigate();

    return (
        <StyledForm id="contact-form" method="post">
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
        <ButtonBar>
            <button type="submit">Save</button>
            <button type="button"
                onClick={() => navigate(-1)}
            >Cancel</button>
        </ButtonBar>
        </StyledForm>
    );
}