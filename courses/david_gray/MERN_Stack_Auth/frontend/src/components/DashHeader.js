import { useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useSendLogoutMutation } from "../features/auth/authApiSlice"

const PATH_REGEXS = {
    DASH_REGEX: /^\/dash(\/)?$/,
    NOTES_REGEX: /^\/dash\/notes(\/)?$/,
    USERS_REGEX: /^\/dash\/users(\/)?$/,
}

const DashHeader = () => {
    const navigate = useNavigate()
    const { pathname } = useLocation()

    const [sendLogout, { isLoading, isSuccess, isError, error }] =
        useSendLogoutMutation()

    useEffect(() => {
        if (isSuccess) navigate("/")
    }, [isSuccess, navigate])

    if (isLoading) return <p>Logging Out...</p>
    if (isError) return <p>Error: {error.data?.message}</p>

    let dashClass = "dash-header__container--small"
    for (let path in PATH_REGEXS) {
        if (PATH_REGEXS[path].test(pathname)) {
            dashClass = null
            break
        }
    }

    const LogoutButton = (
        <button
            className="icon-button"
            title="Logout"
            onClick={() => sendLogout()}
        >
            <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
    )

    const content = (
        <header className="dash-header">
            <div className={`dash-header__container ${dashClass}`}>
                <Link to="/dash">
                    <h1 className="dash-header__title">techNotes</h1>
                </Link>
                <nav className="dash-header__nav">
                    {/* add more buttons later */}
                    {LogoutButton}
                </nav>
            </div>
        </header>
    )

    return content
}
export default DashHeader
