import { z } from 'zod';

const playerSchema = z.object({
  id: z.string().nullish().transform(val => val || `p_${Math.random().toString(36).substring(2, 9)}`),
  name: z.string().nullish().transform(val => val || "Unknown Player"),
  skillValue: z.coerce.number().catch(0),
  skillAdjustment: z.coerce.string().catch("+0"),
});

const teamSchema = z.object({
  name: z.string().nullish().transform(val => val || "Team"),
  players: z.array(playerSchema).catch([]),
  totalSkill: z.coerce.number().catch(0),
});

export const matchSchema = z.object({
  tournamentId: z.string().catch("t_1"), // <-- Added tournament validation
  date: z.string().nullish().transform(val => val || new Date().toISOString()),
  teamA: teamSchema,
  teamB: teamSchema,
  scoreA: z.coerce.number().catch(0),
  scoreB: z.coerce.number().catch(0),
  winner: z.string().nullish().transform(val => val || "Team A"),
});

export const matchQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).catch("1"),
  limit: z.string().regex(/^\d+$/).catch("1000"),
});