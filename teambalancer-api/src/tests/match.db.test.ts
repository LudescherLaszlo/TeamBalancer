import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import prisma from '../prisma';
import { resolvers } from '../graphql/schema';

jest.mock('../prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>;

describe('Database CRUD Operations (Prisma)', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe('CREATE Operations', () => {
    it('should successfully create a match with nested teams and players in the DB', async () => {
      // Setup Mock Data
      const mockInput = {
        tournamentId: 'tourney-123',
        date: new Date().toISOString(),
        scoreA: 21,
        scoreB: 19,
        winner: 'Team A',
        teamA: { name: 'Team A', totalSkill: 100, players: [{ name: 'Player 1', skillValue: 50, skillAdjustment: '+0' }] },
        teamB: { name: 'Team B', totalSkill: 90, players: [{ name: 'Player 2', skillValue: 45, skillAdjustment: '+0' }] }
      };

      const mockResolvedMatch = { id: 'match-1', ...mockInput };
      
      // Mock the Prisma response
      prismaMock.match.create.mockResolvedValue(mockResolvedMatch as any);

      // Execute the resolver
      const result = await resolvers.Mutation.createMatch(null, { input: mockInput });

      // Assertions
      expect(result).toEqual(mockResolvedMatch);
      expect(prismaMock.match.create).toHaveBeenCalledTimes(1);
      
      // Verify the EXACT structure sent to the database (Ensuring 3NF relational mapping)
      expect(prismaMock.match.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tournament: { connect: { id: 'tourney-123' } },
          scoreA: 21,
          scoreB: 19,
          winner: 'Team A',
          teamA: expect.objectContaining({
            create: expect.objectContaining({ name: 'Team A' })
          })
        }),
        include: { teamA: { include: { players: true } }, teamB: { include: { players: true } } }
      });
    });
  });

  describe('READ Operations', () => {
    it('should fetch a paginated list of matches from the DB', async () => {
      const mockDbMatches = [
        { id: 'match-1', scoreA: 10, scoreB: 5 },
        { id: 'match-2', scoreA: 15, scoreB: 20 },
      ];

      // Mock Prisma returning our array
      prismaMock.match.findMany.mockResolvedValue(mockDbMatches as any);

      const result = await resolvers.Query.matches(null, { tournamentId: 'tourney-123', limit: 1 });

      expect(prismaMock.match.findMany).toHaveBeenCalledTimes(1);
      expect(result.edges.length).toBeGreaterThan(0);
      expect(result.pageInfo).toHaveProperty('hasNextPage');
    });

    it('should calculate accurate Tournament Stats via SQL Count', async () => {
      prismaMock.match.count
        .mockResolvedValueOnce(5) // Team A wins
        .mockResolvedValueOnce(3); // Team B wins
        
      prismaMock.match.findMany.mockResolvedValue([
        { teamA: { totalSkill: 100 }, teamB: { totalSkill: 90 } } as any
      ]);

      const stats = await resolvers.Query.tournamentStats(null, { tournamentId: 'tourney-123' });

      expect(stats.teamAWins).toBe(5);
      expect(stats.teamBWins).toBe(3);
      expect(stats.avgSkillDiff).toBe(10);
    });
  });

  describe('UPDATE Operations', () => {
    it('should update the top-level match scores and winner in the DB', async () => {
      const updateInput = {
        tournamentId: 'tourney-123',
        date: new Date().toISOString(),
        scoreA: 25,
        scoreB: 23,
        winner: 'Team A',
        teamA: { name: 'Team A', totalSkill: 100, players: [] },
        teamB: { name: 'Team B', totalSkill: 90, players: [] }
      };

      const expectedUpdate = { id: 'match-1', scoreA: 25, scoreB: 23, winner: 'Team A' };
      prismaMock.match.update.mockResolvedValue(expectedUpdate as any);

      const result = await resolvers.Mutation.updateMatch(null, { id: 'match-1', input: updateInput });

      expect(result).toEqual(expectedUpdate);
      expect(prismaMock.match.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'match-1' },
        data: expect.objectContaining({
          scoreA: 25,
          scoreB: 23,
          winner: 'Team A'
        })
      }));
    });
  });

  describe('DELETE Operations', () => {
    it('should successfully delete a match from the DB', async () => {
      prismaMock.match.delete.mockResolvedValue({ id: 'match-1' } as any);

      const result = await resolvers.Mutation.deleteMatch(null, { id: 'match-1' });

      expect(result).toBe(true);
      expect(prismaMock.match.delete).toHaveBeenCalledWith({
        where: { id: 'match-1' }
      });
    });

    it('should handle deletion failures gracefully (e.g. Match not found)', async () => {
      prismaMock.match.delete.mockRejectedValue(new Error('Record not found'));

      const result = await resolvers.Mutation.deleteMatch(null, { id: 'fake-id' });

      expect(result).toBe(false); // Your resolver catches errors and returns boolean false
    });
  });
});