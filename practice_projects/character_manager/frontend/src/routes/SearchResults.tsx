import { getCharacters } from "@/apiCalls";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Character, CharactersInput } from "@/__generated__/graphql";
import { parseAccessToken } from "@/utils/utilities";
import { Box } from "@mui/material";
import styled from "styled-components";

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
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background: ${({ theme }) => theme.palette.extendedBackground.contrastMedium};
    color: ${({ theme }) => theme.palette.text.primary};
    cursor: pointer;
    &:hover {
        background: ${({ theme }) => theme.palette.primary.main};
        color: ${({ theme }) => theme.palette.primary.contrastText};
    }
`

function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [FoundCharacters, setFoundCharacters] = useState([] as Character[])
    const [Loading, setLoading] = useState(true)

    async function getCharactersFromAPI() {
        const query = {
            include: {},
            exclude: {},
        } as CharactersInput
        if (searchParams.get("globalSearch")) query.include!.name = searchParams.get("ownSearch")
        const decodedAccessToken = parseAccessToken()
        if (!decodedAccessToken) throw new Error("No access token")
        query.exclude!.ownerId = decodedAccessToken.userId
        console.log(query)
        try {
            const CharactersResponse = await getCharacters(false,query);
            if (!CharactersResponse?.data?.characters) throw new Error("No characters");
            const NullFilteredCharacters = CharactersResponse.data.characters.filter((character) => character !== null)
            setFoundCharacters(NullFilteredCharacters as Character[]);
        } catch (err) {
            console.log(err)
        }
        setLoading(false)
    }

    useEffect(() => {
        getCharactersFromAPI()
    }, [])

    console.log(FoundCharacters)

    if (Loading) return <div>Loading...</div>
    else if (FoundCharacters.length === 0) return <div>No characters found</div>
    else return (
        <ResultList>
            {FoundCharacters.map((character) => (
                <SearchItem key={character._id}>
                    <div>{character.name}</div>
                    <div>{character.ownerId}</div>
                </SearchItem>
            ))}
        </ResultList>
    )
}
export default SearchResults