import { PrismaClient } from '@prisma/client';
import { gql } from 'graphql-tag';
import { WebSocketServer, WebSocket } from 'ws';
import { faker } from '@faker-js/faker';
import { matchSchema } from '../validators/match.schema';

// Initialize Prisma
const prisma = new PrismaClient();

// --- WEBSOCKET & SIMULATION ENGINE ---
let wss: WebSocketServer | null = null;
export const setWebSocketServer = (server: WebSocketServer) => { wss = server; };
let simulationInterval: NodeJS.Timeout | null = null;

const broadcast = (data: any) => {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

export const typeDefs = gql`
  type Player { id: ID!, name: String!, skillValue: Int!, skillAdjustment: String! }
  type Team { name: String!, players: [Player!]!, totalSkill: Int! }
  type Match { id: ID!, tournamentId: ID!, date: String!, teamA: Team!, teamB: Team!, scoreA: Int!, scoreB: Int!, winner: String! }
  type Tournament { id: ID!, name: String!, status: String!, matches: [Match!]! }
  type MatchConnection { edges: [Match!]!, pageInfo: PageInfo! }
  type PageInfo { hasNextPage: Boolean!, endCursor: String }
  type TournamentStats { totalMatches: Int!, teamAWins: Int!, teamBWins: Int!, avgSkillDiff: Int! }

  type Query {
    tournaments: [Tournament!]!
    tournament(id: ID!): Tournament
    matches(tournamentId: ID, cursor: String, limit: Int = 5): MatchConnection!
    tournamentStats(tournamentId: ID!): TournamentStats!
  }

  input PlayerInput { name: String!, skillValue: Int!, skillAdjustment: String! }
  input TeamInput { name: String!, players: [PlayerInput!]!, totalSkill: Int! }
  input MatchInput { tournamentId: ID!, date: String!, teamA: TeamInput!, teamB: TeamInput!, scoreA: Int!, scoreB: Int!, winner: String! }

  type Mutation {
    createTournament(name: String!): Tournament!
    createMatch(input: MatchInput!): Match!
    updateMatch(id: ID!, input: MatchInput!): Match!
    deleteMatch(id: ID!): Boolean!
    startSimulation(tournamentId: ID!): Boolean!
    stopSimulation: Boolean!
  }
`;

export const resolvers = {
  Query: {
    tournaments: async () => {
      return await prisma.tournament.findMany();
    },
    
    tournament: async (_: any, { id }: { id: string }) => {
      return await prisma.tournament.findUnique({ where: { id } });
    },
    
    matches: async (_: any, { tournamentId, cursor, limit }: { tournamentId?: string, cursor?: string, limit: number }) => {
      // Prisma cursor-based pagination
      const dbMatches = await prisma.match.findMany({
        take: limit + 1, // Fetch one extra to check if there's a next page
        where: tournamentId ? { tournamentId } : {},
        orderBy: { date: 'desc' },
        ...(cursor && { cursor: { id: cursor }, skip: 1 }), // Skip the cursor itself
        include: {
          teamA: { include: { players: true } },
          teamB: { include: { players: true } }
        }
      });

      const hasNextPage = dbMatches.length > limit;
      const edges = hasNextPage ? dbMatches.slice(0, -1) : dbMatches; // Drop the extra item
      const endCursor = edges.length > 0 ? edges[edges.length - 1].id : null;

      return { edges, pageInfo: { hasNextPage, endCursor } };
    },
    
    tournamentStats: async (_: any, { tournamentId }: { tournamentId: string }) => {
      // Using SQL COUNT for performance
      const teamAWins = await prisma.match.count({ where: { tournamentId, winner: "Team A" } });
      const teamBWins = await prisma.match.count({ where: { tournamentId, winner: "Team B" } });
      
      const matches = await prisma.match.findMany({
        where: { tournamentId },
        include: { teamA: true, teamB: true }
      });
      
      const totalMatches = matches.length;
      if (totalMatches === 0) return { totalMatches: 0, teamAWins: 0, teamBWins: 0, avgSkillDiff: 0 };
      
      const avgSkillDiff = matches.reduce((sum, m) => sum + Math.abs(m.teamA.totalSkill - m.teamB.totalSkill), 0) / totalMatches;
      return { totalMatches, teamAWins, teamBWins, avgSkillDiff: Math.round(avgSkillDiff) };
    }
  },
  
  Tournament: {
    matches: async (parent: any) => {
      return await prisma.match.findMany({ 
        where: { tournamentId: parent.id },
        include: { teamA: { include: { players: true } }, teamB: { include: { players: true } } },
        orderBy: { date: 'desc' }
      });
    }
  },
  
  Mutation: {
    createTournament: async (_: any, { name }: { name: string }) => {
      return await prisma.tournament.create({
        data: { name }
      });
    },
    
    createMatch: async (_: any, { input }: { input: any }) => {
      const validatedInput = matchSchema.parse(input); 
      
      const newMatch = await prisma.match.create({
        data: {
          tournament: { connect: { id: validatedInput.tournamentId } },
          
          date: new Date(validatedInput.date),
          scoreA: validatedInput.scoreA,
          scoreB: validatedInput.scoreB,
          winner: validatedInput.winner,
          teamA: {
            create: {
              name: validatedInput.teamA.name,
              totalSkill: validatedInput.teamA.totalSkill,
              players: { create: validatedInput.teamA.players }
            }
          },
          teamB: {
            create: {
              name: validatedInput.teamB.name,
              totalSkill: validatedInput.teamB.totalSkill,
              players: { create: validatedInput.teamB.players }
            }
          }
        },
        include: { teamA: { include: { players: true } }, teamB: { include: { players: true } } }
      });
      
      return newMatch;
    },
    
    updateMatch: async (_: any, { id, input }: { id: string, input: any }) => {
      const validatedInput = matchSchema.parse(input);
      // Because relational updates are highly complex (updating nested players), 
      // the standard pattern here is to update the top-level match stats (scores/winner).
      const updatedMatch = await prisma.match.update({
        where: { id },
        data: {
          scoreA: validatedInput.scoreA,
          scoreB: validatedInput.scoreB,
          winner: validatedInput.winner,
        },
        include: { teamA: { include: { players: true } }, teamB: { include: { players: true } } }
      });
      return updatedMatch;
    },
    
    deleteMatch: async (_: any, { id }: { id: string }) => {
      try {
        // Because of the 'onDelete: Cascade' in your schema, deleting the match 
        // automatically deletes the connected teams and players!
        await prisma.match.delete({ where: { id } });
        return true;
      } catch (e) {
        return false;
      }
    },
    
    startSimulation: async (_: any, { tournamentId }: { tournamentId: string }) => {
      if (simulationInterval) clearInterval(simulationInterval);
      
      simulationInterval = setInterval(async () => {
        const baseSkill = faker.number.int({ min: 60, max: 100 });
        const diff = faker.number.int({ min: 0, max: 15 });
        const scoreA = faker.number.int({ min: 15, max: 25 });
        const scoreB = faker.number.int({ min: 15, max: 25 });

        // Generate and save Faker data directly to the SQLite DB
        const dbMatch = await prisma.match.create({
          data: {
            tournament: { connect: { id: tournamentId } },
            scoreA,
            scoreB,
            winner: scoreA > scoreB ? "Team A" : "Team B",
            teamA: {
              create: {
                name: "Team A",
                totalSkill: baseSkill,
                players: {
                  create: Array.from({ length: 2 }).map((_, idx) => ({
                    name: faker.person.fullName(),
                    skillValue: Math.floor(baseSkill / 2),
                    skillAdjustment: faker.helpers.arrayElement(["+1", "+0", "-1"])
                  }))
                }
              }
            },
            teamB: {
              create: {
                name: "Team B",
                totalSkill: baseSkill - diff + faker.number.int({ min: 0, max: diff * 2 }),
                players: {
                  create: Array.from({ length: 2 }).map((_, idx) => ({
                    name: faker.person.fullName(),
                    skillValue: Math.floor(baseSkill / 2),
                    skillAdjustment: faker.helpers.arrayElement(["+1", "+0", "-1"])
                  }))
                }
              }
            }
          },
          include: { teamA: { include: { players: true } }, teamB: { include: { players: true } } }
        });
        
        // Broadcast the real DB match to the frontend
        broadcast({ type: 'NEW_MATCH', payload: dbMatch });
      }, 2000); // Generates a match every 2 seconds
      
      return true;
    },
    
    stopSimulation: () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      }
      return true;
    }
  }
};