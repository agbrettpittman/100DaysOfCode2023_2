const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

async function requireAuth(req, res, next) {
    const { authorization } = req.headers
    if (!authorization) {
        return res.status(401).json({ error: "You must be logged in" })
    }

    const [type, token] = authorization.split(" ")

    try {
        const { _id } = jwt.verify(token, process.env.SECRET)

        req.user = await User.findOne({ _id }).select("_id")

        next()
    } catch (err) {
        console.error(err)
        return res.status(401).json({ error: "You must be logged in" })
    }
}

module.exports = requireAuth
