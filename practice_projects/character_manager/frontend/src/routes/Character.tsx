import { Form, useFetcher, useLoaderData } from "react-router-dom";
import { getCharacter, updateCharacter } from "@/apiCalls";
import { Character as CharacterType, CharacterImage as CharacterImageType } from "@/__generated__/graphql";
import styled from "styled-components";
import { Eye, EyeOff, Trash2 } from "@styled-icons/feather"
import { Box, Button, Typography } from "@mui/material";
import ProtectedImage from "@components/ProtectedImage";
import { Edit } from "@styled-icons/fluentui-system-regular/Edit";
import Lightbox from "yet-another-react-lightbox";
import {Captions, Thumbnails} from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { useEffect, useState } from "react";
import { getProtectedFileProps } from "@utils/utilities";


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

export async function action() {
    console.log("need to make this work");
}

type CharacterImagePropsType = CharacterImageType & {
    src: string;
    alt: string;
    title: string;
    onClick: () => void;
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

const CharacterImage = styled.img`
    max-height: 50vh;
    cursor: pointer;

    border: 2px solid ${({ theme }) => theme.palette.background.default};
    padding: 2px;
    box-sizing: border-box;
    :hover {
        border-color: ${({ theme }) => theme.palette.primary.main};
    }
`

export default function Character() {
    const { character } = useLoaderData() as {character: CharacterType};
    const [LightboxPosition, setLightboxPosition] = useState(-1);
    const [CharacterImages, setCharacterImages] = useState([] as CharacterImagePropsType[]);

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
            const FallBackAlt = `Image ${index + 1}`;
            const Alt = image?.caption || FallBackAlt;
            const ProtectedFileProps = await getProtectedFileProps(image?.filename || "", Alt);
            const onClick = () => setLightboxPosition(index);
            newCharacterImages.push({
                ...image,
                ...ProtectedFileProps,
                onClick,
                title: Alt,
            })
        }
        setCharacterImages(newCharacterImages);
    }

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
                            aria-label="edit"
                        >
                            <Edit/>
                        </EditButton>
                    </Form>
                    <Form action="destroy" onSubmit={handleDestroy}>
                        <DestroyButton
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
                    { CharacterImages.length > 0 && CharacterImages.map((image, index) => 
                        <CharacterImage {...image} />
                    )}
                </Box>
            </div>
            <Lightbox
                open={LightboxPosition > -1}
                plugins={[Captions, Thumbnails]}
                index={LightboxPosition}
                close={() => setLightboxPosition(-1)}
                slides={CharacterImages}
            />
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