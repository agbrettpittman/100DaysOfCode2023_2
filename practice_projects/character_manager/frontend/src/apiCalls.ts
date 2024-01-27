import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { 
    GetCharactersQuery, 
    QueryCharactersArgs,
    CharactersInput,
    GetCharacterQuery,
    GetCharacterQueryVariables,
    CreateCharacterMutation,
    CreateCharacterMutationVariables,
    UpdateCharacterMutation,
    UpdateCharacterMutationVariables,
    DeleteCharacterMutation,
    DeleteCharacterMutationVariables,
    LoginUserMutation,
    LoginUserMutationVariables,
    CreateUserMutation,
    CreateUserMutationVariables,
    CreateUserInput,
    LogoutUserMutation,
    LogoutUserMutationVariables,
    CharacterCreateInput,
    CharacterUpdateInput,
    ForkCharacterMutation,
    ForkCharacterMutationVariables,
    TransferCharacterMutation,
    TransferCharacterMutationVariables
} from '@/__generated__/graphql';
import { setContext } from '@apollo/client/link/context';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { ApolloLink } from '@apollo/client';
import axios, { AxiosRequestConfig } from 'axios';

export function getFile(fileId: string){
    const Options: AxiosRequestConfig = {
        headers: {
            'Authorization': localStorage.getItem('accessToken') || '',
        },
        responseType: 'blob'
    }
    return axios.get(`http://localhost:4000/download/${fileId}`, Options);
}

const httpLink = createHttpLink({
    uri: 'http://localhost:4000/graphql',
});

const uploadLink = createUploadLink({
    uri: 'http://localhost:4000/graphql', // Replace with your file upload endpoint
});
  
const authLink = setContext((_, { headers }) => {
    // Add your headers here
    return {
        headers: {
        ...headers,
        'Authorization': localStorage.getItem('accessToken') || '',
        'Apollo-Require-Preflight': 'true',
        },
    };
});

const ApolloClientInstance = new ApolloClient({
    link: ApolloLink.from([authLink, uploadLink, httpLink  ]),
    cache: new InMemoryCache(),
});

export function getCharacters(useCache = true, input?: CharactersInput){
    return ApolloClientInstance.query<GetCharactersQuery, QueryCharactersArgs>({
        query: gql`
            query getCharacters($input: CharactersInput) {
                characters(input: $input) {
                    _id
                    creator {
                        _id
                        name
                        userName
                        email
                    }
                    owner {
                        _id
                        name
                        userName
                        email
                    }
                    name
                    subTitle
                    description
                    private
                    forkable
                    details {
                        name
                        value
                    }
                    images {
                        filename
                        mainPhoto
                        caption
                    }
                }
            }
        `,
        variables: {
            input
        },
        fetchPolicy: useCache ? 'cache-first' : 'no-cache'
    })
}

export function getCharacter(id: string, useCache = true){
    return ApolloClientInstance.query<GetCharacterQuery, GetCharacterQueryVariables>({
        query: gql`
            query getCharacter($id: String!) {
                character(id: $id) {
                    _id
                    creator {
                        _id
                        name
                        userName
                        email
                    }
                    owner {
                        _id
                        name
                        userName
                        email
                    }
                    name
                    subTitle
                    description
                    private
                    forkable
                    details {
                        name
                        value
                    }
                    images {
                        filename
                        mainPhoto
                        caption
                    }
                }
            }
        `,
        variables: {
            id
        },
        fetchPolicy: useCache ? 'cache-first' : 'no-cache'
    })
}

export function createCharacter(input: CharacterCreateInput, images: File[]){
    return ApolloClientInstance.mutate<CreateCharacterMutation, CreateCharacterMutationVariables>({
        mutation: gql`
            mutation createCharacter($input: CharacterCreateInput!, $images: [Upload]) {
                createCharacter(input: $input, images: $images) {
                    _id
                    creator {
                        _id
                        name
                        userName
                        email
                    }
                    owner {
                        _id
                        name
                        userName
                        email
                    }
                    name
                    subTitle
                    description
                    private
                    details {
                        name
                        value
                    }
                    images {
                        filename
                        mainPhoto
                        caption
                    }
                }
            }
        `,
        variables: {
            input,
            images
        }
    })

}

