import { Outlet, Link, useLoaderData, Form, NavLink, useNavigation } from "react-router-dom";
import { getCharacters, createCharacter } from "@/apiCalls";
import { Character } from "@/__generated__/graphql";
import { useState, useEffect } from "react";
import { redirect } from "react-router-dom";

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
        return { characters: CharactersResponse.data.characters };
    } catch (error) {
        console.log(error);
        return { characters: [] };
    }
}

export default function Root() {
    const { characters } = useLoaderData() as {characters: Character[]}
    const [Token, setToken] = useState<string>("");
    const navigation = useNavigation();

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
                <Form id="search-form" role="search">
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
                </Form>
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