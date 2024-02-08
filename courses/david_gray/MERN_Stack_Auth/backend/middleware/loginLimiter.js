const rateLimit = require("express-rate-limit")
const { logEvents } = require("./logger")

const loginLimiter = rateLimit({
    windowMS: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 requests per window / minute
    message:
        "Too many login attempts from this IP, please try again after a minute",
    handler: (req, res, next, options) => {
        const optMessage = options.message.message
        const meth = req.method
        const url = req.url
        const origin = req.headers.origin
        logEvents(
            `Too Many Requests: ${optMessage}\t${meth}\t${url}\t${origin}`,
            "errLog.log"
        )
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, // Return rate limit info in the RateLimit-* headers
    legacyHeaders: false, // Don't return the X-RateLimit-* headers
})

module.exports = loginLimiter
