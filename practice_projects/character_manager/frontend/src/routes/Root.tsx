import { Outlet, Link, useLoaderData, Form } from "react-router-dom";
import { getCharacters, createCharacter } from "@/apiCalls";
import { Character } from "@/__generated__/graphql";
import { useState, useEffect } from "react";

export async function action() {
    try {
        const CharacterResponse = await createCharacter();
        console.log(CharacterResponse.data)
        return { character: CharacterResponse.data}
    } catch (error) {
        console.log(error);
        return { character: {} }
    }
}

export async function loader() {
    try {
        const CharactersResponse = await getCharacters();
        return { characters: CharactersResponse.data.characters };
    } catch (error) {
        console.log(error);
        return { characters: [] };
    }
}

export default function Root() {
    const { characters } = useLoaderData() as {characters: Character[]}
    const [Token, setToken] = useState<string>("");

    useEffect(() => {
        let lsToken = localStorage.getItem("accessToken");
        if (!Token && lsToken) {
            setToken(lsToken);
        } else if (Token !== lsToken) {
        localStorage.setItem("accessToken", Token);
        }
    }, [Token]);

    return (
      <>
        <div id="sidebar">
            <h1>Character Manager</h1>
            <div>
                <form id="search-form" role="search">
                <input
                    id="q"
                    aria-label="Search contacts"
                    placeholder="Search"
                    type="search"
                    name="q"
                />
                    
                <div
                    id="search-spinner"
                    aria-hidden
                    hidden={true}
                />
                <div
                    className="sr-only"
                    aria-live="polite"
                ></div>
                </form>
                <Form method="post">
                <button type="submit">New</button>
                </Form>
            </div>
            <input 
                type="text" placeholder="Authorization Token" value={Token} 
                onChange={(e) => setToken(e.target.value)} 
            />
          <nav>
            {characters.map((character) => (
                <Link
                    key={character._id}
                    to={`/Characters/${character._id}`}
                >
                    {character.name}
                </Link>
                ))    
            }
          </nav>
        </div>
        <div id="detail">
            <Outlet />
        </div>
      </>
    );
  }