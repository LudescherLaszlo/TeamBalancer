import { Request, Response } from 'express';
import { matchesStore, Match } from '../data/store';
import { matchSchema, matchQuerySchema } from '../validators/match.schema';
import { faker } from '@faker-js/faker';
import { WebSocketServer, WebSocket } from 'ws';

let simulationInterval: NodeJS.Timeout | null = null;

export const matchController = {
  // Get all with server-side pagination
  getMatches: (req: Request, res: Response) => {
    try {
      const query = matchQuerySchema.parse(req.query);
      const page = parseInt(query.page, 10);
      const limit = parseInt(query.limit, 10);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const paginatedMatches = matchesStore.slice(startIndex, endIndex);

      res.status(200).json({
        data: paginatedMatches,
        meta: {
          total: matchesStore.length,
          page,
          limit,
          totalPages: Math.ceil(matchesStore.length / limit)
        }
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid pagination parameters" });
    }
  },

  // Get by ID
  getMatchById: (req: Request, res: Response) => {
    const match = matchesStore.find(m => m.id === req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.status(200).json(match);
  },

  // Create
createMatch: (req: Request, res: Response) => {
    try {
      const validatedData = matchSchema.parse(req.body);
      
      const newId = matchesStore.length > 0 
        ? String(Math.max(...matchesStore.map(m => parseInt(m.id))) + 1) 
        : "1";

      const newMatch: Match = { id: newId, ...validatedData } as Match;
      matchesStore.unshift(newMatch); 
      
      res.status(201).json(newMatch);
    } catch (error: any) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    }
  },

  // Update
  updateMatch: (req: Request, res: Response) => {
    try {
      const validatedData = matchSchema.partial().parse(req.body);
      const index = matchesStore.findIndex(m => m.id === req.params.id);
      
      if (index === -1) return res.status(404).json({ error: "Match not found" });

      matchesStore[index] = { ...matchesStore[index], ...validatedData } as Match;
      res.status(200).json(matchesStore[index]);
    } catch (error: any) {
      res.status(400).json({ error: "Validation failed", details: error.errors });
    }
  },

  // Delete
  deleteMatch: (req: Request, res: Response) => {
    const index = matchesStore.findIndex(m => m.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Match not found" });

    matchesStore.splice(index, 1);
    res.status(204).send();
  },

  // Statistics
  getStatistics: (req: Request, res: Response) => {
    const totalMatches = matchesStore.length;
    if (totalMatches === 0) {
      return res.status(200).json({ totalMatches: 0, teamAWins: 0, teamBWins: 0, avgSkillDiff: 0 });
    }

    const teamAWins = matchesStore.filter(m => m.winner === "Team A").length;
    const teamBWins = matchesStore.filter(m => m.winner === "Team B").length;
    const avgSkillDiff = matchesStore.reduce((sum, m) => sum + Math.abs(m.teamA.totalSkill - m.teamB.totalSkill), 0) / totalMatches;

    res.status(200).json({
      totalMatches,
      teamAWins,
      winRateA: (teamAWins / totalMatches) * 100,
      teamBWins,
      winRateB: (teamBWins / totalMatches) * 100,
      avgSkillDiff: Math.round(avgSkillDiff)
    });
  },
  startSimulation: (req: Request, res: Response) => {
    if (simulationInterval) {
      return res.status(400).json({ message: "Simulation is already running" });
    }

    const wss = req.app.get('wss') as WebSocketServer;

    simulationInterval = setInterval(() => {
      const baseSkill = faker.number.int({ min: 60, max: 100 });
      const diff = faker.number.int({ min: 0, max: 15 });
      const scoreA = faker.number.int({ min: 15, max: 25 });
      const scoreB = faker.number.int({ min: 15, max: 25 });
      
      const newId = matchesStore.length > 0 ? String(Math.max(...matchesStore.map(m => parseInt(m.id))) + 1) : "1";

      const fakeMatch: Match = {
        id: newId,
        date: new Date().toISOString(),
        scoreA,
        scoreB,
        winner: scoreA > scoreB ? "Team A" : "Team B",
        teamA: {
          name: "Team A",
          totalSkill: baseSkill,
          players: Array.from({ length: 4 }).map(() => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            skillValue: Math.floor(baseSkill / 4),
            skillAdjustment: faker.helpers.arrayElement(["+1", "+2", "+0", "-1"])
          }))
        },
        teamB: {
          name: "Team B",
          totalSkill: baseSkill - diff + faker.number.int({ min: 0, max: diff * 2 }),
          players: Array.from({ length: 4 }).map(() => ({
            id: faker.string.uuid(),
            name: faker.person.fullName(),
            skillValue: Math.floor(baseSkill / 4),
            skillAdjustment: faker.helpers.arrayElement(["+1", "+2", "+0", "-1"])
          }))
        }
      };

      // Save to server RAM
      matchesStore.unshift(fakeMatch);

      // Broadcast to all connected WebSockets
      if (wss) {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'NEW_MATCH', payload: fakeMatch }));
          }
        });
      }
    }, 2500); // Generates a match every 2.5 seconds

    res.status(200).json({ message: "Asynchronous simulation started" });
  },

  // 2. Stop Server-Side Simulation
  stopSimulation: (req: Request, res: Response) => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
      res.status(200).json({ message: "Simulation stopped" });
    } else {
      res.status(400).json({ message: "No simulation is currently running" });
    }
  }
};