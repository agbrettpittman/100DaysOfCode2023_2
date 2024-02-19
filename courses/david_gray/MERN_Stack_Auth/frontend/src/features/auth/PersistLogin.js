import { Outlet, Link } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useRefreshMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersist"
import { useSelector } from "react-redux"
import { selectCurrentToken } from "./authSlice"
import PulseLoader from "react-spinners/PulseLoader"

const PersistLogin = () => {
    const [persist] = usePersist()
    const token = useSelector(selectCurrentToken)
    const effectRan = useRef(false)
    const [trueSuccess, setTrueSuccess] = useState(false)

    const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] = useRefreshMutation()

    useEffect(() => {
        if (effectRan.current === true || process.env.NODE_ENV !== "development") {
            const verifyRefreshToken = async () => {
                console.log("verifying refresh token")
                try {
                    await refresh()
                    setTrueSuccess(true)
                } catch (err) {
                    console.log("Error verifying refresh token", err)
                }
            }
            if (!token && persist) verifyRefreshToken()
        }

        return () => {
            effectRan.current = true
        }
    }, [])

    let content = null

    if (isLoading) content = <PulseLoader color="#FFF" />
    else if (isError) {
        content = (
            <p className="errmsg">
                {error.data?.message + " - "}
                <Link to="/login">Please login again</Link>
            </p>
        )
    } else if (!persist && !token) content = <Link to="/login">Please login</Link>
    else if (!persist) content = <Outlet />
    else if (isSuccess && trueSuccess) content = <Outlet />
    else if (token && isUninitialized) content = <Outlet />

    return content
}
export default PersistLogin
