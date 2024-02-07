import { useAuthContext } from "./useAuthContext"
import { useWorkoutsContext } from "./useWorkoutsContext"

export default function useLogout() {
    const { dispatch } = useAuthContext()
    const { dispatch: workoutDispatch } = useWorkoutsContext()

    function logout() {
        //remove user from storage
        localStorage.removeItem("user")

        // Clear the user from the context
        dispatch({ type: "LOGOUT" })
        workoutDispatch({ type: "SET_WORKOUTS", payload: null })
    }

    return { logout }
}
