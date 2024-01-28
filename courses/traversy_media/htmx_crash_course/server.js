import express from "express";
import axios from "axios";

const app = express();

// Set static folder
app.use(express.static("public"));

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

//Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Handle requests

app.get("/users", async (req, res) => {
    const { limit = 10 } = req.query;

    setTimeout(async () => {
        try {
            const Response = await axios.get(
                `https://jsonplaceholder.typicode.com/users?_limit=${limit}`
            );
            const Users = Response.data || [];

            res.send(`
                <h1 class="text-2xl font-bold my-4">Users</h1>
                <ul>
                    ${Users.map((user) => `<li>${user.name}</li>`).join("")}
                </ul>
            `);
        } catch (error) {
            console.log(error);
            res.send(`
                <h1 class="text-2xl font-bold my-4">Users</h1>
                <p>Something went wrong</p>
            `);
        }
    }, 2000);
});

app.post("/convert", async (req, res) => {
    setTimeout(async () => {
        try {
            const Fahrenheit = parseFloat(req.body.fahrenheit);
            const Celsius = ((Fahrenheit - 32) * 5) / 9;

            res.send(`
                <p>${Fahrenheit}°F → ${Celsius}°C</p>
            `);
        } catch (error) {
            console.log(error);
            res.send(`
                <p>Something went wrong</p>
            `);
        }
    }, 2000);
});

let counter = 0;

app.get("/poll", (req, res) => {
    counter++;
    const data = { value: counter };

    res.send(data);
});

//Start the server
app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
