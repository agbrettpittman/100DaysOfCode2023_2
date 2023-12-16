import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { GetCharactersQuery, 
    GetCharactersQueryVariables, 
    GetCharacterQuery,
    GetCharacterQueryVariables,
    CreateCharacterMutation,
    CreateCharacterMutationVariables,
    CharacterCreateInput
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

export function getCharacters(){
    return ApolloClientInstance.query<GetCharactersQuery, GetCharactersQueryVariables>({
        query: gql`
            query getCharacters {
                characters {
                    _id
                    creatorId
                    ownerId
                    name
                    subTitle
                    description
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
                name: "Dual Axes",
                value: "Equipment"
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