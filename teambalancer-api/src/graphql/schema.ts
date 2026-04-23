import { gql } from 'graphql-tag';
import { WebSocketServer, WebSocket } from 'ws';
import { faker } from '@faker-js/faker';
import { matchesStore, tournamentsStore, Match, Tournament } from '../data/store';
import { matchSchema } from '../validators/match.schema';

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

  input PlayerInput { id: ID, name: String!, skillValue: Int!, skillAdjustment: String! }
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
    tournaments: () => tournamentsStore,
    tournament: (_: any, { id }: { id: string }) => tournamentsStore.find(t => t.id === id),
    matches: (_: any, { tournamentId, cursor, limit }: { tournamentId?: string, cursor?: string, limit: number }) => {
      let filtered = tournamentId ? matchesStore.filter(m => m.tournamentId === tournamentId) : matchesStore;
      let startIndex = 0;
      if (cursor) {
        const cursorIndex = filtered.findIndex(m => m.id === cursor);
        if (cursorIndex >= 0) startIndex = cursorIndex + 1;
      }
      const paginatedMatches = filtered.slice(startIndex, startIndex + limit);
      const hasNextPage = startIndex + limit < filtered.length;
      const endCursor = paginatedMatches.length > 0 ? paginatedMatches[paginatedMatches.length - 1].id : null;
      return { edges: paginatedMatches, pageInfo: { hasNextPage, endCursor } };
    },
    tournamentStats: (_: any, { tournamentId }: { tournamentId: string }) => {
      const tMatches = matchesStore.filter(m => m.tournamentId === tournamentId);
      const totalMatches = tMatches.length;
      if (totalMatches === 0) return { totalMatches: 0, teamAWins: 0, teamBWins: 0, avgSkillDiff: 0 };
      const teamAWins = tMatches.filter(m => m.winner === "Team A").length;
      const teamBWins = tMatches.filter(m => m.winner === "Team B").length;
      const avgSkillDiff = tMatches.reduce((sum, m) => sum + Math.abs(m.teamA.totalSkill - m.teamB.totalSkill), 0) / totalMatches;
      return { totalMatches, teamAWins, teamBWins, avgSkillDiff: Math.round(avgSkillDiff) };
    }
  },
  Tournament: {
    matches: (parent: Tournament) => matchesStore.filter(m => m.tournamentId === parent.id)
  },
  Mutation: {
    createTournament: (_: any, { name }: { name: string }) => {
      const newTourney: Tournament = { id: `t_${Date.now()}`, name, status: "Active" };
      tournamentsStore.push(newTourney);
      return newTourney;
    },
    createMatch: (_: any, { input }: { input: any }) => {
      const validatedInput = matchSchema.parse(input); 
      const newMatch = { id: `m_${Date.now()}`, ...validatedInput };
      matchesStore.unshift(newMatch);
      return newMatch;
    },
    updateMatch: (_: any, { id, input }: { id: string, input: any }) => {
      const index = matchesStore.findIndex(m => m.id === id);
      if (index === -1) throw new Error("Match not found");
      const validatedInput = matchSchema.parse(input);
      matchesStore[index] = { id, ...validatedInput };
      return matchesStore[index];
    },
    deleteMatch: (_: any, { id }: { id: string }) => {
      const index = matchesStore.findIndex(m => m.id === id);
      if (index === -1) return false;
      matchesStore.splice(index, 1);
      return true;
    },
    // --- NEW SIMULATION MUTATIONS ---
    startSimulation: (_: any, { tournamentId }: { tournamentId: string }) => {
      if (simulationInterval) clearInterval(simulationInterval);
      
      simulationInterval = setInterval(() => {
        const baseSkill = faker.number.int({ min: 60, max: 100 });
        const diff = faker.number.int({ min: 0, max: 15 });
        const scoreA = faker.number.int({ min: 15, max: 25 });
        const scoreB = faker.number.int({ min: 15, max: 25 });

        const newMatch = {
          id: `m_${Date.now()}`,
          tournamentId,
          date: new Date().toISOString(),
          scoreA,
          scoreB,
          winner: scoreA > scoreB ? "Team A" : "Team B",
          teamA: {
            name: "Team A",
            totalSkill: baseSkill,
            players: Array.from({ length: 2 }).map(() => ({
              id: faker.string.uuid(),
              name: faker.person.fullName(),
              skillValue: Math.floor(baseSkill / 2),
              skillAdjustment: faker.helpers.arrayElement(["+1", "+0", "-1"])
            }))
          },
          teamB: {
            name: "Team B",
            totalSkill: baseSkill - diff + faker.number.int({ min: 0, max: diff * 2 }),
            players: Array.from({ length: 2 }).map(() => ({
              id: faker.string.uuid(),
              name: faker.person.fullName(),
              skillValue: Math.floor(baseSkill / 2),
              skillAdjustment: faker.helpers.arrayElement(["+1", "+0", "-1"])
            }))
          }
        };
        
        matchesStore.unshift(newMatch);
        broadcast({ type: 'NEW_MATCH', payload: newMatch });
      }, 2000);
      
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