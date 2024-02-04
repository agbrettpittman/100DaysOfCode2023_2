const User = require("../models/userModel")
const jwt = require("jsonwebtoken")

function createToken(_id) {
    return jwt.sign({ _id }, process.env.SECRET, {
        expiresIn: "3d",
    })
}

async function loginUser(req, res) {
    const { email, password } = req.body
    res.json({ mssg: "Login user" })
}

async function signupUser(req, res) {
    const { email, password } = req.body

    try {
        const user = await User.signup(email, password)

        //create a token
        const token = createToken(user._id)

        res.status(200).json({ email, token })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    loginUser,
    signupUser,
}
