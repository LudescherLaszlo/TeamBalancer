import { z } from 'zod';

const playerSchema = z.object({
  // If id is missing, null, or empty string, generate a random one safely
  id: z.string().nullish().transform(val => val || `p_${Math.random().toString(36).substring(2, 9)}`),
  // If name is missing, default to "Unknown Player"
  name: z.string().nullish().transform(val => val || "Unknown Player"),
  // If skillValue is weird, default to 0 instead of crashing
  skillValue: z.coerce.number().catch(0),
  skillAdjustment: z.coerce.string().catch("+0"),
});

const teamSchema = z.object({
  name: z.string().nullish().transform(val => val || "Team"),
  players: z.array(playerSchema).catch([]),
  totalSkill: z.coerce.number().catch(0),
});

export const matchSchema = z.object({
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