import gql from "graphql-tag";

export const typeDefs = gql`

type User {
    _id: ID!
    name: String
    userName: String
    email: String
    password: String
    salt: String
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

type Mutation {
    createUser(input: CreateUserInput): User
}

`;