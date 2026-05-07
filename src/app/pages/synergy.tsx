import { useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { ArrowLeft, TrendingUp, TrendingDown, Users, AlertCircle, Loader2 } from "lucide-react";

interface PlayerNode {
  id: string;
  name: string;
  x: number;
  y: number;
  angle: number;
  gamesPlayed: number;
}

interface SynergyEdge {
  from: string;
  to: string;
  strength: number; 
  wins: number;
  losses: number;
}

export default function SynergyPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<SynergyEdge | null>(null);
  
  // New state to hold matches from ALL tournaments
  const [globalMatches, setGlobalMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all matches across the entire database when the page loads
  useEffect(() => {
    const fetchAllMatches = async () => {
      try {
        const res = await fetch("http://localhost:3000/graphql", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                matches(limit: 5000) {
                  edges {
                    winner
                    teamA { players { name } }
                    teamB { players { name } }
                  }
                }
              }
            `
          })
        });
        const json = await res.json();
        if (json.data?.matches?.edges) {
          setGlobalMatches(json.data.matches.edges);
        }
      } catch (err) {
        console.error("Failed to fetch all tournaments data", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllMatches();
  }, []);

  const calculateSynergies = () => {
    const playerStats = new Map<string, { games: number; partners: Map<string, { wins: number; losses: number }> }>();
    
    // Now iterating over ALL matches, ignoring tournament boundaries
    globalMatches.forEach(match => {
      const processTeam = (players: any[] | undefined, won: boolean) => {
        if (!Array.isArray(players)) return; 

        players.forEach((p1, i) => {
          if (!playerStats.has(p1.name)) {
            playerStats.set(p1.name, { games: 0, partners: new Map() });
          }
          const stats = playerStats.get(p1.name)!;
          stats.games++;

          players.forEach((p2, j) => {
            if (i !== j) {
              if (!stats.partners.has(p2.name)) {
                stats.partners.set(p2.name, { wins: 0, losses: 0 });
              }
              const partnerStats = stats.partners.get(p2.name)!;
              if (won) {
                partnerStats.wins++;
              } else {
                partnerStats.losses++;
              }
            }
          });
        });
      };

      processTeam(match.teamA?.players, match.winner === "Team A");
      processTeam(match.teamB?.players, match.winner === "Team B");
    });

    return playerStats;
  };

  const synergyData = calculateSynergies();
  
  const playerNames = Array.from(synergyData.entries())
    .filter(([name, stats]) => stats.partners.size > 0 && !name.includes("Sim Player"))
    .sort((a, b) => b[1].games - a[1].games)
    .map(entry => entry[0])
    .slice(0, 12);

  const createNodes = (): PlayerNode[] => {
    const centerX = 500;
    const centerY = 400;
    const radius = 280;

    return playerNames.map((name, index) => {
      const angle = (index / playerNames.length) * 2 * Math.PI - Math.PI / 2;
      return {
        id: name,
        name,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        angle,
        gamesPlayed: synergyData.get(name)?.games || 0
      };
    });
  };

  const createEdges = (): SynergyEdge[] => {
    const edges: SynergyEdge[] = [];
    
    playerNames.forEach(p1 => {
      const stats = synergyData.get(p1);
      if (!stats) return;

      stats.partners.forEach((partnerStats, p2) => {
        if (playerNames.includes(p2) && p1 < p2) { 
          const totalGames = partnerStats.wins + partnerStats.losses;
          const winRate = totalGames > 0 ? (partnerStats.wins / totalGames) * 100 : 0;
          
          if (totalGames >= 2) { 
            edges.push({
              from: p1,
              to: p2,
              strength: winRate,
              wins: partnerStats.wins,
              losses: partnerStats.losses
            });
          }
        }
      });
    });

    return edges.sort((a, b) => b.strength - a.strength);
  };

  const nodes = createNodes();
  const edges = createEdges();

  const topChemistryPairs = edges.filter(e => e.strength >= 60).slice(0, 5);
  const poorChemistryPairs = edges
  .filter(e => e.strength < 40)
  .sort((a, b) => a.strength - b.strength)
  .slice(0, 5);

  const getEdgeColor = (strength: number): string => {
    if (strength >= 70) return "#0799ba"; 
    if (strength >= 50) return "#8ec1b8"; 
    if (strength >= 30) return "#c0c0c0"; 
    return "#ff6b6b"; 
  };

  const getEdgeWidth = (strength: number): number => {
    if (strength >= 70) return 4;
    if (strength >= 50) return 3;
    if (strength >= 30) return 2;
    return 1.5;
  };

  const getNodeSize = (gamesPlayed: number): number => {
    return Math.max(8, Math.min(16, gamesPlayed * 1.5));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#8ec1b8]/20 via-[#0799ba]/10 to-[#1fa5b0]/15" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-6 scale-75 sm:scale-100 origin-left">
              <TeamBalancerLogo iconSize={60} showTagline={false} layout="horizontal" />
            </div>
            
            <Button
              variant="outline"
              className="border-2 border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10 bg-white w-full sm:w-auto"
              onClick={() => navigate("/statistics")}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Statistics
            </Button>
          </div>

          {/* Updated Title Area (Selector & Bazinga Button Removed) */}
          <div className="mb-8 flex flex-col items-start gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl text-[#006895] font-bold mb-2">Synergy Engine</h2>
              <p className="text-muted-foreground text-sm sm:text-base">Chemistry graph between the players</p>
            </div>
          </div>

          {/* Main Content - Centered Graph */}
          <div className="mt-4">
            <Card className="shadow-2xl border-4 border-white/50 backdrop-blur-sm bg-white/95">
              <CardHeader className="text-center border-b-2 border-[#8ec1b8]/20">
                <CardTitle className="text-xl sm:text-3xl text-[#006895] flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Users className="size-8" />
                  Global Chemistry Network
                </CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  Interactive synergy map showing teammate compatibility across all tournaments
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-8">
                
                {/* Check Loading State First */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-80">
                    <Loader2 className="size-16 text-[#0799ba] animate-spin mb-4" />
                    <h3 className="text-xl text-[#006895] font-semibold text-center">Analyzing Global Data...</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                      Compiling player chemistry across all tournaments.
                    </p>
                  </div>
                ) : playerNames.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-80">
                    <AlertCircle className="size-16 text-[#8ec1b8] mb-4" />
                    <h3 className="text-xl text-[#006895] font-semibold text-center">Not Enough Real Data</h3>
                    <p className="text-muted-foreground text-center max-w-md mt-2">
                      There are currently no real team matches in the database. Add real matches to generate the Synergy Graph!
                    </p>
                  </div>
                ) : (
                  <>
                    <div ref={canvasRef} className="relative w-full">
                      <svg 
                        viewBox="0 0 1000 800"
                        className="w-full h-auto mx-auto"
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))', maxHeight: '80vh' }}
                      >
                        {/* Draw edges first (behind nodes) */}
                        <g>
                          {edges.map((edge, index) => {
                            const fromNode = nodes.find(n => n.id === edge.from);
                            const toNode = nodes.find(n => n.id === edge.to);
                            if (!fromNode || !toNode) return null;

                            const isHovered = hoveredEdge === edge;
                            const isFiltered = selectedPlayer && selectedPlayer !== edge.from && selectedPlayer !== edge.to;

                            return (
                              <g key={index}>
                                <line
                                  x1={fromNode.x}
                                  y1={fromNode.y}
                                  x2={toNode.x}
                                  y2={toNode.y}
                                  stroke={getEdgeColor(edge.strength)}
                                  strokeWidth={isHovered ? getEdgeWidth(edge.strength) * 2 : getEdgeWidth(edge.strength)}
                                  strokeDasharray={edge.strength < 40 ? "5,5" : "0"}
                                  opacity={isFiltered ? 0.1 : isHovered ? 1 : 0.6}
                                  className="transition-all duration-200 cursor-pointer"
                                  onMouseEnter={() => setHoveredEdge(edge)}
                                  onMouseLeave={() => setHoveredEdge(null)}
                                />
                                {isHovered && (
                                  <>
                                    <rect
                                      x={(fromNode.x + toNode.x) / 2 - 60}
                                      y={(fromNode.y + toNode.y) / 2 - 35}
                                      width="120"
                                      height="30"
                                      fill="white"
                                      stroke={getEdgeColor(edge.strength)}
                                      strokeWidth="2"
                                      rx="6"
                                      opacity="0.95"
                                    />
                                    <text
                                      x={(fromNode.x + toNode.x) / 2}
                                      y={(fromNode.y + toNode.y) / 2 - 15}
                                      textAnchor="middle"
                                      className="text-sm font-bold"
                                      fill="#006895"
                                    >
                                      {edge.strength.toFixed(0)}% Win Rate
                                    </text>
                                    <text
                                      x={(fromNode.x + toNode.x) / 2}
                                      y={(fromNode.y + toNode.y) / 2}
                                      textAnchor="middle"
                                      className="text-xs"
                                      fill="#666"
                                    >
                                      {edge.wins}W - {edge.losses}L
                                    </text>
                                  </>
                                )}
                              </g>
                            );
                          })}
                        </g>

                        {/* Draw nodes on top */}
                        <g>
                          {nodes.map((node) => {
                            const isSelected = selectedPlayer === node.id;
                            const hasConnection = selectedPlayer && edges.some(
                              e => (e.from === selectedPlayer && e.to === node.id) || 
                                   (e.to === selectedPlayer && e.from === node.id)
                            );
                            const isFiltered = selectedPlayer && !isSelected && !hasConnection;

                            return (
                              <g 
                                key={node.id}
                                className="cursor-pointer transition-all duration-200"
                                onClick={() => setSelectedPlayer(isSelected ? null : node.id)}
                                opacity={isFiltered ? 0.2 : 1}
                              >
                                {isSelected && (
                                  <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={getNodeSize(node.gamesPlayed) + 8}
                                    fill="#0799ba"
                                    opacity="0.3"
                                  />
                                )}
                                
                                <circle
                                  cx={node.x}
                                  cy={node.y}
                                  r={getNodeSize(node.gamesPlayed)}
                                  fill={isSelected ? "#006895" : "#0799ba"}
                                  stroke="white"
                                  strokeWidth={isSelected ? 3 : 2}
                                  className="transition-all duration-200"
                                />
                                
                                <text
                                  x={node.x}
                                  y={node.y > 400 ? node.y + 25 : node.y - 20}
                                  textAnchor="middle"
                                  className={`text-sm ${isSelected ? 'font-bold' : 'font-medium'}`}
                                  fill={isSelected ? "#006895" : "#333"}
                                >
                                  {node.name}
                                </text>
                                
                                <text
                                  x={node.x}
                                  y={node.y + 5}
                                  textAnchor="middle"
                                  className="text-xs font-bold"
                                  fill="white"
                                >
                                  {node.gamesPlayed}
                                </text>
                              </g>
                            );
                          })}
                        </g>

                        <circle cx="500" cy="400" r="4" fill="#006895" opacity="0.3" />
                      </svg>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-12 h-1 bg-[#0799ba] rounded" />
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Strong (70%+)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-12 h-1 bg-[#8ec1b8] rounded" />
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Good (50-69%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-12 h-1 bg-[#c0c0c0] rounded" />
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Neutral (30-49%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 sm:w-12 h-1 bg-[#ff6b6b] rounded" style={{ borderStyle: 'dashed' }} />
                        <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Friction (&lt;30%)</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <Card className="shadow-xl border-2 border-[#8ec1b8] bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#8ec1b8]/20 to-[#0799ba]/10">
                <CardTitle className="text-lg sm:text-xl text-[#006895] flex items-center gap-2">
                  <TrendingUp className="size-5 text-[#0799ba]" />
                  High Chemistry Pairs
                </CardTitle>
                <CardDescription>
                  Top performing teammate combinations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {topChemistryPairs.length > 0 ? (
                  <div className="space-y-3">
                    {topChemistryPairs.map((edge, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#8ec1b8]/10 to-transparent border border-[#8ec1b8]/30 hover:border-[#0799ba] transition-all cursor-pointer gap-2"
                        onClick={() => setSelectedPlayer(edge.from)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8 shrink-0 rounded-full bg-[#0799ba] text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm sm:text-base">
                              {edge.from} + {edge.to}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {edge.wins}W - {edge.losses}L
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xl sm:text-2xl font-bold text-[#0799ba]">
                            {edge.strength.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No high chemistry pairs found
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xl border-2 border-[#ff6b6b]/50 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#ff6b6b]/10 to-[#ff8787]/5">
                <CardTitle className="text-lg sm:text-xl text-[#1a1a1a] flex items-center gap-2">
                  <TrendingDown className="size-5 text-[#ff6b6b]" />
                  Friction Pairs
                </CardTitle>
                <CardDescription>
                  Combinations needing improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {poorChemistryPairs.length > 0 ? (
                  <div className="space-y-3">
                    {poorChemistryPairs.map((edge, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#ff6b6b]/10 to-transparent border border-[#ff6b6b]/30 hover:border-[#ff6b6b] transition-all cursor-pointer gap-2"
                        onClick={() => setSelectedPlayer(edge.from)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-8 shrink-0 rounded-full bg-[#ff6b6b] text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm sm:text-base">
                              {edge.from} + {edge.to}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {edge.wins}W - {edge.losses}L
                            </p>
                          </div>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xl sm:text-2xl font-bold text-[#ff6b6b]">
                            {edge.strength.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No friction pairs found
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}