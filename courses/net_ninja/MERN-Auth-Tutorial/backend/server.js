require("dotenv").config()

const express = require("express")
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const swaggerFile = require("./swagger-output.json")
const mongoose = require("mongoose")
const workoutRoutes = require("./routes/workouts")
const userRoutes = require("./routes/user")

// express app
const app = express()

// middleware
app.use(express.json())

app.use((req, res, next) => {
    res.on("finish", () => {
        let originalUrl = req.originalUrl
        // remove '/api' from the originalUrl
        originalUrl = originalUrl.replace("/api", "")
        console.log(`${req.method}: ${originalUrl} -> ${res.statusCode}`)
    })
    next()
})

// routes
app.use("/api/workouts", workoutRoutes)
app.use("/api/user", userRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile))

// connect to db
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
        app.listen(process.env.PORT, () => {
            console.log("connected to db & listening on port", process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })
