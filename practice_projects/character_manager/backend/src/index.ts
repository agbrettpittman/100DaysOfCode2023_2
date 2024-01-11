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
import typeDefs from "./typeDefs.js";
import mongoose from "mongoose";
import resolvers from "./resolvers.js"
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { graphqlUploadExpress } from "graphql-upload-ts";
import cron from 'node-cron';
import { RefreshTokensModel } from "./database/schemas.js";
import gql from "graphql-tag";
import mmm from 'mmmagic'
import { promisify } from "util";
import cors from 'cors';
import fs from 'fs';

const { Magic, MAGIC_MIME_TYPE } = mmm;

dotenv.config();
const db = mongoose.connection
mongoose.connect("mongodb://localhost:27017/Character-Manager");

function deleteOldRefreshTokens(){
    console.log("Deleting expired refresh tokens")
    RefreshTokensModel.deleteMany({ expires: { $lt: new Date() } }).then(({ deletedCount }) => {
        console.log(`Deleted ${deletedCount} refresh tokens`)
    }).catch((err) => {
        console.log(err)
    })
}

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

    // custom plugin for logging any graphql errors
    const responseLogging = {
        async requestDidStart() {
          return {
            async willSendResponse({ request, response }) {
                if (request.operationName === 'IntrospectionQuery') return;
                const GQLObject = gql`${request.query}`
                let operation = "Unknown"
                let operationName = "Unknown Operation"
                let status = "Success"
                if (GQLObject.definitions.length > 0) {
                    if (GQLObject.definitions[0].kind === "OperationDefinition") {
                        operation = GQLObject.definitions[0].operation
                        operationName = GQLObject.definitions[0].name?.value || "Unknown Operation"
                    }
                }
                if (response.errors) {
                    status = "Error"
                    const ErrorString = `[${operation}] ${operationName} -> ${status}`
                    // log the error in red
                    console.error("\x1b[31m%s\x1b[0m", ErrorString)
                    console.error(response.errors)

                } else {
                    const SuccessString = `[${operation}] ${operationName} -> ${status}`
                    // log the success in green
                    console.log("\x1b[32m%s\x1b[0m", SuccessString)
                }
            },
          };
        },
      };

    const server = new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: 'bounded',
        context: ({ req, res }) => {
            const token = req.headers.authorization || null;
            if (token) {
                try {
                    const { userId, expiration } = jwt.verify(token, process.env.JWT_SECRET);
                    if (new Date(expiration) < new Date()) throw new Error('Token expired');
                    return { userId };
                } catch (err) {
                    console.log(err.message);
                }
            }
            return { userId: null, req, res }
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
            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
            responseLogging
        ],
    });

    // Creating the WebSocket server
    const wsServer = new WebSocketServer({
        // This is the `httpServer` we created in a previous step.
        server: httpServer,
        // Pass a different path here if your ApolloServer serves at
        // a different path.
        path: '/graphql',
    });

    // Hand in the schema we just created and have the
    // WebSocketServer start listening.
    const serverCleanup = useServer({ schema }, wsServer);
  
    // More required logic for integrating with Express
    await server.start();

    app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

    server.applyMiddleware({
      app,
  
      // By default, apollo-server hosts its GraphQL endpoint at the
      // server root. However, *other* Apollo Server packages host it at
      // /graphql. Optionally provide this to match apollo-server.
      path: '/graphql',
    });

    app.use(
        '/download',
        cors({
            origin: 'http://127.0.0.1:3000', 
            credentials: true,
            allowedHeaders: ['Content-Disposition', 'Authorization']
        }),
    );

    app.get('/download/:filename', async (req, res) => {
        const token = req.headers.authorization || null;
        if (!token) {
            res.status(401).send('Unauthorized');
            return;
        } else {
            try {
                const { userId, expiration } = jwt.verify(token, process.env.JWT_SECRET);
                if (new Date(expiration) < new Date()) {
                    res.status(401).send('Unauthorized');
                    return;
                }
            } catch (err) {
                console.log(err.message);
            }
        }
        const filename = req.params.filename;
        const filePath = `./uploads/${filename}`;
        // verify existence of file

        try {
            fs.accessSync(filePath, fs.constants.R_OK);
        } catch (err) {
            console.log(err);
            res.status(404).send('File not found');
            return;
        }

        const magic = new Magic(MAGIC_MIME_TYPE);
        const detectFilePromise = promisify(magic.detectFile.bind(magic));
        const DetectedMIME = await detectFilePromise(filePath);
        const newFileName = filename.split('.')[0] + '.' + DetectedMIME.split('/')[1]
        res.setHeader("Access-Control-Expose-Headers", "X-Suggested-Filename");
        res.setHeader("X-Suggested-Filename", newFileName);
        console.log(`sending file ${filePath} as ${newFileName}`)
        res.download(filePath, newFileName, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error downloading the file');
          }
        });
      });
  
    // Modified server startup
    await new Promise(() => {

        deleteOldRefreshTokens()
        cron.schedule('0 0 * * *', () => {
            deleteOldRefreshTokens()
        })

        httpServer.listen({ port: 4000 })
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    })
})
