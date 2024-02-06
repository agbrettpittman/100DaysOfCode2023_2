import { useAuthContext } from "./useAuthContext"

export default function useLogout() {
    const { dispatch } = useAuthContext()

    function logout() {
        //remove user from storage
        localStorage.removeItem("user")

        // Clear the user from the context
        dispatch({ type: "LOGOUT" })
    }

    return { logout }
}
