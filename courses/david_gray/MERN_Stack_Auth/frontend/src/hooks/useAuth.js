import { useSelector } from "react-redux"
import { selectCurrentToken } from "../features/auth/authSlice"
import jwtDecode from "jwt-decode"

export default function useAuth() {
    const token = useSelector(selectCurrentToken)
    let returnObj = {
        username: "",
        roles: [],
        isManager: false,
        isAdmin: false,
        status: "Employee",
    }

    if (token) {
        const decoded = jwtDecode(token)
        const { username, roles } = decoded.UserInfo

        returnObj.username = username
        returnObj.roles = roles
        returnObj.isManager = roles.includes("Manager")
        returnObj.isAdmin = roles.includes("Admin")
        if (returnObj.isManager) returnObj.status = "Manager"
        if (returnObj.isAdmin) returnObj.status = "Admin"
    }

    return returnObj
}
