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
  date: string;
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  winner: "Team A" | "Team B";
}

export const mockMatches: Match[] = [
  {
    id: "1",
    date: "2026-03-10",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 321,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 319,
    },
    scoreA: 21,
    scoreB: 19,
    winner: "Team A",
  },
  {
    id: "2",
    date: "2026-03-08",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 318,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 322,
    },
    scoreA: 18,
    scoreB: 21,
    winner: "Team B",
  },
  {
    id: "3",
    date: "2026-03-05",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 324,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p10",
          name: "Nicole White",
          skillValue: 81,
          skillAdjustment: "+2",
        },
        {
          id: "p11",
          name: "Kevin Garcia",
          skillValue: 79,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 320,
    },
    scoreA: 21,
    scoreB: 17,
    winner: "Team A",
  },
  {
    id: "4",
    date: "2026-03-03",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
        {
          id: "p11",
          name: "Kevin Garcia",
          skillValue: 79,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 326,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
        {
          id: "p10",
          name: "Nicole White",
          skillValue: 81,
          skillAdjustment: "+2",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 316,
    },
    scoreA: 21,
    scoreB: 19,
    winner: "Team A",
  },
  {
    id: "5",
    date: "2026-03-01",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 322,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 323,
    },
    scoreA: 19,
    scoreB: 21,
    winner: "Team B",
  },
  {
    id: "6",
    date: "2026-02-28",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p10",
          name: "Nicole White",
          skillValue: 81,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 319,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
        {
          id: "p11",
          name: "Kevin Garcia",
          skillValue: 79,
          skillAdjustment: "+1",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 316,
    },
    scoreA: 21,
    scoreB: 18,
    winner: "Team A",
  },
  {
    id: "7",
    date: "2026-02-26",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
        {
          id: "p10",
          name: "Nicole White",
          skillValue: 81,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 330,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
        {
          id: "p11",
          name: "Kevin Garcia",
          skillValue: 79,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 325,
    },
    scoreA: 21,
    scoreB: 20,
    winner: "Team A",
  },
  {
    id: "8",
    date: "2026-02-24",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 321,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 315,
    },
    scoreA: 21,
    scoreB: 16,
    winner: "Team A",
  },
  {
    id: "9",
    date: "2026-02-21",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
        {
          id: "p10",
          name: "Nicole White",
          skillValue: 81,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 325,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p11",
          name: "Kevin Garcia",
          skillValue: 79,
          skillAdjustment: "+1",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 317,
    },
    scoreA: 21,
    scoreB: 19,
    winner: "Team A",
  },
  {
    id: "10",
    date: "2026-02-18",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 322,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 318,
    },
    scoreA: 19,
    scoreB: 21,
    winner: "Team B",
  },
  {
    id: "11",
    date: "2026-02-15",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 322,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 328,
    },
    scoreA: 15,
    scoreB: 21,
    winner: "Team B",
  },
  {
    id: "12",
    date: "2026-02-12",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 318,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p10",
          name: "Nicole White",
          skillValue: 81,
          skillAdjustment: "+2",
        },
        {
          id: "p11",
          name: "Kevin Garcia",
          skillValue: 79,
          skillAdjustment: "+1",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 318,
    },
    scoreA: 21,
    scoreB: 19,
    winner: "Team A",
  },
  {
    id: "13",
    date: "2026-02-10",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
        {
          id: "p11",
          name: "Kevin Garcia",
          skillValue: 79,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 332,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
        {
          id: "p5",
          name: "Chris Brown",
          skillValue: 80,
          skillAdjustment: "+2",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 316,
    },
    scoreA: 21,
    scoreB: 14,
    winner: "Team A",
  },
  {
    id: "14",
    date: "2026-02-08",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
        {
          id: "p8",
          name: "Lisa Anderson",
          skillValue: 77,
          skillAdjustment: "+2",
        },
        {
          id: "p12",
          name: "Amanda Clark",
          skillValue: 75,
          skillAdjustment: "+3",
        },
      ],
      totalSkill: 309,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p7",
          name: "David Martinez",
          skillValue: 83,
          skillAdjustment: "+1",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
        {
          id: "p10",
          name: "Nicole White",
          skillValue: 81,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 334,
    },
    scoreA: 12,
    scoreB: 21,
    winner: "Team B",
  },
  {
    id: "15",
    date: "2026-02-05",
    teamA: {
      name: "Team A",
      players: [
        {
          id: "p1",
          name: "Alex Johnson",
          skillValue: 85,
          skillAdjustment: "+2",
        },
        {
          id: "p3",
          name: "Mike Davis",
          skillValue: 82,
          skillAdjustment: "+3",
        },
        {
          id: "p9",
          name: "Ryan Taylor",
          skillValue: 88,
          skillAdjustment: "+1",
        },
        {
          id: "p11",
          name: "Kevin Garcia",
          skillValue: 79,
          skillAdjustment: "+1",
        },
      ],
      totalSkill: 334,
    },
    teamB: {
      name: "Team B",
      players: [
        {
          id: "p2",
          name: "Sarah Miller",
          skillValue: 78,
          skillAdjustment: "+1",
        },
        {
          id: "p4",
          name: "Emma Wilson",
          skillValue: 76,
          skillAdjustment: "+1",
        },
        {
          id: "p6",
          name: "Jessica Lee",
          skillValue: 79,
          skillAdjustment: "+2",
        },
        {
          id: "p10",
          name: "Nicole White",
          skillValue: 81,
          skillAdjustment: "+2",
        },
      ],
      totalSkill: 314,
    },
    scoreA: 21,
    scoreB: 16,
    winner: "Team A",
  },
];