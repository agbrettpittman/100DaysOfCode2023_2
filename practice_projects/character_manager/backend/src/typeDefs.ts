import gql from "graphql-tag";

export const typeDefs = gql`

type User {
    _id: ID!
    name: String
    userName: String
    email: String
}

type LoginPayload {
    accessToken: String
    refreshToken: String
    user: User
}

type Query {
    users: [User]
}

input CreateUserInput {
    name: String!
    userName: String!
    email: String!
    password: String!
}

input LoginUserInput {
    userName: String!
    password: String!
}

type Mutation {
    createUser(input: CreateUserInput): User
    loginUser(input: LoginUserInput): LoginPayload
    logoutUser(refreshToken: String): Boolean
    extendTokens(refreshToken: String): LoginPayload
}

`;

export default typeDefs