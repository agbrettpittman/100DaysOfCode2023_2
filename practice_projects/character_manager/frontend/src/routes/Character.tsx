import { Form, useLoaderData } from "react-router-dom";
import { getCharacter } from "@/apiCalls";
import { Character as CharacterType } from "@/__generated__/graphql";
import styled from "styled-components";

export async function loader({ params }: { params:any}) {
    try {
        const CharacterResponse = await getCharacter(params.characterId);
        return { character: CharacterResponse.data.character };
    } catch (error) {
        console.log(error);
        return { character: {} };
    }
}

const SubTitle = styled.h2`
    font-size: 1.5rem;
    font-weight: normal;
    margin: 0;
`;

export default function Character() {
  const { character } = useLoaderData() as {character: CharacterType};

  return (
    <div id="character">
        {/*
        <div>
            <img
            key={contact.avatar}
            src={contact.avatar || ""}
            />
        </div>
        */}

        <div>
            <h1>
                {character.name || <i>No Name</i>}
                <Favorite character={character} />
            </h1>

                {character.subTitle && (
                <SubTitle>
                        {character.subTitle}
                </SubTitle>
            )}

                {character.description && (
                    <p>{character.description}</p>
                )}

            {character.details?.length && (
                <ul>
                    {character.details.map((detail) => {
                        if (!detail?.name) return null;
                        return (
                            <li key={detail.name}>
                                <strong>{detail.name}: </strong>
                                {detail.value || <i>No Value</i>}
                            </li>
                        )
                    })}
                </ul>
            )}
            <div>
            <Form action="edit">
                <button type="submit">Edit</button>
            </Form>
            <Form
                method="post"
                action="destroy"
                onSubmit={(event) => {
                if (
                    !confirm(
                    "Please confirm you want to delete this record."
                    )
                ) {
                    event.preventDefault();
                }
                }}
            >
                <button type="submit">Delete</button>
            </Form>
            </div>
        </div>
    </div>
  );
}

function Favorite({ character }: { character: CharacterType }) {
    let favorite = true;
    return (
        <Form method="post">
        <button
            name="favorite"
            value={favorite ? "false" : "true"}
            aria-label={
            favorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
        >
            {favorite ? "★" : "☆"}
        </button>
        </Form>
    );
}