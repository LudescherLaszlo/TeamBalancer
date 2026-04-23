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
  tournamentId: string; // <-- ADDED for 1-to-Many
  date: string;
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  winner: "Team A" | "Team B" | string;
}

// <-- ADDED TOURNAMENT ENTITY -->
export interface Tournament {
  id: string;
  name: string;
  status: "Active" | "Completed";
}

// <-- ADDED TOURNAMENT STORE -->
export let tournamentsStore: Tournament[] = [
  { id: "t_1", name: "Summer Beach Volley 2026", status: "Active" }
];

export let matchesStore: Match[] = [
  {
    id: "1", tournamentId: "t_1", date: "2026-03-10", winner: "Team A", scoreA: 21, scoreB: 19,
    teamA: { name: "Team A", totalSkill: 321, players: [{ id: "p1", name: "Alex Johnson", skillValue: 85, skillAdjustment: "+2" }, { id: "p2", name: "Sarah Miller", skillValue: 78, skillAdjustment: "+1" }, { id: "p3", name: "Mike Davis", skillValue: 82, skillAdjustment: "+3" }, { id: "p4", name: "Emma Wilson", skillValue: 76, skillAdjustment: "+1" }] },
    teamB: { name: "Team B", totalSkill: 319, players: [{ id: "p5", name: "Chris Brown", skillValue: 80, skillAdjustment: "+2" }, { id: "p6", name: "Jessica Lee", skillValue: 79, skillAdjustment: "+2" }, { id: "p7", name: "David Martinez", skillValue: 83, skillAdjustment: "+1" }, { id: "p8", name: "Lisa Anderson", skillValue: 77, skillAdjustment: "+2" }] }
  },
  {
    id: "2", tournamentId: "t_1", date: "2026-03-08", winner: "Team B", scoreA: 18, scoreB: 21,
    teamA: { name: "Team A", totalSkill: 318, players: [{ id: "p1", name: "Alex Johnson", skillValue: 85, skillAdjustment: "+2" }, { id: "p4", name: "Emma Wilson", skillValue: 76, skillAdjustment: "+1" }, { id: "p5", name: "Chris Brown", skillValue: 80, skillAdjustment: "+2" }, { id: "p8", name: "Lisa Anderson", skillValue: 77, skillAdjustment: "+2" }] },
    teamB: { name: "Team B", totalSkill: 322, players: [{ id: "p2", name: "Sarah Miller", skillValue: 78, skillAdjustment: "+1" }, { id: "p3", name: "Mike Davis", skillValue: 82, skillAdjustment: "+3" }, { id: "p6", name: "Jessica Lee", skillValue: 79, skillAdjustment: "+2" }, { id: "p7", name: "David Martinez", skillValue: 83, skillAdjustment: "+1" }] }
  },
  {
    id: "3", tournamentId: "t_1", date: "2026-03-05", winner: "Team A", scoreA: 21, scoreB: 17,
    teamA: { name: "Team A", totalSkill: 324, players: [{ id: "p1", name: "Alex Johnson", skillValue: 85, skillAdjustment: "+2" }, { id: "p4", name: "Emma Wilson", skillValue: 76, skillAdjustment: "+1" }, { id: "p9", name: "Ryan Taylor", skillValue: 88, skillAdjustment: "+1" }, { id: "p12", name: "Amanda Clark", skillValue: 75, skillAdjustment: "+3" }] },
    teamB: { name: "Team B", totalSkill: 320, players: [{ id: "p2", name: "Sarah Miller", skillValue: 78, skillAdjustment: "+1" }, { id: "p3", name: "Mike Davis", skillValue: 82, skillAdjustment: "+3" }, { id: "p10", name: "Nicole White", skillValue: 81, skillAdjustment: "+2" }, { id: "p11", name: "Kevin Garcia", skillValue: 79, skillAdjustment: "+1" }] }
  }
];