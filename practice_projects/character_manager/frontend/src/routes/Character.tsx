import { Form, useParams } from "react-router-dom";
import { deleteCharacter, getCharacter, forkCharacter } from "@/apiCalls";
import { Character as CharacterType, CharacterImage as CharacterImageType } from "@/__generated__/graphql";
import styled from "styled-components";
import { Trash2 } from "@styled-icons/feather"
import { Box, Typography, useTheme } from "@mui/material";
import { Edit } from "@styled-icons/fluentui-system-regular/Edit";
import Lightbox from "yet-another-react-lightbox";
import {Captions, Thumbnails} from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { useEffect, useState, useContext } from "react";
import { getProtectedFileProps, parseAccessToken } from "@utils/utilities";
import { CharacterMainPhoto } from "@components/StyleLib";
import { CallSplit } from "styled-icons/material-rounded";
import { useCustomNavigate } from "@utils/utilities";
import { RootContext } from "@routes/Root";
import { transparentize } from "polished";
import _ from "lodash";

type CharacterImagePropsType = CharacterImageType & {
    src: string;
    alt: string;
    title: string;
    onClick: () => void;
    gridRows: number;
    gridColumns: number;
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

const CharacterHeaderWrapper = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
        "mainPhoto characterTitle"
        "mainPhoto characterSubTitle";
    align-items: center;
    column-gap: 1rem;
`;

const CharacterActionButton = styled.button<{ hoverColor: string }>`
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 1.5em;
    color: ${({ theme }) => transparentize(0.7,theme.palette.text.primary)};
    :hover {
        color: ${({ hoverColor }) => hoverColor};
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

const ImageGridImg = styled.div<{ src: string, rows: number, columns: number }>`
    width: 100%;
    cursor: pointer;
    border: 2px solid ${({ theme }) => theme.palette.background.default};
    background-image: url(${({ src }) => src});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 8px;
    padding: 2px;
    box-sizing: border-box;
    grid-row: span ${({ rows }) => rows || 1};
    grid-column: span ${({ columns }) => columns || 1};
    :hover {
        border-color: ${({ theme }) => theme.palette.primary.main};
    }
`

const ImageGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px);
    grid-auto-rows: 100px;
    grid-gap: 5px;
    grid-auto-flow: dense;
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

    function loadImagePromise(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = src;
            image.onload = () => resolve(image);
            image.onerror = () => reject(image);
        })
    }

    async function processCharacterImages(character: CharacterType): Promise<CharacterImagePropsType[]> {
        if (!character.images?.length) return [];
        let newCharacterImages = [];
        for (const [index, image] of character.images.entries()) {
            const FallBackAlt = `Image ${index + 1}`;
            const Alt = image?.caption || FallBackAlt;
            const ProtectedFileProps = await getProtectedFileProps(image?.filename || "", Alt);
            const onClick = () => setLightboxPosition(index);
            let gridRows = 1;
            let gridColumns = 1;
            // get image height and width
            try {
                const LoadedImage = await loadImagePromise(ProtectedFileProps.src);
                gridRows = Math.floor(LoadedImage.height / 100);
                gridColumns = Math.floor(LoadedImage.width / 100);

                if (gridRows > 4 || gridColumns > 4) {
                    const DivisionFactor = Math.ceil(Math.max(gridRows, gridColumns) / 4);
                    gridColumns = Math.round(gridColumns / DivisionFactor);
                    gridRows = Math.round(gridRows / DivisionFactor);
                }
            }
            catch (err) {
                console.log(err);
            }

            newCharacterImages.push({
                ...image,
                ...ProtectedFileProps,
                onClick,
                title: Alt,
                gridRows,
                gridColumns,
            })
        }
        return newCharacterImages
    }
    return (
        <Wrapper>
            <Box display={'flex'} flexDirection={'column'} gap={'1rem'}>
                <CharacterHeader character={character} onChange={getCharacterData} />
                {character.description && <p>{character.description}</p>}
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
                    <ImageGrid>
                        {character.images
                            .filter((image:CharacterImagePropsType) => !image?.mainPhoto)
                            .map((image:CharacterImagePropsType, index) => {
                                const CharacterImageProps = {
                                    src: image.src,
                                    alt: image.alt,
                                    title: image.title,
                                    onClick: image.onClick,
                                    rows: image.gridRows,
                                    columns: image.gridColumns,
                                }
                                return <ImageGridImg {...CharacterImageProps} />
                            }
                        )}
                    </ImageGrid>
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

function CharacterHeader({ character, onChange }: { character: CharacterStateType, onChange: () => void }) {
    const ParsedAccessToken = parseAccessToken();
    const MainPhoto = (character.images?.length > 0) ? character.images.find((image:CharacterImagePropsType) => image?.mainPhoto && image.src) : undefined;
    const MainPhotoProps = {
        src: MainPhoto?.src,
        alt: MainPhoto?.alt,
        title: MainPhoto?.title,
        onClick: MainPhoto?.onClick,
    }

    return (
        <CharacterHeaderWrapper>
            {MainPhoto && <StyledCharacterMainPhoto {...MainPhotoProps} />}
            <Box display={'flex'} flexDirection={'row'} gap={'1rem'} gridArea={'characterTitle'} alignItems={'center'} sx={{ mb: 2}}>
                <Typography component="h1" variant="h4" fontStyle={(character.name) ? "normal" : "italic"}>
                    {character.name || "No Name"}
                </Typography>
                {(character.owner?._id !== ParsedAccessToken?.userId) ? <Typography variant={'h5'} component={'h2'} color={'textSecondary'}>({`@${character.owner?.userName}` || "Unknown"})</Typography> : null}
                <CharacterMainControls character={character} onChange={onChange} />
            </Box>

            {character.subTitle && 
                <Typography variant={'h5'} component={'h2'} color={'textSecondary'} sx={{mt: -1, gridArea: 'characterSubTitle'}}>
                    {character.subTitle}
                </Typography>
            }
        </CharacterHeaderWrapper>
    )
}

function CharacterMainControls({ character, onChange }: { character: CharacterStateType, onChange: () => void }) {

    const ParsedAccessToken = parseAccessToken();
    const { navigate } = useCustomNavigate();
    const { getOwnCharacters } = useContext(RootContext)
    const Theme = useTheme();

    async function handleDeletion() {
        const ConfirmationText = `Please confirm you want to delete ${character.name || "This Character"}.`;
        if (confirm(ConfirmationText)) {
            const CharacterDeletion = await deleteCharacter(character._id);
            if (CharacterDeletion?.data?.deleteCharacter) {
                getOwnCharacters();
                alert("Character Deleted");
                navigate("/");
            } else {
                alert("Failed to delete character");
            }
        }
    }

    async function handleFork() {
        const ConfirmationText = `Are you sure you want to fork ${character.name || "this character"}?`
        if (!confirm(ConfirmationText)) return;
        try {
            const ForkedCharacter = await forkCharacter(character._id);
            if (ForkedCharacter?.data?.forkCharacter?._id) {
                getOwnCharacters();
                navigate(`/Characters/${ForkedCharacter.data.forkCharacter._id}`);
            } else alert("Failed to fork character");
        } catch (err) {
            console.log(err);
            alert("Failed to fork character");
        }
    }

    if (character.owner?._id === ParsedAccessToken?.userId) {
        return (
            <>
                <CharacterActionButton
                    aria-label="edit"
                    hoverColor={Theme.palette.primary.main}
                    onClick={() => navigate(`edit`)}
                >
                    <Edit/>
                </CharacterActionButton>
                <CharacterActionButton
                    aria-label="delete"
                    onClick={handleDeletion}
                    name="delete"
                    hoverColor={Theme.palette.error.main}
                >
                    <Trash2/>
                </CharacterActionButton>
                <CharacterActionButton
                    aria-label="fork character"
                    name="fork"
                    onClick={handleFork}
                    hoverColor={Theme.palette.secondary.light}
                >
                    <CallSplit/>
                </CharacterActionButton>
            </>
        )
    } else if (character.forkable) {
        return (
            <CharacterActionButton
                aria-label="fork character"
                name="fork"
                onClick={handleFork}
                hoverColor={Theme.palette.secondary.light}
            >
                <CallSplit/>
            </CharacterActionButton>
        )
    } else return null

    
}