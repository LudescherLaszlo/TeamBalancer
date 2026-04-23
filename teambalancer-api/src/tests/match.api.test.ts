import request from 'supertest';
import { app } from '../server';
import { matchesStore } from '../data/store';

describe('Matches API Endpoints', () => {
  // Before each test, we clear the RAM store to ensure a clean slate
  beforeEach(() => {
    matchesStore.length = 0; 
  });

  const validMatchPayload = {
    date: "2026-03-10",
    teamA: {
      name: "Team A",
      totalSkill: 100,
      players: [{ name: "Test Player 1", skillValue: 50, skillAdjustment: "+0" }]
    },
    teamB: {
      name: "Team B",
      totalSkill: 90,
      players: [{ name: "Test Player 2", skillValue: 45, skillAdjustment: "+0" }]
    },
    scoreA: 21,
    scoreB: 19,
    winner: "Team A"
  };

  describe('POST /api/matches', () => {
    it('should create a new match successfully', async () => {
      const res = await request(app).post('/api/matches').send(validMatchPayload);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.scoreA).toBe(21);
      expect(matchesStore.length).toBe(1);
    });

    it('should fallback to default values for missing forgiving fields', async () => {
      const bareBonesPayload = {
        teamA: { players: [] },
        teamB: { players: [] }
      };
      const res = await request(app).post('/api/matches').send(bareBonesPayload);
      expect(res.statusCode).toEqual(201);
      expect(res.body.scoreA).toBe(0); // Caught by Zod .catch(0)
      expect(res.body.winner).toBe("Team A"); // Caught by transform
    });
  });

  describe('GET /api/matches', () => {
    it('should fetch paginated matches', async () => {
      // Seed the store with 3 matches
      await request(app).post('/api/matches').send(validMatchPayload);
      await request(app).post('/api/matches').send(validMatchPayload);
      await request(app).post('/api/matches').send(validMatchPayload);

      const res = await request(app).get('/api/matches?page=1&limit=2');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.total).toBe(3);
      expect(res.body.meta.totalPages).toBe(2);
    });
  });

  describe('GET /api/matches/:id', () => {
    it('should return 404 if match is not found', async () => {
      const res = await request(app).get('/api/matches/999');
      expect(res.statusCode).toEqual(404);
    });

    it('should return the match if found', async () => {
      const created = await request(app).post('/api/matches').send(validMatchPayload);
      const res = await request(app).get(`/api/matches/${created.body.id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body.id).toEqual(created.body.id);
    });
  });

  describe('PATCH /api/matches/:id', () => {
    it('should update a match successfully', async () => {
      const created = await request(app).post('/api/matches').send(validMatchPayload);
      
      const res = await request(app)
        .patch(`/api/matches/${created.body.id}`)
        .send({ scoreA: 25, winner: "Team B" }); // Partial update

      expect(res.statusCode).toEqual(200);
      expect(res.body.scoreA).toBe(25);
      expect(res.body.winner).toBe("Team B");
    });

    it('should return 404 for updating non-existent match', async () => {
      const res = await request(app).patch('/api/matches/999').send({ scoreA: 25 });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('DELETE /api/matches/:id', () => {
    it('should delete a match successfully', async () => {
      const created = await request(app).post('/api/matches').send(validMatchPayload);
      
      const deleteRes = await request(app).delete(`/api/matches/${created.body.id}`);
      expect(deleteRes.statusCode).toEqual(204);
      expect(matchesStore.length).toBe(0);
    });

    it('should return 404 for deleting non-existent match', async () => {
      const res = await request(app).delete('/api/matches/999');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('GET /api/matches/stats', () => {
    it('should calculate statistics correctly', async () => {
      await request(app).post('/api/matches').send(validMatchPayload); // Team A wins
      
      const teamBWinPayload = { ...validMatchPayload, winner: "Team B" };
      await request(app).post('/api/matches').send(teamBWinPayload); // Team B wins

      const res = await request(app).get('/api/matches/stats'); // Wait wait, /stats is intercepted by router
      // Note: Because router.get('/stats') is registered BEFORE router.get('/:id'), this will hit the stats controller.
      
      // I need to use the correct URL
      const statsRes = await request(app).get('/api/matches/stats');
      
      expect(statsRes.statusCode).toEqual(200);
      expect(statsRes.body.totalMatches).toBe(2);
      expect(statsRes.body.teamAWins).toBe(1);
      expect(statsRes.body.teamBWins).toBe(1);
      expect(statsRes.body.winRateA).toBe(50);
      expect(statsRes.body.avgSkillDiff).toBe(10); // 100 - 90 = 10
    });

    it('should return empty stats if no matches exist', async () => {
      const res = await request(app).get('/api/matches/stats');
      expect(res.statusCode).toEqual(200);
      expect(res.body.totalMatches).toBe(0);
    });
  });
  describe('Edge Cases & Error Handling (Coverage Hunters)', () => {
    
    // Covers match.schema.ts Line 7
    it('should use existing player ID if provided in the payload', async () => {
      const payloadWithId = {
        ...validMatchPayload,
        teamA: {
          ...validMatchPayload.teamA,
          players: [{ id: "custom-id-999", name: "Player 1", skillValue: 50, skillAdjustment: "+0" }]
        }
      };
      const res = await request(app).post('/api/matches').send(payloadWithId);
      expect(res.statusCode).toEqual(201);
      expect(res.body.teamA.players[0].id).toBe("custom-id-999");
    });

    // Covers match.controller.ts Line 53 (createMatch catch block)
    it('should return 400 when createMatch payload completely breaks root schema', async () => {
      // Sending an array instead of an object breaks z.object() fundamentally
      const res = await request(app).post('/api/matches').send([]);
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe("Validation failed");
    });

    // Covers match.controller.ts Line 68 (updateMatch catch block)
    it('should return 400 when updateMatch payload completely breaks root schema', async () => {
      const created = await request(app).post('/api/matches').send(validMatchPayload);
      
      const res = await request(app).patch(`/api/matches/${created.body.id}`).send([]);
      expect(res.statusCode).toEqual(400);
    });

    // Covers match.controller.ts Line 28 (getMatches catch block)
    it('should return 400 if pagination schema parsing fails systemically', async () => {
      // Since req.query is always an object, we must mock the schema throwing an error
      const { matchQuerySchema } = require('../validators/match.schema');
      jest.spyOn(matchQuerySchema, 'parse').mockImplementationOnce(() => {
        throw new Error("Simulated core failure");
      });

      const res = await request(app).get('/api/matches');
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toBe("Invalid pagination parameters");
    });
  });
});
