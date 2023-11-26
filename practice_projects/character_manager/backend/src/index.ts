import { makeExecutableSchema } from "@graphql-tools/schema";
import { ApolloServerPluginDrainHttpServer, ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { GraphQLScalarType } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { useServer } from "graphql-ws/lib/use/ws";
import { Kind } from "graphql/language";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { typeDefs } from "./typeDefs";
import mongoose from "mongoose";
import resolvers from "./resolvers";

const db = mongoose.connection
mongoose.connect("mongodb://localhost:27017/Character-Manager");

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async () => {
    console.log("Connected to database, starting server...")
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
    await new Promise(() => {
        httpServer.listen({ port: 4000 })
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    })
})
