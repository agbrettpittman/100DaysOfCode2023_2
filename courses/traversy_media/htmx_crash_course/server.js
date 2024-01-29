import express from "express"
import axios from "axios"
import fs from "fs"

const app = express()
const port = 8000
let pollCounter = 0
let currentTemp = 20

// Set static folder
app.use(express.static("public"))

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }))

//Parse JSON bodies (as sent by API clients)
app.use(express.json())

// log every request to the console
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next()
})

// Handle requests

app.get("/nav-items", async (req, res) => {
    let pages = []
    fs.readdirSync("./public").forEach((file) => {
        if (file.endsWith(".html")) {
            let name = file.split(".")[0]
            if (name === "index") return
            // replace any dashes with spaces and capitalize first letter of each word
            name = name
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            let url = file
            pages.push({ name, url })
        }
    })

    let navItems = pages
        .map((page) => {
            return `<a href="${page.url}" class="text-lg no-underline text-grey-darkest hover:text-blue-300 ml-2">${page.name}</a>`
        })
        .join("\n")
    res.send(navItems)
})

app.get("/users", async (req, res) => {
    const { limit = 10 } = req.query

    setTimeout(async () => {
        try {
            const Response = await axios.get(
                `https://jsonplaceholder.typicode.com/users?_limit=${limit}`,
            )
            const Users = Response.data || []

            res.send(`
                <h1 class="text-2xl font-bold my-4">Users</h1>
                <ul>
                    ${Users.map((user) => `<li>${user.name}</li>`).join("")}
                </ul>
            `)
        } catch (error) {
            console.log(error)
            res.send(`
                <h1 class="text-2xl font-bold my-4">Users</h1>
                <p>Something went wrong</p>
            `)
        }
    }, 2000)
})

app.post("/users/search", async (req, res) => {
    const SearchTerm = req.body.search.toLowerCase()

    let contactRows = "<tr></tr>"

    try {
        const Response = await axios.get(
            `https://jsonplaceholder.typicode.com/users`,
        )
        const Contacts = Response.data || []

        contactRows = Contacts.filter((contact) => {
            return (
                contact.name.toLowerCase().includes(SearchTerm) ||
                contact.email.toLowerCase().includes(SearchTerm)
            )
        })
            .map((contact) => {
                return `
                <tr>
                    <td><div class="my-4 p-2">${contact.name}</div></td>
                    <td><div class="my-4 p-2">${contact.email}</div></td>
                </tr>
            `
            })
            .join("")
    } catch (error) {
        console.log(error)
    }

    setTimeout(async () => {
        try {
            res.send(contactRows)
        } catch (error) {
            console.log(error)
            res.send(`<tr></tr>`)
        }
    }, 2000)
})

app.post("/contact/email", async (req, res) => {
    const { email } = req.body
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    const Statuses = {
        valid: {
            message: "That email is valid",
            class: "text-green-500",
        },
        invalid: {
            message: "That email is invalid",
            class: "text-red-500",
        },
    }
    const Status = emailRegex.test(email) ? Statuses.valid : Statuses.invalid

    return res.send(`
        <div class="mb-4" hx-target="this" hx-swap="outerHTML">
            <label
                class="block text-gray-700 text-sm font-bold mb-2"
                for="email"
            >
                Email Address
            </label>
            <input
                name="email"
                hx-post="/contact/email"
                class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:border-blue-500"
                type="email"
                id="email"
                value="${email}"
                required
            />
            <p class="${Status.class}">${Status.message}</p>
        </div>
    `)
})

app.post("/convert", async (req, res) => {
    setTimeout(async () => {
        try {
            const Fahrenheit = parseFloat(req.body.fahrenheit)
            const Celsius = ((Fahrenheit - 32) * 5) / 9

            res.send(`
                <p>${Fahrenheit}°F → ${Celsius}°C</p>
            `)
        } catch (error) {
            console.log(error)
            res.send(`
                <p>Something went wrong</p>
            `)
        }
    }, 2000)
})

app.get("/get-temp", async (req, res) => {
    currentTemp += Math.random() * 2 - 1
    res.send(currentTemp.toFixed(1) + "°C")
})

app.get("/poll", (req, res) => {
    pollCounter++
    const data = { value: pollCounter }

    res.send(data)
})

//Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})
