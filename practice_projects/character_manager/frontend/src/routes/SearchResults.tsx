import { Outlet, useNavigation } from "react-router-dom";
import { getCharacters, createCharacter } from "@/apiCalls";
import { redirect, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import SideBar from "@/components/SideBarComponents/SideBar";
import HeaderBar from "@/components/HeaderBar";
import { useState, createContext, useEffect } from "react";
import { Character, CharactersInput } from "@/__generated__/graphql";
import { parseAccessToken } from "@/utils/utilities";

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
        <ul>
            {FoundCharacters.map((character) => (
                <li key={character._id}>
                    <div>{character.name}</div>
                    <div>{character.ownerId}</div>
                </li>
            ))}
        </ul>
    )
}
export default SearchResults