export function updateCharacter(characterId: string, input: CharacterUpdateInput, images?: File[]){
    return ApolloClientInstance.mutate<UpdateCharacterMutation, UpdateCharacterMutationVariables>({
        mutation: gql`
            mutation updateCharacter($characterId: String!, $input: CharacterUpdateInput!, $images: [Upload]) {
                updateCharacter(characterId: $characterId, input: $input, images: $images) {
                    _id
                    creator {
                        _id
                        name
                        userName
                        email
                    }
                    owner {
                        _id
                        name
                        userName
                        email
                    }
                    name
                    subTitle
                    description
                    private
                    details {
                        name
                        value
                    }
                    images {
                        filename
                        mainPhoto
                        caption
                    }
                }
            }
        `,
        variables: {
            characterId,
            input,
            images
        }
    })


}

export function forkCharacter(characterId: string){
    return ApolloClientInstance.mutate<ForkCharacterMutation, ForkCharacterMutationVariables>({
        mutation: gql`
            mutation forkCharacter($characterId: String!) {
                forkCharacter(characterId: $characterId) {
                    _id
                    creator {
                        _id
                        name
                        userName
                        email
                    }
                    owner {
                        _id
                        name
                        userName
                        email
                    }
                    name
                    subTitle
                    description
                    private
                    details {
                        name
                        value
                    }
                    images {
                        filename
                        mainPhoto
                        caption
                    }
                }
            }
        `,
        variables: {
            characterId
        }
    })
}

export function deleteCharacter(characterId: string){
    return ApolloClientInstance.mutate<DeleteCharacterMutation, DeleteCharacterMutationVariables>({
        mutation: gql`
            mutation deleteCharacter($characterId: String!) {
                deleteCharacter(characterId: $characterId)
            }
        `,
        variables: {
            characterId
        }
    })
}

export function transferCharacter(characterId: string, newOwnerId: string){
    return ApolloClientInstance.mutate<TransferCharacterMutation, TransferCharacterMutationVariables>({
        mutation: gql`
            mutation transferCharacter($characterId: String!, $newOwnerId: String!) {
                transferCharacter(characterId: $characterId, newOwnerId: $newOwnerId) {
                    _id
                    creator {
                        _id
                        name
                        userName
                        email
                    }
                    owner {
                        _id
                        name
                        userName
                        email
                    }
                    name
                    subTitle
                    description
                    private
                    details {
                        name
                        value
                    }
                    images {
                        filename
                        mainPhoto
                        caption
                    }
                
                }
            }
        `,
        variables: {
            characterId,
            newOwnerId
        }
    })
}

export function loginUser(userName: string, password: string){
    return ApolloClientInstance.mutate<LoginUserMutation, LoginUserMutationVariables>({
        mutation: gql`
            mutation loginUser($input: LoginUserInput!) {
                loginUser(input: $input) {
                    accessToken
                    refreshToken
                }
            }
        `,
        variables: {
            input: {
                userName,
                password
            }
        }
    })
}

export function extendTokens(refreshToken: string){
    return ApolloClientInstance.mutate({
        mutation: gql`
            mutation extendTokens($refreshToken: String!) {
                extendTokens(refreshToken: $refreshToken) {
                    accessToken
                    refreshToken
                }
            }
        `,
        variables: {
            refreshToken
        }
    })
}

export function createUser(input: CreateUserInput){
    return ApolloClientInstance.mutate<CreateUserMutation, CreateUserMutationVariables>({
        mutation: gql`
            mutation CreateUser($input: CreateUserInput) {
                createUser(input: $input) {
                    _id
                    name
                    userName
                    email
                }
            }
        `,
        variables: {
            input
        }
    })
}

export function logoutUser(){
    return ApolloClientInstance.mutate<LogoutUserMutation, LogoutUserMutationVariables>({
        mutation: gql`
            mutation logoutUser($refreshToken: String!) {
                logoutUser(refreshToken: $refreshToken)
            }
        `,
        variables: {
            refreshToken: localStorage.getItem('refreshToken') || ''
        }
    })
}

export default ApolloClientInstance;