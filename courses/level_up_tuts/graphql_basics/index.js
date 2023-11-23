const { gql } = require('graphql-tag');
const { ApolloServer } = require('apollo-server-express');
const { 
    ApolloServerPluginDrainHttpServer, 
    ApolloServerPluginLandingPageLocalDefault 
} = require('apollo-server-core');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const express = require('express');
const { createServer} = require('http')
const { PubSub } = require('graphql-subscriptions');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const {Songs, Tags} = require('./data.js')
const mongoose = require('mongoose')
const db = mongoose.connection

mongoose.connect('mongodb://localhost:27017/Song-Tracker')

const SongsSchema = new mongoose.Schema({
    title: String,
    artist: String,
    releaseDate: Date,
    genre: String,
    rating: Number,
    tagIds: [String],
    status: String
})

const SongsModel = mongoose.model('Songs', SongsSchema)

const typeDefs = gql`

    scalar Date

    enum Status {
        LISTENED
        UNLISTENED
        LIKED
        DISLIKED
        UNKNOWN
    }

    type Tag {
        id: ID
        name: String!
    }

    type Song {
        id: ID
        title: String
        artist: String
        releaseDate: Date
        genre: String
        rating: Int
        tags: [Tag]
        status: Status
    }

    type Query {
        songs: [Song]
        song(id: ID): Song
    }

    input TagInput {
        id: ID!
    }

    input SongInput {
        title: String
        artist: String
        releaseDate: Date
        genre: String
        rating: Int
        tags: [TagInput]
        status: Status
    }

    type Mutation {
        addSong(song: SongInput): Song
    }

    type Subscription {
        songAdded: Song
    }

`

const pubsub = new PubSub()
const SONG_ADDED = 'SONG_ADDED'

const resolvers = {
    Query: {
        songs: async () => {
            try {
                return await SongsModel.find()
            } catch (err) {
                throw new Error(err)
            }
        },
        song: async (obj, { id }, context, info) => {
            try {
                return await SongsModel.findById(id)
            } catch (err) {
                throw new Error(err)
            }
        }
    },

    Mutation: {
        addSong: (obj, { song }, { userId }, info) => {
            if (!userId) throw new Error('Not authorized')
            try {
                const newSong = SongsModel.create({...song})
                pubsub.publish(SONG_ADDED, { songAdded: newSong })
                return newSong
            } catch (err) {
                throw new Error(err)
            }
        }
    },
    
    Subscription: {
        songAdded: {
            subscribe: () => pubsub.asyncIterator([SONG_ADDED])
        }
    },

    Song: {
        tags: (obj, args, context, info) => {
            return obj.tags.map(tag => Tags.find(t => t.id == tag.id))
        }
    },

    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        // value from the client
        parseValue(value) {
            const dateValue = new Date(value)
            if (isNaN(dateValue.getTime())) {
                throw new Error('Invalid date')
            }
            // put into mysql format
            return dateValue.toISOString().slice(0, 19).replace('T', ' ')
        },
        // value sent to the client
        serialize(value) {
            return value
        },
        // value from the client in ast format
        parseLiteral(ast) {
            if (ast.kind === Kind.STRING) {
                const dateValue = new Date(ast.value)
                if (isNaN(dateValue.getTime())) {
                    throw new Error('Invalid date')
                }
                // put into mysql format
                return dateValue.toISOString().slice(0, 19).replace('T', ' ')
            }
            return null
        }
    })
}

async function startApolloServer(typeDefs, resolvers) {
    // Required logic for integrating with Express
    const app = express();
    // Our httpServer handles incoming requests to our Express app.
    // Below, we tell Apollo Server to "drain" this httpServer,
    // enabling our servers to shut down gracefully.
    const httpServer = createServer(app);
  
    // Same ApolloServer initialization as before, plus the drain plugin
    // for our httpServer.
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: 'bounded',
        context: ({ req }) => {
            return { userId: 1 }
        },
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),

            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                return {
                    async drainServer() {
                    await serverCleanup.dispose();
                    },
                };
                },
            },
            ApolloServerPluginLandingPageLocalDefault({ embed: true })
        ],
    });

    // Creating the WebSocket server
    const wsServer = new WebSocketServer({
        // This is the `httpServer` we created in a previous step.
        server: httpServer,
        // Pass a different path here if your ApolloServer serves at
        // a different path.
        path: '/',
    });

    // Hand in the schema we just created and have the
    // WebSocketServer start listening.
    const serverCleanup = useServer({ schema }, wsServer);
  
    // More required logic for integrating with Express
    await server.start();
    server.applyMiddleware({
      app,
  
      // By default, apollo-server hosts its GraphQL endpoint at the
      // server root. However, *other* Apollo Server packages host it at
      // /graphql. Optionally provide this to match apollo-server.
      path: '/',
    });
  
    // Modified server startup
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
    console.log('Connected to mongodb, starting server...')
    startApolloServer(typeDefs, resolvers)
})
