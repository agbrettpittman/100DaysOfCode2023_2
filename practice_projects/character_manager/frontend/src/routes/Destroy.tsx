import { redirect } from "react-router-dom";
import { deleteCharacter } from "@/apiCalls";

export async function action({ params }: { params: any }) {
    try {
        if (!params.characterId) {
            throw new Error("Missing characterId");
        } else if (typeof params.characterId !== "string") {
            throw new Error("Invalid characterId");
        }
        await deleteCharacter(params.characterId);
        return redirect("/");
    } catch (error) {
        console.log(error);
        alert("Failed to delete character");
        const NewPath = window.location.pathname.replace("/destroy", "");
        return redirect(NewPath)
    }
}