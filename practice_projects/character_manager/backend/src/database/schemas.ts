import mongoose from "mongoose";

const UsersSchema = new mongoose.Schema({
    name: String,
    userName: String,
    email: String,
    password: String,
    salt: String
});

const RefreshTokensSchema = new mongoose.Schema({
    userId: String,
    token: String,
    expires: Date
});

export const UsersModel = mongoose.model("Users", UsersSchema, "Users");
export const RefreshTokensModel = mongoose.model("RefreshTokens", RefreshTokensSchema, "RefreshTokens");


