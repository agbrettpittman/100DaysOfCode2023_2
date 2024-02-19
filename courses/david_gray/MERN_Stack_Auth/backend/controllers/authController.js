const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const accessTokenExpiration = "15m"
const refreshTokenExpiration = "7d"

function stringTimeToMiliseconds(time) {
    // time can be in format of "1d 2h 3m 4s"
    const timeArray = time.split(" ")
    let milliseconds = 0
    for (let i = 0; i < timeArray.length; i++) {
        const CaptureGroups = timeArray[i].match(/(\d+)(\w)/)
        const number = parseInt(CaptureGroups[1])
        const unit = CaptureGroups[2]
        switch (unit) {
            case "d":
                milliseconds += number * 24 * 60 * 60 * 1000
                break
            case "h":
                milliseconds += number * 60 * 60 * 1000
                break
            case "m":
                milliseconds += number * 60 * 1000
                break
            case "s":
                milliseconds += number * 1000
                break
            default:
                break
        }
    }
    return milliseconds
}

// @desc Login
// @route POST /auth
// @access Public
const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({ message: "All fields are required" })
    }

    const foundUser = await User.findOne({ username }).exec()

    if (!foundUser || !foundUser.active) {
        res.status(401).json({ message: "Unauthorized" })
    }

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) {
        res.status(401).json({ message: "Unauthorized" })
    }

    const accessToken = jwt.sign(
        {
            UserInfo: {
                username: foundUser.username,
                roles: foundUser.roles,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: accessTokenExpiration }
    )

    const refreshToken = jwt.sign(
        { username: foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: refreshTokenExpiration }
    )

    // max age should match refresh token expiration
    res.cookie("jwt", refreshToken, {
        httpOnly: true, // only accessible by the server
        secure: true, // only accessible by https
        sameSite: "none", // allow cross-site
        maxAge: stringTimeToMiliseconds(refreshTokenExpiration),
    })

    res.status(200).json({ accessToken })
}

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = async (req, res) => {
    const cookies = req.cookies

    console.log(cookies)

    if (!cookies.jwt) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden" })

            const foundUser = await User.findOne({
                username: decoded.username,
            }).exec()

            if (!foundUser || !foundUser.active) {
                return res.status(401).json({ message: "Unauthorized" })
            }

            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        username: foundUser.username,
                        roles: foundUser.roles,
                    },
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: accessTokenExpiration }
            )

            res.json({ accessToken })
        }
    )
}

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = (req, res) => {
    const cookies = req.cookies

    if (!cookies.jwt) return res.sendStatus(204)
    res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    })
    res.json({ message: "Cookie cleared" })
}

module.exports = { login, refresh, logout }
