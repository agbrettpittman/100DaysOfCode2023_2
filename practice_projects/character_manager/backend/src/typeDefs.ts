import gql from "graphql-tag";

export const typeDefs = gql`

type User {
    _id: ID!
    name: String
    userName: String
    email: String
}

type CharacterAttribute {
    name: String
    value: String
}

type Character {
    _id: ID!
    creatorId: String
    ownerId: String
    name: String
    subTitle: String
    description: String
    details: [CharacterAttribute]
}

type LoginPayload {
    accessToken: String
    refreshToken: String
    user: User
}

type Query {
    users: [User],
    characters: [Character]
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

input CharacterAttributeInput {
    name: String!
    value: String!
}

input CharacterCreateInput {
    name: String!
    subTitle: String
    description: String
    details: [CharacterAttributeInput]
}

input CharacterUpdateInput {
    name: String
    subTitle: String
    description: String
    details: [CharacterAttributeInput]
}

type Mutation {
    createUser(input: CreateUserInput): User
    loginUser(input: LoginUserInput): LoginPayload
    logoutUser(refreshToken: String): Boolean
    extendTokens(refreshToken: String): LoginPayload
    createCharacter(input: CharacterCreateInput): Character
    updateCharacter(characterId: String!, input: CharacterUpdateInput): Character
    transferCharacter(characterId: String!, newOwnerId: String!): Character
}

`;

export default typeDefs