import { useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useMatches } from "../contexts/match-context";
import { ArrowLeft, Trophy, Users, TrendingUp, Target, Calendar, Play, Square, Zap, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Helper functions
const getPlayerTier = (gamesPlayed: number) => {
  if (gamesPlayed >= 8) return { tier: "Elite", color: "#006895" };
  if (gamesPlayed >= 6) return { tier: "Veteran", color: "#0799ba" };
  if (gamesPlayed >= 4) return { tier: "Regular", color: "#1fa5b0" };
  if (gamesPlayed >= 2) return { tier: "Active", color: "#8ec1b8" };
  return { tier: "Rookie", color: "#dfdcd3" };
};

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { matches, createMatch, deleteMatch } = useMatches(); 
  
  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  // async data simulation effect
  useEffect(() => {
    if (isSimulating) {
      simulationInterval.current = setInterval(() => {
        const action = Math.random();
        
        if (action < 0.4 && matches.length > 3) {
          const randomMatch = matches[Math.floor(Math.random() * matches.length)];
          if (randomMatch) deleteMatch(randomMatch.id);
        } else {
          const baseSkill = Math.floor(Math.random() * 40) + 60;
          const diff = Math.floor(Math.random() * 15);
          const scoreA = Math.floor(Math.random() * 10) + 15;
          const scoreB = Math.floor(Math.random() * 10) + 15;
          
          createMatch({
            date: new Date().toISOString(),
            scoreA,
            scoreB,
            winner: scoreA > scoreB ? "Team A" : "Team B",
            teamA: {
              name: "Team A",
              totalSkill: baseSkill,
              players: [{ id: `p${Date.now()}`, name: "Sim Player A", skillValue: baseSkill / 2, skillAdjustment: "0" }]
            },
            teamB: {
              name: "Team B",
              totalSkill: baseSkill - diff + Math.floor(Math.random() * (diff * 2)),
              players: [{ id: `p${Date.now()+1}`, name: "Sim Player B", skillValue: baseSkill / 2, skillAdjustment: "0" }]
            }
          });
        }
      }, 1500);
    } else {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    }

    return () => {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, [isSimulating, matches, createMatch, deleteMatch]);

  // Calculations
  const totalMatches = matches.length;
  const teamAWins = matches.filter(m => m.winner === "Team A").length;
  const teamBWins = matches.filter(m => m.winner === "Team B").length;
  
  const avgScoreA = totalMatches ? Math.round(matches.reduce((sum, m) => sum + m.scoreA, 0) / totalMatches) : 0;
  const avgScoreB = totalMatches ? Math.round(matches.reduce((sum, m) => sum + m.scoreB, 0) / totalMatches) : 0;
  const avgSkillDiff = totalMatches ? Math.round(matches.reduce((sum, m) => sum + Math.abs(m.teamA.totalSkill - m.teamB.totalSkill), 0) / totalMatches) : 0;

  // Chart Data Preparation
  const recentMatches = matches.slice(-20);

  const winRateData = [
    { name: "Team A Wins", value: teamAWins, color: "#006895" },
    { name: "Team B Wins", value: teamBWins, color: "#0799ba" },
  ];

  const scoreDistribution = recentMatches.map((match, index) => ({
    name: `M${index + 1}`,
    "Team A": match.scoreA,
    "Team B": match.scoreB,
  }));

  const skillBalanceData = recentMatches.map((match, index) => ({
    name: `M${index + 1}`,
    differential: Math.abs(match.teamA.totalSkill - match.teamB.totalSkill),
  }));

  const playerParticipation = new Map<string, { games: number; wins: number; totalScore: number }>();
  matches.forEach(match => {
    match.teamA.players.forEach(player => {
      const current = playerParticipation.get(player.name) || { games: 0, wins: 0, totalScore: 0 };
      current.games++;
      if (match.winner === "Team A") current.wins++;
      current.totalScore += match.scoreA;
      playerParticipation.set(player.name, current);
    });
    match.teamB.players.forEach(player => {
      const current = playerParticipation.get(player.name) || { games: 0, wins: 0, totalScore: 0 };
      current.games++;
      if (match.winner === "Team B") current.wins++;
      current.totalScore += match.scoreB;
      playerParticipation.set(player.name, current);
    });
  });

  const allPlayers = Array.from(playerParticipation.entries())
    .map(([name, stats]) => ({
      name,
      games: stats.games,
      wins: stats.wins,
      winRate: ((stats.wins / stats.games) * 100).toFixed(0),
      avgScore: Math.round(stats.totalScore / stats.games),
      tier: getPlayerTier(stats.games)
    }))
    .sort((a, b) => b.games - a.games);
  const toggleSimulation = async () => {
      try {
        if (isSimulating) {
          await fetch('http://localhost:3000/api/matches/simulate/stop', { method: 'POST' });
          setIsSimulating(false);
        } else {
          await fetch('http://localhost:3000/api/matches/simulate/start', { method: 'POST' });
          setIsSimulating(true);
        }
      } catch (error) {
        console.error("Failed to toggle simulation:", error);
      }
    };
  const topPlayers = allPlayers.slice(0, 8).map(p => ({ name: p.name, games: p.games }));

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="scale-75 sm:scale-100 origin-left">
            <TeamBalancerLogo iconSize={60} showTagline={false} layout="horizontal" />
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button
              className={`w-full sm:w-auto ${isSimulating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'} text-white shadow-lg transition-colors`}
              onClick={toggleSimulation}
            >
              {isSimulating ? <Square className="mr-2 size-4 fill-current" /> : <Play className="mr-2 size-4 fill-current" />}
              {isSimulating ? "Stop Server Sim" : "Start Server Sim"}
            </Button>
            <Button
              className="flex-1 sm:flex-none bg-gradient-to-r from-[#006895] to-[#0799ba] hover:from-[#005177] hover:to-[#06859f] text-white shadow-lg"
              onClick={() => navigate("/synergy")}
            >
              <Zap className="mr-2 size-4" />
              Synergy Engine
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none border-[#0799ba] text-[#0799ba]" onClick={() => navigate("/matches")}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl text-[#006895] font-bold mb-2">Live Match Statistics</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Parallel view of charts and tabular data updating in real-time.</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-t-4 border-t-[#006895]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2"><Calendar className="size-4" /> Total Matches</CardDescription>
            </CardHeader>
            <CardContent><p className="text-3xl sm:text-4xl text-[#006895] font-bold">{totalMatches}</p></CardContent>
          </Card>
          <Card className="shadow-lg border-t-4 border-t-[#0799ba]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2"><Trophy className="size-4" /> Team A Win Rate</CardDescription>
            </CardHeader>
            <CardContent><p className="text-3xl sm:text-4xl text-[#0799ba] font-bold">{totalMatches ? ((teamAWins / totalMatches) * 100).toFixed(0) : 0}%</p></CardContent>
          </Card>
          <Card className="shadow-lg border-t-4 border-t-[#1fa5b0]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2"><Target className="size-4" /> Avg Score Diff</CardDescription>
            </CardHeader>
            <CardContent><p className="text-3xl sm:text-4xl text-[#1fa5b0] font-bold">{totalMatches ? Math.round(matches.reduce((sum, m) => sum + Math.abs(m.scoreA - m.scoreB), 0) / totalMatches) : 0}</p></CardContent>
          </Card>
          <Card className="shadow-lg border-t-4 border-t-[#8ec1b8]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2"><TrendingUp className="size-4" /> Avg Skill Balance</CardDescription>
            </CardHeader>
            <CardContent><p className="text-3xl sm:text-4xl text-[#8ec1b8] font-bold">{avgSkillDiff} pts</p></CardContent>
          </Card>
        </div>

        {/* --- TRUE SIDE-BY-SIDE LAYOUT --- */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT COLUMN: All 4 Visual Charts (Nested 2x2 Grid) */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Win Distribution */}
            <Card className="shadow-lg overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl text-[#006895] flex items-center gap-2">
                  <PieChartIcon className="size-5" />
                  Win Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full h-[260px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie data={winRateData} cx="50%" cy="50%" labelLine={false} outerRadius={90} dataKey="value">
                        {winRateData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Score Distribution */}
            <Card className="shadow-lg overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl text-[#006895] flex items-center gap-2">
                  <BarChart3 className="size-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dfdcd3" />
                      <XAxis dataKey="name" stroke="#006895" tick={{fontSize: 12}} />
                      <YAxis stroke="#006895" tick={{fontSize: 12}} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} verticalAlign="bottom" height={36} iconType="circle" />
                      <Bar dataKey="Team A" fill="#006895" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Team B" fill="#0799ba" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 3: Skill Balance Trend */}
            <Card className="shadow-lg overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl text-[#006895] flex items-center gap-2">
                  <TrendingUp className="size-5" />
                  Skill Balance Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={skillBalanceData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dfdcd3" />
                      <XAxis dataKey="name" stroke="#006895" tick={{fontSize: 12}} />
                      <YAxis stroke="#006895" tick={{fontSize: 12}} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} verticalAlign="bottom" height={36} iconType="circle" />
                      <Line type="monotone" dataKey="differential" stroke="#1fa5b0" strokeWidth={3} name="Skill Differential" dot={{ fill: '#1fa5b0', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 4: Top Player Participation */}
            <Card className="shadow-lg overflow-hidden h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl text-[#006895] flex items-center gap-2">
                  <Users className="size-5" />
                  Top Player Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topPlayers} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dfdcd3" />
                      <XAxis type="number" stroke="#006895" tick={{fontSize: 12}} />
                      <YAxis dataKey="name" type="category" stroke="#006895" width={75} tick={{fontSize: 12}} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: '12px' }} verticalAlign="bottom" height={36} iconType="circle" />
                      <Bar dataKey="games" fill="#0799ba" radius={[0, 4, 4, 0]} name="Matches Played" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN: Tabular View (Sticky) */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-8">
            <Card className="shadow-lg flex flex-col h-full lg:max-h-[calc(100vh-8rem)]">
              <CardHeader className="bg-white z-10 rounded-t-lg border-b border-border pb-4">
                <CardTitle className="text-lg sm:text-xl text-[#006895]">Player Rankings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Live updating tabular data tied to chart metrics.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                <div className="overflow-x-auto w-full">
                  <Table className="min-w-full">
                    <TableHeader className="bg-muted/30 sticky top-0 z-20">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">Tier</TableHead>
                        <TableHead className="text-right">Win %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allPlayers.slice(0, 15).map((player, index) => (
                        <TableRow key={player.name} className="transition-all duration-300 hover:bg-muted/50">
                          <TableCell className="font-semibold text-center text-muted-foreground">{index + 1}</TableCell>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell className="text-center">
                            <span className="px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold text-white whitespace-nowrap" style={{ backgroundColor: player.tier.color }}>
                              {player.tier.tier}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-[#006895]">{player.winRate}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}