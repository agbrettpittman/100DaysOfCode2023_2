const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
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
})

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh = asyncHandler(async (req, res) => {
    // stuff happens here
})

// @desc Logout
// @route POST /auth/logout
// @access Public - just to clear cookie if exists
const logout = asyncHandler(async (req, res) => {
    // stuff happens here
})

module.exports = { login, refresh, logout }
