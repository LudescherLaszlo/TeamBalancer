import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs, resolvers, setWebSocketServer } from './graphql/schema';
import { PrismaClient } from '@prisma/client';
import { mockMatches } from './data/mock-data';
import prisma from './prisma'
import matchRoutes from './routes/match.routes';
import mongoose from 'mongoose';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Create a raw HTTP server to attach both Express AND WebSockets
const httpServer = createServer(app);

// Initialize the WebSocket Server and pass it to our GraphQL schema
const wss = new WebSocketServer({ server: httpServer });
setWebSocketServer(wss);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

// --- DATABASE SEEDING FUNCTION ---
async function seedDatabaseIfEmpty() {
  // --- SEED ROLES, PERMISSIONS, AND USERS ---
  const roleCount = await prisma.role.count();
  if (roleCount === 0) {
    console.log("🔐 Seeding Roles, Permissions, and Users...");
    
    // Create Permissions
    const manageMatches = await prisma.permission.create({ data: { name: "MANAGE_MATCHES" } });
    const manageSim = await prisma.permission.create({ data: { name: "MANAGE_SIMULATION" } });
    const viewStats = await prisma.permission.create({ data: { name: "VIEW_STATS" } });

    // Create Admin Role (Gets all permissions)
    const adminRole = await prisma.role.create({
      data: {
        name: "ADMIN",
        permissions: { connect: [{ id: manageMatches.id }, { id: manageSim.id }, { id: viewStats.id }] }
      }
    });

    // Create Normal User Role (Gets restricted permissions)
    const userRole = await prisma.role.create({
      data: {
        name: "USER",
        permissions: { connect: [{ id: viewStats.id }] }
      }
    });

    // Create Test Users
    await prisma.user.create({
      data: { email: "admin@test.com", password: "password123", roleId: adminRole.id }
    });
    
    await prisma.user.create({
      data: { email: "user@test.com", password: "password123", roleId: userRole.id }
    });
  }

  const matchCount = await prisma.match.count();
  
  if (matchCount === 0) {
    console.log("🌱 Database is empty. Seeding mock data...");
    
    // 1. Create a default tournament to hold the mock matches
    const defaultTournament = await prisma.tournament.create({
      data: {
        name: "Initial Tournament"
      }
    });

    // 2. Loop through the mock data and insert it relationally
    for (const match of mockMatches) {
      await prisma.match.create({
        data: {
          tournament: { connect: { id: defaultTournament.id } },
          date: new Date(match.date),
          scoreA: match.scoreA,
          scoreB: match.scoreB,
          winner: match.winner,
          teamA: {
            create: {
              name: match.teamA.name,
              totalSkill: match.teamA.totalSkill,
              players: {
                // Map over the mock players, ignoring their hardcoded IDs so Prisma generates standard UUIDs
                create: match.teamA.players.map(p => ({
                  name: p.name,
                  skillValue: p.skillValue,
                  skillAdjustment: p.skillAdjustment
                }))
              }
            }
          },
          teamB: {
            create: {
              name: match.teamB.name,
              totalSkill: match.teamB.totalSkill,
              players: {
                create: match.teamB.players.map(p => ({
                  name: p.name,
                  skillValue: p.skillValue,
                  skillAdjustment: p.skillAdjustment
                }))
              }
            }
          }
        }
      });
    }
    console.log("Mock data seeded successfully!");
  } else {
    console.log(`Database already contains ${matchCount} matches. Skipping seed.`);
  }
}

async function startServer() {

  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/teambalancer';
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to MongoDB NoSQL database`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

  await apolloServer.start();

  
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  
  app.use('/api/matches', matchRoutes);

  app.use('/graphql', expressMiddleware(apolloServer));

  // Run the seed check before starting the server
  await seedDatabaseIfEmpty();

  // Listen on 0.0.0.0 to allow network connections
  if (process.env.NODE_ENV !== 'test') {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`GraphQL Server ready at http://0.0.0.0:${PORT}/graphql`);
      console.log(`WebSocket Server ready at ws://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch(console.error);
export { app, httpServer };