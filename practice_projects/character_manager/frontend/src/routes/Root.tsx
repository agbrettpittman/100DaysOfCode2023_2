import { Outlet, Link, useLoaderData, Form, NavLink, useNavigation, useSubmit } from "react-router-dom";
import { getCharacters, createCharacter } from "@/apiCalls";
import { Character } from "@/__generated__/graphql";
import { useState, useEffect } from "react";
import { redirect } from "react-router-dom";
import { Button } from "@mui/material";

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
        <div id="sidebar">
            <div>
                <Form id="search-form" role="search">
                    <input
                        id="q"
                        aria-label="Search contacts"
                        placeholder="Search"
                        type="search"
                        name="q"
                        defaultValue={q}
                        onChange={searchSubmit}
                        className={Searching ? "loading" : ""}
                    />
                        
                    <div
                        id="search-spinner"
                        aria-hidden
                        hidden={!Searching}
                    />
                    <div
                        className="sr-only"
                        aria-live="polite"
                    ></div>
                </Form>
                <Form method="post">
                    <Button type="submit" variant="contained">New</Button>
                </Form>
            </div>
          <nav>
            {characters.map((character) => (
                <NavLink
                    key={character._id}
                    to={`/Characters/${character._id}`}
                    className={({ isActive, isPending }) =>
                        isActive ? "active"
                        : isPending ? "pending"
                        : ""
                    }
                >
                    {character.name}
                </NavLink>
                ))    
            }
          </nav>
        </div>
        <div id="detail" className={navigation.state === "loading" ? "loading" : ""}>
            <Outlet />
        </div>
      </>
    );
  }