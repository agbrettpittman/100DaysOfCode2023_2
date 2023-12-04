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

const CharactersSchema = new mongoose.Schema({
    creatorId: String,
    ownerId: String,
    name: String,
    subTitle: String,
    description: String,
    details: Array,
});

export const UsersModel = mongoose.model("Users", UsersSchema, "Users");
export const RefreshTokensModel = mongoose.model("RefreshTokens", RefreshTokensSchema, "RefreshTokens");
export const CharactersModel = mongoose.model("Characters", CharactersSchema, "Characters");

