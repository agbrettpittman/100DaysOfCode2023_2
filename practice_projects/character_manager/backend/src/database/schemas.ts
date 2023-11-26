import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
    name: String,
    userName: String,
    email: String,
    password: String,
    salt: String
});

export const UsersModel = mongoose.model("Users", UsersSchema);

