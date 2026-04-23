import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs, resolvers, setWebSocketServer } from './graphql/schema';

const app = express();
const PORT = process.env.PORT || 3000;

// Create a raw HTTP server to attach both Express AND WebSockets
const httpServer = createServer(app);

// Initialize the WebSocket Server and pass it to our GraphQL schema
const wss = new WebSocketServer({ server: httpServer });
setWebSocketServer(wss);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  await apolloServer.start();

  app.use(cors());
  app.use(express.json());
  
  app.use('/graphql', expressMiddleware(apolloServer));

  httpServer.listen(PORT, () => {
    console.log(`GraphQL Server ready at http://localhost:${PORT}/graphql`);
    console.log(`WebSocket Server ready at ws://localhost:${PORT}`);
  });
}

startServer().catch(console.error);