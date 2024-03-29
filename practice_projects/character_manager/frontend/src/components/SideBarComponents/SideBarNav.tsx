import styled from "styled-components";
import { NavLink, useLoaderData, useNavigation, useSearchParams } from "react-router-dom";
import { Character, CharactersInput } from "@/__generated__/graphql";
import { useState, createContext, useEffect, useContext } from "react";
import { getCharacters } from "@/apiCalls";
import { parseAccessToken } from "@/utils/utilities";
import { RootContext } from "@routes/Root";

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
    color: ${({ theme }) => theme.palette.text.secondary};
    text-decoration: none;
    gap: 1rem;
    &:hover {
        background: ${({ theme }) => theme.palette.extendedBackground.contrastMedium};
    }
    &.active {
        background: ${({ theme }) => theme.palette.primary.main};
        color: white;
    }
    &.pending {
        color: ${({ theme }) => theme.palette.primary.light};
    }
`

export default function SideBarNav() {

    const { OwnCharacters, getOwnCharacters } = useContext(RootContext)
    const [searchParams, setSearchParams] = useSearchParams()

    const CurrentSearchParamsString = searchParams.toString()

    const FilteredCharacters = OwnCharacters.filter((character) => {
        if (searchParams.get("ownSearch")) {
            const searchRegex = new RegExp(searchParams.get("ownSearch")!, "i")
            if (!character.name) return false
            return searchRegex.test(character.name)
        } else return true
    })

    console.log(OwnCharacters)

    return (
        <StyledNav>
            {FilteredCharacters.map((character) => (
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