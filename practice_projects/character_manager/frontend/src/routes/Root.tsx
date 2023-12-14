import { Outlet, Link, useLoaderData } from "react-router-dom";
import { getCharacters } from "@/apiCalls";

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
    const { characters } = useLoaderData() as { characters: any[] };

    console.log(characters);

    return (
      <>
        <div id="sidebar">
          <h1>React Router Contacts</h1>
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
            <form method="post">
              <button type="submit">New</button>
            </form>
          </div>
          <nav>
            {characters.map((character) => (
                <Link
                    key={character.id}
                    to={`/Characters/${character.id}`}
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