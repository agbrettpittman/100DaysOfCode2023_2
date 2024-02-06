import { useState } from "react"
import { useAuthContext } from "./useAuthContext"

export function useSignup() {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()

    function handleError(error) {
        setIsLoading(false)
        if (error instanceof Error) {
            setError(error.message)
        } else if (typeof error === "string") {
            setError(error)
        } else {
            setError("An unknown error occurred")
        }
    }

    async function signup(email, password) {
        console.log(email, password)

        setIsLoading(true)
        setError(null)

        try {
            console.log(JSON.stringify({ email, password }))
        } catch (error) {
            console.log(error)
        }

        try {
            const response = await fetch("/api/user/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            })

            console.log(response)

            const data = await response.json()

            console.log(data)

            if (!response.ok) {
                setIsLoading(false)
                handleError(data.error)
            } else {
                //save the user to local storage
                localStorage.setItem("user", JSON.stringify(data))

                //update the context
                dispatch({ type: "LOGIN", payload: data })
            }
        } catch (error) {
            console.log(error)
            handleError(error)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        error,
        isLoading,
        signup,
    }
}
