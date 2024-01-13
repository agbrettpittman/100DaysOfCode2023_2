import gql from "graphql-tag";

export const typeDefs = gql`

scalar Upload

type File {
    filename: String!
    mimetype: String!
    encoding: String!
}

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

type CharacterImage {
    filename: String
    mainPhoto: Boolean
    caption: String
}

type Character {
    _id: ID!
    creatorId: String
    ownerId: String
    name: String
    subTitle: String
    description: String
    details: [CharacterAttribute]
    images: [CharacterImage]
    private: Boolean
}

input CharactersInputFilters {
    _id: ID
    name: String
    creatorId: String
    ownerId: String
}

input CharactersInput {
    include: CharactersInputFilters
    exclude: CharactersInputFilters
}

type LoginPayload {
    accessToken: String
    refreshToken: String
    user: User
}

type Query {
    users: [User],
    characters(input: CharactersInput): [Character],
    character(id: String!): Character
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

input CharacterImageDetailsInput {
    mainPhoto: Boolean,
    filename: String,
    caption: String
}

input UpdateCharacterImageDetailsInput {
    characterId: String!,
    imageId: Int!,
    mainPhoto: Boolean,
    caption: String
}

input CharacterCreateInput {
    name: String!
    subTitle: String
    description: String
    private: Boolean = false
    details: [CharacterAttributeInput]
    imageDetails: [CharacterImageDetailsInput]
}

input CharacterUpdateInput {
    name: String
    subTitle: String
    description: String
    private: Boolean
    details: [CharacterAttributeInput]
    imageDetails: [CharacterImageDetailsInput]
}

type Mutation {
    createUser(input: CreateUserInput): User
    loginUser(input: LoginUserInput): LoginPayload
    logoutUser(refreshToken: String): Boolean
    extendTokens(refreshToken: String): LoginPayload
    createCharacter(input: CharacterCreateInput, images: [Upload]): Character
    updateCharacter(characterId: String!, input: CharacterUpdateInput, images: [Upload]): Character
    uploadCharacterImages(characterId: String!, images: [Upload]): Character
    updateCharacterImageDetails(input: UpdateCharacterImageDetailsInput): Character
    deleteCharacter(characterId: String!): Boolean
    deleteCharacterImage(characterId: String!, imageId: Int!): Character
    transferCharacter(characterId: String!, newOwnerId: String!): Character
}

`;

export default typeDefs