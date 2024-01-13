import { Outlet, useNavigation } from "react-router-dom";
import { getCharacters, createCharacter } from "@/apiCalls";
import { redirect, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import SideBar from "@/components/SideBarComponents/SideBar";
import HeaderBar from "@/components/HeaderBar";
import { useState, createContext, useEffect } from "react";
import { Character, CharactersInput } from "@/__generated__/graphql";
import { parseAccessToken } from "@/utils/utilities";

const CharacterDetails = styled.div`
    flex: 1;
    padding: 2rem 4rem;
    width: 100%;
    overflow-y: auto;
    ${({ loading }: { loading: boolean }) => loading && `
        opacity: 0.25;
        transition: opacity 200ms;
        transition-delay: 200ms;
    `}
`

const Wrapper = styled.div`
    display: grid;
    grid-template-areas:
        "sidebar header"
        "sidebar content";
    grid-template-columns: 22rem 1fr;
    grid-template-rows: auto 1fr;
    height: 100vh;
    width: 100vw;
`

export const RootContext = createContext({
    OwnCharacters: [] as Character[],
    getOwnCharacters: () => {}
})

export default function Root() {
    const navigation = useNavigation();
    const [OwnCharacters, setOwnCharacters] = useState([] as Character[])
    const [searchParams, setSearchParams] = useSearchParams()

    async function getCharactersFromAPI() {
        const query = {
            include: {},
            exclude: {},
        } as CharactersInput
        const decodedAccessToken = parseAccessToken()
        if (!decodedAccessToken) throw new Error("No access token")
        query.include!.ownerId = decodedAccessToken.userId
        const CharactersResponse = await getCharacters(false,query);

        if (!CharactersResponse?.data?.characters) throw new Error("No characters");

        const NullFilteredCharacters = CharactersResponse.data.characters.filter((character) => character !== null)

        setOwnCharacters(NullFilteredCharacters as Character[]);
    }

    useEffect(() => {
        getCharactersFromAPI()
    }, [])

    const ContextValue = {
        OwnCharacters,
        getOwnCharacters: getCharactersFromAPI
    }
    
    return (
        <RootContext.Provider value={ContextValue}>
            <Wrapper>
                <SideBar />
                <HeaderBar />
                <CharacterDetails loading={navigation.state === "loading"}>
                    <Outlet />
                </CharacterDetails>
            </Wrapper>
        </RootContext.Provider>
    );
}