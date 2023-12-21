import { Form, useFetcher, useLoaderData } from "react-router-dom";
import { getCharacter, updateCharacter } from "@/apiCalls";
import { Character as CharacterType } from "@/__generated__/graphql";
import styled from "styled-components";
import { Eye, EyeOff } from "@styled-icons/feather"

export async function loader({ params }: { params:any}) {
    const NoCharacterError = new Response("No character returned", {
        status: 404,
        statusText: "Character Not Found",
    });
    try {
        const CharacterResponse = await getCharacter(params.characterId);
        if (!CharacterResponse?.data?.character?._id) {
            throw NoCharacterError
        }
        return { character: CharacterResponse.data.character };
    } catch (error) {
        console.log(error);
        throw NoCharacterError
    }
}

export async function action({ request, params }: { request: any, params: any }) {
    try {
        let formData = await request.formData();
        const UpdatedCharacter = await updateCharacter(params.characterId, {
            private: formData.get("private") === "true",
        });
        if (!UpdatedCharacter?.data?.updateCharacter?._id) throw new Error("No character returned");
        console.log(UpdatedCharacter.data.updateCharacter)
        return { character: UpdatedCharacter.data.updateCharacter };
    } catch (error) {
        console.log(error);
        return { character: {} };
    }
}

const CharacterTitle = styled.h1`
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;

    form {
        display: flex;
        align-items: center;
    }
`;

const SubTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: normal;
    margin: 0;
`;

const PrivateButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 1.5em;
    color: #0074c9;
    :hover {
        color: #60829b;
    }
`;

export default function Character() {
    const { character } = useLoaderData() as {character: CharacterType};

    function handleDestroy(event: React.FormEvent<HTMLFormElement>) {
        if (
            !confirm(
            "Please confirm you want to delete this record."
            )
        ) {
            event.preventDefault();
        }
    }

    return (
        <div id="character">
            <div>
                <CharacterTitle>
                    {character.name || <i>No Name</i>}
                    <Favorite character={character} />
                </CharacterTitle>

                {character.subTitle && (
                    <SubTitle>
                        {character.subTitle}
                    </SubTitle>
                )}

                {character.description && (
                    <p>{character.description}</p>
                )}

                {character.details?.length && (
                    <ul>
                        {character.details.map((detail) => {
                            if (!detail?.name) return null;
                            return (
                                <li key={detail.name}>
                                    <strong>{detail.name}: </strong>
                                    {detail.value || <i>No Value</i>}
                                </li>
                            )
                        })}
                    </ul>
                )}
                <div>
                <Form action="edit">
                    <button type="submit">Edit</button>
                </Form>
                <Form method="post" action="destroy" onSubmit={handleDestroy}>
                    <button type="submit">Delete</button>
                </Form>
                </div>
            </div>
        </div>
    );
}

function Favorite({ character }: { character: CharacterType }) {
    const { Form:FetcherForm, formData:FetcherFormData } = useFetcher()
    let characterIsPrivate = character.private;

    if (FetcherFormData) {
        characterIsPrivate = FetcherFormData.get("private") === "true";
    }

    return (
        <FetcherForm method="post">
            <PrivateButton
                name="private"
                value={characterIsPrivate ? "false" : "true"}
                aria-label={
                    characterIsPrivate
                    ? "Make Public"
                    : "Make Private"
                }
            >
                {characterIsPrivate ? <Eye /> : <EyeOff />}
            </PrivateButton>
        </FetcherForm>
    );
}