import { getCharacters } from "@/apiCalls";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Character as CharacterType, CharactersInput, CharacterImage as CharacterImageType } from "@/__generated__/graphql";
import { parseAccessToken } from "@/utils/utilities";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import { getProtectedFileProps } from "@utils/utilities";
import { CharacterMainPhoto } from "@components/StyleLib";
import { useCustomNavigate } from "@/utils/utilities";

const ResultList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    width: 100%;
    max-height: 50vh;
    overflow-y: auto;
`

const SearchItem = styled(Box)`
    display: grid;
    column-gap: 1rem;
    padding: 0.25rem;
    border-radius: 8px;
    background: ${({ theme }) => theme.palette.extendedBackground.contrastMedium};
    color: ${({ theme }) => theme.palette.text.primary};
    cursor: pointer;
    grid-template-areas:
        "mainPhoto name"
        "mainPhoto details";
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    &:hover {
        background: ${({ theme }) => theme.palette.primary.main};
        color: ${({ theme }) => theme.palette.primary.contrastText};
    }
`

const StyledCharacterMainPhoto = styled(CharacterMainPhoto)`
    grid-area: mainPhoto;
`

type CharacterImagePropsType = CharacterImageType & {
    src: string;
    alt: string;
    title: string;
}

type CharacterStateType = CharacterType & {
    images: CharacterImagePropsType[]
}

function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [FoundCharacters, setFoundCharacters] = useState([] as CharacterStateType[])
    const [Loading, setLoading] = useState(true)
    const { navigate } = useCustomNavigate()

    async function getCharactersFromAPI() {
        const query = {
            include: {},
            exclude: {},
        } as CharactersInput
        if (searchParams.get("globalSearch")) query.include!.name = searchParams.get("globalSearch")
        const decodedAccessToken = parseAccessToken()
        if (!decodedAccessToken) throw new Error("No access token")
        query.exclude!.ownerId = decodedAccessToken.userId
        try {
            const CharactersResponse = await getCharacters(false,query);
            if (!CharactersResponse?.data?.characters) throw new Error("No characters");
            const NullFilteredCharacters = CharactersResponse.data.characters.filter((character) => character !== null)
            const ImageRemappedCharacters = await Promise.all(NullFilteredCharacters.map(async (character) => {
                if (!character) return null
                const newCharacterImages = await processCharacterImages(character)
                return {
                    ...character,
                    images: newCharacterImages
                }
            }))
            setFoundCharacters(ImageRemappedCharacters as CharacterStateType[])
        } catch (err) {
            console.log(err)
        }
        setLoading(false)
    }

    useEffect(() => {
        getCharactersFromAPI()
    }, [searchParams])

    //TODO: only get the file props for the main photo, not all of them
    //TODO: Bring in the owner's name

    async function processCharacterImages(character: CharacterType): Promise<CharacterImagePropsType[]> {
        if (!character.images?.length) return [];
        let newCharacterImages = [];
        for (const [index, image] of character.images.entries()) {
            const FallBackAlt = `Image ${index + 1}`;
            const Alt = image?.caption || FallBackAlt;
            const ProtectedFileProps = await getProtectedFileProps(image?.filename || "", Alt);
            newCharacterImages.push({
                ...image,
                ...ProtectedFileProps,
                title: Alt,
            })
        }
        return newCharacterImages
    }

    if (Loading) return <div>Loading...</div>
    else if (FoundCharacters.length === 0) return <div>No characters found</div>
    else return (
        <ResultList>
            {FoundCharacters.map((character) => {
                const MainPhoto = character.images?.length > 0 && character.images.find((image: CharacterImagePropsType) => image?.mainPhoto && image.src);
                return (
                    <SearchItem key={character._id} onClick={() => navigate(`/Characters/${character._id}`)}>
                        {MainPhoto && <StyledCharacterMainPhoto src={MainPhoto.src} alt={MainPhoto.alt} title={MainPhoto.title} size="50px" />}
                        {/*<div>{character.name}</div>*/}
                        <Typography variant="h6">{character.name}</Typography>
                        <Typography variant="body1">
                            {character.subTitle}
                        </Typography>
                    </SearchItem>
                )
            })}
        </ResultList>
    )
}
export default SearchResults