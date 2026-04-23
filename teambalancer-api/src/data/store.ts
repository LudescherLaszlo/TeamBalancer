export interface Player {
  id: string;
  name: string;
  skillValue: number;
  skillAdjustment: string;
}

export interface Team {
  name: string;
  players: Player[];
  totalSkill: number;
}

export interface Match {
  id: string;
  tournamentId: string;
  date: string;
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  winner: "Team A" | "Team B" | string;
}

export interface Tournament {
  id: string;
  name: string;
  status: "Active" | "Completed";
}

// Helper function to calculate total skill
const calculateTotalSkill = (players: Player[]): number => {
  return players.reduce((sum, player) => sum + player.skillValue, 0);
};

// Helper function to create matches with tournamentId
const createMatch = (
  id: string,
  tournamentId: string,
  date: string,
  teamAPlayers: Player[],
  teamBPlayers: Player[],
  scoreA: number,
  scoreB: number,
  winner: "Team A" | "Team B"
): Match => {
  return {
    id,
    tournamentId,
    date,
    teamA: {
      name: "Team A",
      players: teamAPlayers,
      totalSkill: calculateTotalSkill(teamAPlayers),
    },
    teamB: {
      name: "Team B",
      players: teamBPlayers,
      totalSkill: calculateTotalSkill(teamBPlayers),
    },
    scoreA,
    scoreB,
    winner,
  };
};

// Player definitions (reusable)
const players = {
  p1: { id: "p1", name: "Alex Johnson", skillValue: 85, skillAdjustment: "+2" },
  p2: { id: "p2", name: "Sarah Miller", skillValue: 78, skillAdjustment: "+1" },
  p3: { id: "p3", name: "Mike Davis", skillValue: 82, skillAdjustment: "+3" },
  p4: { id: "p4", name: "Emma Wilson", skillValue: 76, skillAdjustment: "+1" },
  p5: { id: "p5", name: "Chris Brown", skillValue: 80, skillAdjustment: "+2" },
  p6: { id: "p6", name: "Jessica Lee", skillValue: 79, skillAdjustment: "+2" },
  p7: { id: "p7", name: "David Martinez", skillValue: 83, skillAdjustment: "+1" },
  p8: { id: "p8", name: "Lisa Anderson", skillValue: 77, skillAdjustment: "+2" },
  p9: { id: "p9", name: "Ryan Taylor", skillValue: 88, skillAdjustment: "+1" },
  p10: { id: "p10", name: "Nicole White", skillValue: 81, skillAdjustment: "+2" },
  p11: { id: "p11", name: "Kevin Garcia", skillValue: 79, skillAdjustment: "+1" },
  p12: { id: "p12", name: "Amanda Clark", skillValue: 75, skillAdjustment: "+3" },
};

// Tournament store
export let tournamentsStore: Tournament[] = [
  { id: "t_1", name: "Summer Beach Volley 2026", status: "Completed" },
  { id: "t_2", name: "Winter Indoor Tournament 2026", status: "Active" }
];

