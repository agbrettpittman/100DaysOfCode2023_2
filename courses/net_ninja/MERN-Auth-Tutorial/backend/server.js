require("dotenv").config()

const express = require("express")
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const swaggerFile = require("./swagger-output.json")
const mongoose = require("mongoose")
const workoutRoutes = require("./routes/workouts")
const userRoutes = require("./routes/user")
const swaggerAutogen = require("swagger-autogen")()

const doc = {
    info: {
        title: "My API",
        description: "Description",
    },
    host: "localhost:4000",
}

const outputFile = "./swagger-output.json"
const routes_root = ["./routes/user.js", "./routes/workouts.js"]

// express app
const app = express()

// middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes
app.use("/api/workouts", workoutRoutes)
app.use("/api/user", userRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile))

swaggerAutogen(outputFile, routes_root, doc).then(() => {
    // connect to db
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            // listen for requests
            app.listen(process.env.PORT, () => {
                console.log(
                    "connected to db & listening on port",
                    process.env.PORT
                )
            })
        })
        .catch((error) => {
            console.log(error)
        })
})
