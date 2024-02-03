const swaggerAutogen = require("swagger-autogen")()

const doc = {
    info: {
        title: "My API",
        description: "Description",
    },
    host: "localhost:4000",
}

const outputFile = "./swagger-output.json"
const routes = ["./routes/user.js", "./routes/workouts.js"]

swaggerAutogen(outputFile, routes, doc).then(() => {
    require("./server.js") // Your project's root file
})
