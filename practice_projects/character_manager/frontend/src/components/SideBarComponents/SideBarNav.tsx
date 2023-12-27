import styled from "styled-components";
import { NavLink, useLoaderData, useNavigation, useSearchParams } from "react-router-dom";
import { Character } from "@/__generated__/graphql";
import { useState, createContext, useEffect } from "react";
import { getCharacters } from "@/apiCalls";

const StyledNav = styled.nav`
    flex: 1;
    overflow: auto;
    padding-top: 1rem;
`

const StyledNavLink = styled(NavLink)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    white-space: pre;
    padding: 0.5rem;
    border-radius: 8px;
    color: inherit;
    text-decoration: none;
    gap: 1rem;
    &:hover {
        background: #e3e3e3;
    }
    &.active {
        background: hsl(224, 98%, 58%);
        color: white;
    }
    &.pending {
        color: hsl(224, 98%, 58%);
    }
`

export default function SideBarNav() {

    const [Characters, setCharacters] = useState([] as Character[])
    const [searchParams, setSearchParams] = useSearchParams()

    async function getCharactersFromAPI() {
        const query = searchParams.get("q") || ""
        const CharactersResponse = await getCharacters(false,query);

        if (!CharactersResponse?.data?.characters) throw new Error("No characters");

        const NullFilteredCharacters = CharactersResponse.data.characters.filter((character) => character !== null)

        setCharacters(NullFilteredCharacters as Character[]);
    }

    useEffect(() => {
        getCharactersFromAPI()
    }, [searchParams])

    const CurrentSearchParamsString = searchParams.toString()

    return (
        <StyledNav>
            {Characters.map((character) => (
                <StyledNavLink
                    key={character._id}
                    to={`/Characters/${character._id}?${CurrentSearchParamsString}`}
                >
                    {character.name}
                </StyledNavLink>
                ))    
            }
        </StyledNav>
    )
}