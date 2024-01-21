import { getCharacters } from "@/apiCalls";
import { useSearchParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Character as CharacterType, CharactersInput, CharacterImage as CharacterImageType } from "@/__generated__/graphql";
import { parseAccessToken } from "@/utils/utilities";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import { getProtectedFileProps } from "@utils/utilities";
import { CharacterMainPhoto } from "@components/StyleLib";
import { useCustomNavigate } from "@/utils/utilities";
import { TypographyProps } from "@mui/material";

const ResultList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    width: 100%;
    overflow-y: auto;
`

const OwnerNameDisplay = styled(Typography)<TypographyProps & {component: React.ElementType}>`
    color: ${({ theme }) => theme.palette.text.secondary};
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
        ${OwnerNameDisplay} {
            color: ${({ theme }) => theme.palette.primary.contrastText};
        }
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
    mainPhoto: CharacterImagePropsType | null;
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
                const MainPhoto = await getMainPhotoImageProps(character)
                return {
                    ...character,
                    mainPhoto: MainPhoto
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

    async function getMainPhotoImageProps(character: CharacterType): Promise<CharacterImagePropsType | null> {
        if (!character.images?.length) return null
        for (const [index, image] of character.images.entries()) {
            if (!image?.mainPhoto) continue
            const FallBackAlt = `Image ${index + 1}`;
            const Alt = image?.caption || FallBackAlt;
            const ProtectedFileProps = await getProtectedFileProps(image?.filename || "", Alt);
            return {
                ...image,
                ...ProtectedFileProps,
                title: Alt,
            }
        }
        return null
    }

    if (Loading) return <div>Loading...</div>
    else if (FoundCharacters.length === 0) return <div>No characters found</div>
    else return (
        <ResultList>
            {FoundCharacters.map((character) => {
                const MainPhoto = character?.mainPhoto
                const OwnerName = `@${character?.owner?.userName}` || "Unknown"
                return (
                    <SearchItem key={character._id} onClick={() => navigate(`/Characters/${character._id}`)}>
                        {MainPhoto && <StyledCharacterMainPhoto src={MainPhoto.src} alt={MainPhoto.alt} title={MainPhoto.title} size="50px" />}
                        <Box gridArea={"name"} display={'flex'} flexDirection={'row'} gap={'0.25rem'} alignItems={'center'}>
                            <Typography variant="h6">
                                {character.name}
                            </Typography>
                            <OwnerNameDisplay variant="body1" component="span">
                                {`(${OwnerName})`}
                            </OwnerNameDisplay>
                        </Box>
                        <Typography variant="body1" gridArea={"details"}>
                            {character.subTitle}
                        </Typography>
                    </SearchItem>
                )
            })}
        </ResultList>
    )
}
export default SearchResults