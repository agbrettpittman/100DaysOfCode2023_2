import { Form, useFetcher, useLoaderData } from "react-router-dom";
import { getCharacter, updateCharacter } from "@/apiCalls";
import { Character as CharacterType } from "@/__generated__/graphql";
import styled from "styled-components";
import { Eye, EyeOff, Trash2 } from "@styled-icons/feather"
import { Box, Button, Typography } from "@mui/material";
import ProtectedImage from "@components/ProtectedImage";
import { Edit } from "@styled-icons/fluentui-system-regular/Edit";

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
    gap: 20px;

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
    color: #b9b9b9;
    :hover {
        color: ${({ theme }) => theme.palette.info.main};
    }
`;

const EditButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 1.5em;
    color: #cfcfcf;
    :hover {
        color: ${({ theme }) => theme.palette.primary.main};
    }
`

const DestroyButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 1.5em;
    color: #cfcfcf;
    :hover {
        color: ${({ theme }) => theme.palette.error.main};
    }
`

export default function Character() {
    const { character } = useLoaderData() as {character: CharacterType};

    console.log(character)

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
                    <Form action="edit">
                        <EditButton
                            name="edit"
                            aria-label="edit"
                        >
                            <Edit/>
                        </EditButton>
                    </Form>
                    <Form action="destroy" onSubmit={handleDestroy}>
                        <DestroyButton
                            name="destroy"
                            aria-label="destroy"
                        >
                            <Trash2/>
                        </DestroyButton>
                    </Form>
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
                <Typography variant="h6">Pictures</Typography>
                <Box display={'flex'} flexDirection={'row'} flexWrap={'wrap'} gap={'1rem'}>
                    { character && character.images && character.images.map((image, index) => {
                        const FallBackAlt = `Image ${index + 1}`;
                        const Alt = image?.caption || FallBackAlt;
                        return (
                            <ProtectedImage fileId={image?.filename || ""} alt={Alt} key={index} />
                        )
                    })}
                </Box>
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