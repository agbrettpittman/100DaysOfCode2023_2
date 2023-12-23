import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { 
    GetCharactersQuery, 
    QueryCharactersArgs,
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
    CharacterCreateInput,
    CharacterUpdateInput,
} from '@/__generated__/graphql';
import { setContext } from '@apollo/client/link/context';


const httpLink = createHttpLink({
    uri: 'http://localhost:4000/',
  });
  
  const authLink = setContext((_, { headers }) => {
    // Add your headers here
    return {
      headers: {
        ...headers,
        'Authorization': localStorage.getItem('accessToken') || '',
      },
    };
  });
  
  const ApolloClientInstance = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

export function getCharacters(useCache = true, name = ""){
    return ApolloClientInstance.query<GetCharactersQuery, QueryCharactersArgs>({
        query: gql`
            query getCharacters($name: String) {
                characters(name: $name) {
                    _id
                    creatorId
                    ownerId
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
            name
        },
        fetchPolicy: useCache ? 'cache-first' : 'no-cache'
    })
}

export function getCharacter(id: string){
    return ApolloClientInstance.query<GetCharacterQuery, GetCharacterQueryVariables>({
        query: gql`
            query getCharacter($id: String!) {
                character(id: $id) {
                    _id
                    creatorId
                    ownerId
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
            id
        }
    })
}

export function createCharacter(){

    const randomNumber = Math.floor(Math.random() * 1000)
    const characterInput:CharacterCreateInput = {
        description: "Blonde Hair Viking",
        name: `Ragnar ${randomNumber}`,
        subTitle: "Viking Leader",
        details: [
            {
                name: "Equipment",
                value: "Dual Axes"
            }
        ],
    };

    return ApolloClientInstance.mutate<CreateCharacterMutation, CreateCharacterMutationVariables>({
        mutation: gql`
            mutation createCharacter($input: CharacterCreateInput!) {
                createCharacter(input: $input) {
                    _id
                    creatorId
                    ownerId
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
            input: characterInput
        }
    })

}

export function updateCharacter(characterId: string, input: CharacterUpdateInput){
    return ApolloClientInstance.mutate<UpdateCharacterMutation, UpdateCharacterMutationVariables>({
        mutation: gql`
            mutation updateCharacter($characterId: String!, $input: CharacterUpdateInput!) {
                updateCharacter(characterId: $characterId, input: $input) {
                    _id
                    creatorId
                    ownerId
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
            input
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

export function loginUser(userName: string, password: string){
    return ApolloClientInstance.mutate<LoginUserMutation, LoginUserMutationVariables>({
        mutation: gql`
            mutation loginUser($input: LoginUserInput!) {
                loginUser(input: $input) {
                    accessToken
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

export default ApolloClientInstance;