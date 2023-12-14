import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const ApolloClientInstance = new ApolloClient({
    uri: "http://localhost:4000/",
    cache: new InMemoryCache()
})

export function getCharacters() {
    return ApolloClientInstance.query({
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
        `
    })
}