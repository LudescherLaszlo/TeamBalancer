import { useNavigate, useParams } from "react-router";
import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useMatches } from "../contexts/match-context";
import { ArrowLeft, Trophy, Users, TrendingUp } from "lucide-react";

export default function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getMatchById } = useMatches();
  
  const match = getMatchById(id!);

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-lg mb-4">Match not found</p>
            <Button onClick={() => navigate("/matches")} className="w-full sm:w-auto">
              Back to Matches
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      weekday: "long",
      month: "long", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-6 scale-75 sm:scale-100 origin-left">
            <TeamBalancerLogo iconSize={60} showTagline={false} layout="horizontal" />
          </div>
          
          <Button
            variant="outline"
            className="border-2 border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10 w-full sm:w-auto"
            onClick={() => navigate("/matches")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Matches
          </Button>
        </div>

        {/* Subtitle */}
        <div className="mb-8">
          <h2 className="text-2xl text-[#006895]" style={{ fontWeight: 700 }}>
            Match Details
          </h2>
          <p className="text-muted-foreground mt-1">
            {formatDate(match.date)}
          </p>
        </div>

        {/* Match summary card */}
        <Card className="mb-8 shadow-lg border-2 border-[#8ec1b8]/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto">
                <div className="flex items-center gap-3">
                  <Trophy className="size-8 text-[#006895]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Winner</p>
                    <p className="text-2xl text-[#006895]" style={{ fontWeight: 700 }}>
                      {match.winner}
                    </p>
                  </div>
                </div>
                
                <div className="hidden sm:block h-12 w-px bg-border" />
                <div className="sm:hidden w-full h-px bg-border my-2" />
                
                <div className="flex items-center gap-3">
                  <Users className="size-8 text-[#0799ba]" />
                  <div>
                    <p className="text-sm text-muted-foreground">Final Score</p>
                    <p className="text-2xl" style={{ fontWeight: 600 }}>
                      {match.scoreA} - {match.scoreB}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#8ec1b8]/10 w-full md:w-auto justify-start md:justify-center mt-4 md:mt-0">
                <TrendingUp className="size-5 text-[#1fa5b0]" />
                <div>
                  <p className="text-sm text-muted-foreground">Skill Balance</p>
                  <p className="text-lg text-[#006895]" style={{ fontWeight: 600 }}>
                    {Math.abs(match.teamA.totalSkill - match.teamB.totalSkill)} pts
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team breakdown - symmetrical balance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team A */}
          <Card 
            className="shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{
              borderTop: match.winner === "Team A" ? "4px solid #006895" : "4px solid #8ec1b8"
            }}
          >
            <CardHeader className="bg-gradient-to-br from-[#006895]/5 to-transparent border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-[#006895]">
                  Team A
                </CardTitle>
                {match.winner === "Team A" && (
                  <Trophy className="size-6 text-[#006895]" />
                )}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-3xl text-[#006895]" style={{ fontWeight: 700 }}>
                    {match.scoreA}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Skill</p>
                  <p className="text-3xl text-[#0799ba]" style={{ fontWeight: 700 }}>
                    {match.teamA.totalSkill}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {match.teamA.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-[#0799ba]/5 transition-colors duration-200 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-10 shrink-0 rounded-full bg-gradient-to-br from-[#006895] to-[#0799ba] flex items-center justify-center text-white"
                        style={{ fontWeight: 600 }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Skill Value: {player.skillValue}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-sm text-muted-foreground">Adjustment:</span>
                      <span 
                        className="px-3 py-1 rounded-full bg-[#8ec1b8]/20 text-[#006895]"
                        style={{ fontWeight: 600 }}
                      >
                        {player.skillAdjustment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team B - mirror layout for balance */}
          <Card 
            className="shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{
              borderTop: match.winner === "Team B" ? "4px solid #006895" : "4px solid #8ec1b8"
            }}
          >
            <CardHeader className="bg-gradient-to-bl from-[#1fa5b0]/5 to-transparent border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-[#006895]">
                  Team B
                </CardTitle>
                {match.winner === "Team B" && (
                  <Trophy className="size-6 text-[#006895]" />
                )}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-3xl text-[#006895]" style={{ fontWeight: 700 }}>
                    {match.scoreB}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Skill</p>
                  <p className="text-3xl text-[#1fa5b0]" style={{ fontWeight: 700 }}>
                    {match.teamB.totalSkill}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {match.teamB.players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-[#1fa5b0]/5 transition-colors duration-200 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-10 shrink-0 rounded-full bg-gradient-to-br from-[#1fa5b0] to-[#8ec1b8] flex items-center justify-center text-white"
                        style={{ fontWeight: 600 }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Skill Value: {player.skillValue}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-sm text-muted-foreground">Adjustment:</span>
                      <span 
                        className="px-3 py-1 rounded-full bg-[#8ec1b8]/20 text-[#006895]"
                        style={{ fontWeight: 600 }}
                      >
                        {player.skillAdjustment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis footer */}
        <Card className="mt-8 shadow-lg bg-gradient-to-r from-[#006895]/5 via-[#0799ba]/5 to-[#8ec1b8]/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 rounded-lg bg-[#006895] shrink-0">
                <TrendingUp className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg text-[#006895] mb-2" style={{ fontWeight: 600 }}>
                  Match Analysis
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm sm:text-base">
                  This match featured well-balanced teams with a skill differential of only{" "}
                  <span className="font-semibold text-[#006895]">
                    {Math.abs(match.teamA.totalSkill - match.teamB.totalSkill)} points
                  </span>
                  . The close total skill values ensured competitive gameplay. Player skill adjustments 
                  reflect performance improvements based on recent match outcomes, helping to maintain 
                  long-term team balance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}