import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './graphql/schema';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Apollo Server
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

async function startServer() {
  // Start the Apollo Server instance
  await apolloServer.start();

  // Standard middleware
  app.use(cors());
  app.use(express.json());

  // Mount Apollo middleware at the /graphql endpoint
  app.use('/graphql', expressMiddleware(apolloServer));

  // Only listen if this file is run directly (keeps Jest tests from hanging)
  /* istanbul ignore next */
  if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}/graphql`);
    });
  }
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});

// Export the app for testing purposes
export { app };