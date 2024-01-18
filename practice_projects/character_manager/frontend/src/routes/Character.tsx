import { Form, useFetcher, useLoaderData, useParams } from "react-router-dom";
import { deleteCharacter, getCharacter, updateCharacter } from "@/apiCalls";
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
import { getProtectedFileProps, parseAccessToken } from "@utils/utilities";
import { CharacterMainPhoto } from "@components/StyleLib";
import _ from "lodash";

type CharacterImagePropsType = CharacterImageType & {
    src: string;
    alt: string;
    title: string;
    onClick: () => void;
}

type CharacterStateType = CharacterType & {
    images: CharacterImagePropsType[]
}

const Wrapper = styled.div`
    color: ${({ theme }) => theme.palette.text.primary};
`

const StyledCharacterMainPhoto = styled(CharacterMainPhoto)`
    grid-area: mainPhoto;
`

const CharacterHeader = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
        "mainPhoto characterTitle"
        "mainPhoto characterSubTitle";
    align-items: center;
    column-gap: 1rem;
`;

const CharacterTitle = styled.h1`
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 20px;
    grid-area: characterTitle;
    form {
        display: flex;
        align-items: center;
    }
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
    const ParsedAccessToken = parseAccessToken();

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

    async function handleDeletion() {
        const ConfirmationText = `Please confirm you want to delete ${character.name || "This Character"}.`;
        if (confirm(ConfirmationText)) {
            const CharacterDeletion = await deleteCharacter(character._id);
            if (CharacterDeletion?.data?.deleteCharacter) {
                alert("Character Deleted");
                window.location.href = "/";
            } else {
                alert("Failed to delete character");
            }
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

    const MainPhoto = character.images?.length > 0 && character.images.find((image:CharacterImagePropsType) => image?.mainPhoto && image.src);

    return (
        <Wrapper id="character">
            <Box display={'flex'} flexDirection={'column'} gap={'1rem'}>
                <CharacterHeader>
                    {MainPhoto && 
                        <StyledCharacterMainPhoto {...{
                            src: MainPhoto.src,
                            alt: MainPhoto.alt,
                            title: MainPhoto.title,
                            onClick: MainPhoto.onClick,
                        }} />
                    }
                    <CharacterTitle>
                        {character.name || <i>No Name</i>}
                        {character.owner?._id === ParsedAccessToken?.userId && (
                            <>
                                <PrivateButton
                                    name="private"
                                    onClick={toggleCharacterPrivacy}
                                    aria-label={
                                        character.private
                                        ? "Make Public"
                                        : "Make Private"
                                    }
                                >
                                    {!character.private ? <Eye /> : <EyeOff />}
                                </PrivateButton>
                                <Form action="edit">
                                    <EditButton
                                        aria-label="edit"
                                    >
                                        <Edit/>
                                    </EditButton>
                                </Form>
                                <DestroyButton
                                    aria-label="delete"
                                    onClick={handleDeletion}
                                    name="delete"
                                >
                                    <Trash2/>
                                </DestroyButton>
                            </>
                        )}
                    </CharacterTitle>

                    {character.subTitle && 
                        <Typography variant={'h5'} component={'h2'} color={'textSecondary'} sx={{mt: -1, gridArea: 'characterSubTitle'}}>
                            {character.subTitle}
                        </Typography>
                    }
                </CharacterHeader>

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
                    <Box display={'flex'} flexDirection={'row'} flexWrap={'wrap'} gap={'0px'} alignItems={'center'}>
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
        </Wrapper>
    );
}