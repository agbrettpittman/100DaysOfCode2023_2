const User = require("../models/userModel")

async function loginUser(req, res) {
    const { email, password, id } = req.body
    res.json({ mssg: "Login user" })
}

async function signupUser(req, res) {
    const { email, password } = req.body
    res.json({ mssg: "Signup user" })
}

module.exports = {
    loginUser,
    signupUser,
}
