import { useState } from "react"
import { useSignup } from "../hooks/useSignup"

export default function Signup() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const { isLoading, error, signup } = useSignup()

    async function handleSubmit(e) {
        e.preventDefault()
        await signup(email, password)
    }

    return (
        <form className="signup" onSubmit={handleSubmit}>
            <h2>Sign Up</h2>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>
                Sign Up
            </button>
            {error && <div className="error">{error}</div>}
        </form>
    )
}
