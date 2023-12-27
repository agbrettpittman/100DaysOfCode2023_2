import { Outlet, useNavigation } from "react-router-dom";
import { getCharacters, createCharacter } from "@/apiCalls";
import { redirect } from "react-router-dom";
import styled from "styled-components";
import SideBar from "@/components/SideBarComponents/SideBar";


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

export default function Root() {
    const navigation = useNavigation();
    
    return (
        <>
            <SideBar />
            <CharacterDetails loading={navigation.state === "loading"}>
                <Outlet />
            </CharacterDetails>
        </>
    );
}