const jwt = require("jsonwebtoken")

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" })
        }
        req.user = decoded.UserInfo.username
        req.roles = decoded.UserInfo.roles
        next()
    })
}

module.exports = verifyJWT
