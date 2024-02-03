const User = require("../models/userModel")

async function loginUser(req, res) {
    const { email, password } = req.body
    res.json({ mssg: "Login user" })
}

async function signupUser(req, res) {
    const { email, password } = req.body

    try {
        const user = await User.signup(email, password)
        res.status(200).json({ user })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    loginUser,
    signupUser,
}
