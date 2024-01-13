import { Form, useFetcher, useLoaderData, useParams } from "react-router-dom";
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
import _ from "lodash";


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

type CharacterStateType = CharacterType & {
    images: CharacterImagePropsType[]
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
    const { characterId } = useParams();
    const [LightboxPosition, setLightboxPosition] = useState(-1);
    const [character, setCharacter] = useState<CharacterStateType>({} as CharacterStateType);

    useEffect(() => {
        getCharacterData();
    }, [characterId])

    async function getCharacterData() {
        if (!characterId) return;
        const CharacterResponse = await getCharacter(characterId);
        if (CharacterResponse?.data?.character?._id) {
            let character = CharacterResponse.data.character;
            setCharacter({
                ...character,
                images: await processCharacterImages(character),
            });
        }
    }

    async function processCharacterImages(character: CharacterType): Promise<CharacterImagePropsType[]> {
        if (!character.images?.length) return [];
        let newCharacterImages = [];
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
        return newCharacterImages
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

    async function toggleCharacterPrivacy() {
        const newCharacterResponse = await updateCharacter(character._id, { private: !character.private });
        if (newCharacterResponse?.data?.updateCharacter?.private !== undefined) {
            const newCharacter = newCharacterResponse.data.updateCharacter;
            setCharacter({
                ...newCharacter,
                images: await processCharacterImages(newCharacter),
            })
        }
    }

    return (
        <div id="character">
            <Box display={'flex'} flexDirection={'column'} gap={'1rem'}>
                <CharacterTitle>
                    {character.name || <i>No Name</i>}
                    <PrivateButton
                        name="private"
                        onClick={toggleCharacterPrivacy}
                        aria-label={
                            character.private
                            ? "Make Public"
                            : "Make Private"
                        }
                    >
                        {character.private ? <Eye /> : <EyeOff />}
                    </PrivateButton>
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

                {/*character.subTitle && <SubTitle>{character.subTitle}</SubTitle>*/}
                {character.subTitle && <Typography variant={'h5'} component={'h2'} color={'textSecondary'} sx={{mt: -1}}
                >{character.subTitle}</Typography>}

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
                
                {character.images?.length > 0 &&
                    <Box display={'flex'} flexDirection={'row'} flexWrap={'wrap'} gap={'0px'}>
                        {character.images.map((image:CharacterImagePropsType, index) => {
                            const CharacterImageProps = {
                                src: image.src,
                                alt: image.alt,
                                title: image.title,
                                onClick: image.onClick,
                            }
                            return <CharacterImage {...CharacterImageProps} />
                        })}
                    </Box>
                }
            </Box>
            <Lightbox
                open={LightboxPosition > -1}
                plugins={[Captions, Thumbnails]}
                index={LightboxPosition}
                close={() => setLightboxPosition(-1)}
                slides={character.images || []}
            />
        </div>
    );
}