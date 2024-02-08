const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")

// @desc Login
// @route POST /auth
// @access Public
const login = asyncHandler(async (req, res) => {
    // stuff happens here
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