// Matches store with matches distributed across two tournaments
export let matchesStore: Match[] = [
  // Tournament 1 matches (First 8 matches)
  createMatch("1", "t_1", "2026-03-10", 
    [players.p1, players.p2, players.p3, players.p4],
    [players.p5, players.p6, players.p7, players.p8],
    21, 19, "Team A"),
  
  createMatch("2", "t_1", "2026-03-08",
    [players.p1, players.p4, players.p5, players.p8],
    [players.p2, players.p3, players.p6, players.p7],
    18, 21, "Team B"),
  
  createMatch("3", "t_1", "2026-03-05",
    [players.p1, players.p4, players.p9, players.p12],
    [players.p2, players.p3, players.p10, players.p11],
    21, 17, "Team A"),
  
  createMatch("4", "t_1", "2026-03-03",
    [players.p5, players.p6, players.p9, players.p11],
    [players.p7, players.p8, players.p10, players.p12],
    21, 19, "Team A"),
  
  createMatch("5", "t_1", "2026-03-01",
    [players.p1, players.p6, players.p7, players.p12],
    [players.p2, players.p5, players.p8, players.p9],
    19, 21, "Team B"),
  
  createMatch("6", "t_1", "2026-02-28",
    [players.p3, players.p4, players.p5, players.p10],
    [players.p1, players.p8, players.p11, players.p12],
    21, 18, "Team A"),
  
  createMatch("7", "t_1", "2026-02-26",
    [players.p2, players.p7, players.p9, players.p10],
    [players.p1, players.p3, players.p6, players.p11],
    21, 20, "Team A"),
  
  createMatch("8", "t_1", "2026-02-24",
    [players.p4, players.p5, players.p8, players.p9],
    [players.p2, players.p6, players.p7, players.p12],
    21, 16, "Team A"),
    createMatch("21", "t_1", "2026-02-20",
  [players.p2, players.p7, players.p9, players.p11],
  [players.p1, players.p4, players.p6, players.p10],
  21, 17, "Team A"),

createMatch("22", "t_1", "2026-02-17",
  [players.p3, players.p5, players.p8, players.p12],
  [players.p2, players.p7, players.p9, players.p11],
  19, 21, "Team B"),

createMatch("23", "t_1", "2026-02-14",
  [players.p1, players.p6, players.p10, players.p12],
  [players.p3, players.p5, players.p8, players.p11],
  21, 16, "Team A"),

createMatch("24", "t_1", "2026-02-11",
  [players.p4, players.p7, players.p9, players.p10],
  [players.p1, players.p2, players.p6, players.p12],
  18, 21, "Team B"),

createMatch("25", "t_1", "2026-02-08",
  [players.p2, players.p5, players.p8, players.p11],
  [players.p3, players.p4, players.p7, players.p9],
  21, 19, "Team A"),

createMatch("26", "t_1", "2026-02-05",
  [players.p1, players.p3, players.p6, players.p10],
  [players.p2, players.p5, players.p8, players.p12],
  21, 14, "Team A"),

createMatch("27", "t_1", "2026-02-02",
  [players.p4, players.p7, players.p9, players.p11],
  [players.p1, players.p6, players.p10, players.p12],
  15, 21, "Team B"),

createMatch("28", "t_1", "2026-01-30",
  [players.p2, players.p3, players.p5, players.p8],
  [players.p4, players.p7, players.p9, players.p11],
  21, 20, "Team A"),

createMatch("29", "t_1", "2026-01-27",
  [players.p1, players.p8, players.p10, players.p12],
  [players.p2, players.p4, players.p6, players.p9],
  21, 18, "Team A"),

createMatch("30", "t_1", "2026-01-24",
  [players.p3, players.p5, players.p7, players.p11],
  [players.p1, players.p8, players.p10, players.p12],
  17, 21, "Team B"),

  // Tournament 2 matches (Remaining 7 matches + new data)
  createMatch("9", "t_2", "2026-03-20",
    [players.p1, players.p3, players.p8, players.p10],
    [players.p5, players.p7, players.p11, players.p12],
    21, 19, "Team A"),
  
  createMatch("10", "t_2", "2026-03-18",
    [players.p1, players.p2, players.p5, players.p6],
    [players.p3, players.p4, players.p7, players.p8],
    19, 21, "Team B"),
  
  createMatch("11", "t_2", "2026-03-15",
    [players.p1, players.p2, players.p5, players.p6],
    [players.p3, players.p7, players.p9, players.p12],
    15, 21, "Team B"),
  
  createMatch("12", "t_2", "2026-03-12",
    [players.p1, players.p4, players.p5, players.p8],
    [players.p7, players.p10, players.p11, players.p12],
    21, 19, "Team A"),
  
  createMatch("13", "t_2", "2026-03-10",
    [players.p3, players.p7, players.p9, players.p11],
    [players.p1, players.p4, players.p5, players.p12],
    21, 14, "Team A"),
  
  createMatch("14", "t_2", "2026-03-08",
    [players.p2, players.p6, players.p8, players.p12],
    [players.p3, players.p7, players.p9, players.p10],
    12, 21, "Team B"),
  
  createMatch("15", "t_2", "2026-03-05",
    [players.p1, players.p3, players.p9, players.p11],
    [players.p2, players.p4, players.p6, players.p10],
    21, 16, "Team A"),

  // New additional matches for tournament 2
  createMatch("16", "t_2", "2026-03-25",
    [players.p2, players.p5, players.p9, players.p10],
    [players.p1, players.p4, players.p7, players.p11],
    21, 18, "Team A"),
  
  createMatch("17", "t_2", "2026-03-22",
    [players.p3, players.p6, players.p8, players.p12],
    [players.p1, players.p2, players.p9, players.p10],
    19, 21, "Team B"),
  
  createMatch("18", "t_2", "2026-03-19",
    [players.p4, players.p7, players.p11, players.p12],
    [players.p3, players.p5, players.p6, players.p8],
    21, 15, "Team A"),
  
  createMatch("19", "t_2", "2026-03-16",
    [players.p1, players.p8, players.p9, players.p10],
    [players.p2, players.p4, players.p6, players.p11],
    21, 20, "Team A"),
  
  createMatch("20", "t_2", "2026-03-14",
    [players.p3, players.p5, players.p7, players.p12],
    [players.p1, players.p8, players.p9, players.p10],
    18, 21, "Team B"),
];