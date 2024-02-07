const swaggerAutogen = require("swagger-autogen")()

const doc = {
    info: {
        title: "Workout Buddy API",
        description: "API for Workout Buddy app",
    },
    host: "localhost:4000",
}

const outputFile = "./swagger-output.json"
const routes = ["./server.js"]

swaggerAutogen(outputFile, routes, doc).then(() => {
    require("./server.js") // Your project's root file
})
