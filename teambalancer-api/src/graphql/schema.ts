import { gql } from 'graphql-tag';
import { matchesStore, tournamentsStore, Match, Tournament } from '../data/store';
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
    updateMatch(id: ID!, input: MatchInput!): Match!  # <-- Added Update Mutation
    deleteMatch(id: ID!): Boolean!
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
      const newMatch = { id: `m_${Date.now()}`, ...input };
      matchesStore.unshift(newMatch);
      return newMatch;
    },
    // <-- Added Update Resolver -->
    updateMatch: (_: any, { id, input }: { id: string, input: any }) => {
      const index = matchesStore.findIndex(m => m.id === id);
      if (index === -1) throw new Error("Match not found");
      matchesStore[index] = { id, ...input };
      return matchesStore[index];
    },
    deleteMatch: (_: any, { id }: { id: string }) => {
      const index = matchesStore.findIndex(m => m.id === id);
      if (index === -1) return false;
      matchesStore.splice(index, 1);
      return true;
    }
  }
};