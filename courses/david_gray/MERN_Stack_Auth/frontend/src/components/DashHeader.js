import { useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faFileCirclePlus,
    faFilePen,
    faUserGear,
    faUserPlus,
    faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useSendLogoutMutation } from "../features/auth/authApiSlice"
import useAuth from "../hooks/useAuth"

const PATH_REGEXS = {
    DASH_REGEX: /^\/dash(\/)?$/,
    NOTES_REGEX: /^\/dash\/notes(\/)?$/,
    USERS_REGEX: /^\/dash\/users(\/)?$/,
}

const DashHeader = () => {
    const { isManager, isAdmin } = useAuth()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const OnDash = pathname.includes("/dash")

    const [sendLogout, { isLoading, isSuccess, isError, error }] =
        useSendLogoutMutation()

    const NavButtons = [
        {
            title: "New Note",
            onClick: () => navigate("/dash/notes/new"),
            icon: faFileCirclePlus,
            check: () => PATH_REGEXS.NOTES_REGEX.test(pathname),
        },
        {
            title: "New User",
            onClick: () => navigate("/dash/users/new"),
            icon: faUserPlus,
            check: () => PATH_REGEXS.USERS_REGEX.test(pathname),
        },
        {
            title: "Notes",
            onClick: () => navigate("/dash/notes"),
            icon: faFilePen,
            check: () =>
                Boolean(!PATH_REGEXS.NOTES_REGEX.test(pathname) && OnDash),
        },
        {
            title: "Users",
            onClick: () => navigate("/dash/users"),
            icon: faUserGear,
            check: () =>
                Boolean(
                    (isManager || isAdmin) &&
                        !PATH_REGEXS.USERS_REGEX.test(pathname) &&
                        OnDash
                ),
        },
        {
            title: "Logout",
            onClick: () => sendLogout(),
            icon: faRightFromBracket,
            check: () => true,
        },
    ]

    useEffect(() => {
        if (isSuccess) navigate("/")
    }, [isSuccess, navigate])

    let dashClass = "dash-header__container--small"
    for (let path in PATH_REGEXS) {
        if (PATH_REGEXS[path].test(pathname)) {
            dashClass = null
            break
        }
    }

    const errClass = isError ? "errmsg" : "offscren"

    let buttonContent = null

    if (isLoading) buttonContent = <p>Logging Out...</p>
    else {
        buttonContent = NavButtons.map((button, index) => {
            if (button.check()) {
                return (
                    <button
                        key={index}
                        className="icon-button"
                        title={button.title}
                        onClick={button.onClick}
                    >
                        <FontAwesomeIcon icon={button.icon} />
                    </button>
                )
            } else return null
        })
    }

    const content = (
        <>
            <p className={errClass}>{error?.data?.message}</p>
            <header className="dash-header">
                <div className={`dash-header__container ${dashClass}`}>
                    <Link to="/dash">
                        <h1 className="dash-header__title">techNotes</h1>
                    </Link>
                    <nav className="dash-header__nav">{buttonContent}</nav>
                </div>
            </header>
        </>
    )

    return content
}
export default DashHeader
