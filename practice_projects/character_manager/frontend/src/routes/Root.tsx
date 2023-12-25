import { Outlet, Link, useLoaderData, Form, NavLink, useNavigation, useSubmit } from "react-router-dom";
import { getCharacters, createCharacter } from "@/apiCalls";
import { Character } from "@/__generated__/graphql";
import { useState, useEffect } from "react";
import { redirect } from "react-router-dom";
import { Button } from "@mui/material";
import styled, { keyframes } from "styled-components";

const CharacterDetails = styled.div`
    flex: 1;
    padding: 2rem 4rem;
    width: 100%;
    ${({ loading }: { loading: boolean }) => loading && `
        opacity: 0.25;
        transition: opacity 200ms;
        transition-delay: 200ms;
    `}
`

const SideBar = styled.div`
    width: 22rem;
    background-color: #f7f7f7;
    border-right: solid 1px #e3e3e3;
    display: flex;
    flex-direction: column;
    padding-left: 2rem;
    padding-right: 2rem;
`

const SideBarHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e3e3e3;

    form {
        position: relative;
    }
`

const SearchInput = styled.input`
    width: 100%;
    padding-left: 2rem;
    background-image: ${({ loading }: { loading: boolean }) => 
        loading ? "none" 
        : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' class='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='%23999' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' /%3E%3C/svg%3E")`
    };
    background-repeat: no-repeat;
    background-position: 0.625rem 0.75rem;
    background-size: 1rem;
    position: relative;
`

const SearchSpinnerSpin = keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
`

const SearchSpinner = styled.div`
    width: 1rem;
    height: 1rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23000' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M20 4v5h-.582m0 0a8.001 8.001 0 00-15.356 2m15.356-2H15M4 20v-5h.581m0 0a8.003 8.003 0 0015.357-2M4.581 15H9' /%3E%3C/svg%3E");
    animation: ${SearchSpinnerSpin} 1s infinite linear;
    position: absolute;
    left: 0.625rem;
    top: 0.75rem;
`

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

const SROnlyDiv = styled.div`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
`

export async function action() {
    try {
        const CharacterResponse = await createCharacter();
        await getCharacters(false)
        if (!CharacterResponse?.data?.createCharacter?._id) throw new Error("No characterId");
        return redirect(`/Characters/${CharacterResponse.data.createCharacter._id}/edit`);
    } catch (error) {
        console.log(error);
        return { character: {} }
    }
}

export async function loader({ request }: { request: any }) {
    try {
        const url = new URL(request.url);
        const q = url.searchParams.get("q") || ""
        const CharactersResponse = await getCharacters(false,q);
        return { characters: CharactersResponse.data.characters, q };
    } catch (error) {
        console.log(error);
        return { characters: [] };
    }
}

export default function Root() {
    const { characters, q } = useLoaderData() as {characters: Character[], q: string};
    const navigation = useNavigation();
    const submit = useSubmit();

    const DecodedSearchParams = navigation.location && new URLSearchParams(navigation.location.search)
    const Searching =  DecodedSearchParams && DecodedSearchParams.get("q") !== null;

    useEffect(() => {
        const SearchInput = document.getElementById("q") as HTMLInputElement;
        if (!SearchInput) return;
        SearchInput.value = q;
    }, [q]);

    function searchSubmit(e: React.ChangeEvent<HTMLInputElement>) {
        const isFirstSearch = q == null;
        submit(e.currentTarget.form, {
            replace: !isFirstSearch,
        });
    }

    return (
      <>
        <SideBar id="sidebar">
            <SideBarHeader>
                <Form id="search-form" role="search">
                    <SearchInput
                        id="q"
                        aria-label="Search contacts"
                        placeholder="Search"
                        type="search"
                        name="q"
                        defaultValue={q}
                        onChange={searchSubmit}
                        loading={Boolean(Searching)}
                    />
                        
                    <SearchSpinner
                        id="search-spinner"
                        aria-hidden
                        hidden={!Searching}
                    />
                    <SROnlyDiv
                        className="sr-only"
                        aria-live="polite"
                    ></SROnlyDiv>
                </Form>
                <Form method="post">
                    <Button type="submit" variant="contained">New</Button>
                </Form>
            </SideBarHeader>
            <StyledNav>
                {characters.map((character) => (
                    <StyledNavLink
                        key={character._id}
                        to={`/Characters/${character._id}`}
                    >
                        {character.name}
                    </StyledNavLink>
                    ))    
                }
            </StyledNav>
        </SideBar>
        <CharacterDetails loading={navigation.state === "loading"}>
            <Outlet />
        </CharacterDetails>
      </>
    );
  }