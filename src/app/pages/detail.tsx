import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { useMatches } from "../contexts/match-context";
import { useAuth } from "../contexts/auth-context";
import { ArrowLeft, Trophy, Users, TrendingUp, MessageSquare, Trash2, Send } from "lucide-react";

interface Comment { 
  id: string; 
  matchId: string; 
  userId: string; 
  userEmail: string; 
  text: string; 
  createdAt: string; 
}

export default function DetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getMatchById } = useMatches();
  const { user, isAdmin } = useAuth();
  
  const match = getMatchById(id!);

  // --- CHAT STATE ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [newText, setNewText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const IP = import.meta.env.VITE_SERVER_IP || "localhost";

  // --- FETCH COMMENTS & WEBSOCKET SETUP ---
  useEffect(() => {
    if (!id) return;

    // 1. Fetch historical comments from MongoDB via GraphQL
    fetch(`http://${IP}:3000/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: `query { matchComments(matchId: "${id}") { id userId userEmail text createdAt } }` 
      })
    })
    .then(res => res.json())
    .then(json => {
      if (json.data?.matchComments) {
        setComments(json.data.matchComments);
      }
    })
    .catch(err => console.error("Failed to load comments", err));

    // 2. Open Real-Time WebSocket Connection
    const ws = new WebSocket(`ws://${IP}:3000`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Only add the comment if it belongs to THIS match
      if (data.type === 'NEW_COMMENT' && data.payload.matchId === id) {
        setComments(prev => [...prev, data.payload]);
      }
      if (data.type === 'COMMENT_DELETED') {
        setComments(prev => prev.filter(c => c.id !== data.payload));
      }
    };

    return () => ws.close(); // Clean up on unmount
  }, [id, IP]);

  // Auto-scroll to the bottom when new comments arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [comments]);

  // --- CHAT ACTIONS ---
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !user || !id) return;

    try {
      await fetch(`http://${IP}:3000/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `mutation { addComment(matchId: "${id}", userId: "${user.id}", userEmail: "${user.email}", text: "${newText}") { id } }`
        })
      });
      setNewText(""); // Clear input, WebSocket handles the UI update
    } catch (err) {
      console.error("Failed to send comment", err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!isAdmin) return;
    try {
      await fetch(`http://${IP}:3000/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: `mutation { deleteComment(commentId: "${commentId}") }` 
        })
      });
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

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

        {/* Team breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Team A */}
          <Card 
            className="shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ borderTop: match.winner === "Team A" ? "4px solid #006895" : "4px solid #8ec1b8" }}
          >
            <CardHeader className="bg-gradient-to-br from-[#006895]/5 to-transparent border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-[#006895]">Team A</CardTitle>
                {match.winner === "Team A" && <Trophy className="size-6 text-[#006895]" />}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-3xl text-[#006895]" style={{ fontWeight: 700 }}>{match.scoreA}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Skill</p>
                  <p className="text-3xl text-[#0799ba]" style={{ fontWeight: 700 }}>{match.teamA.totalSkill}</p>
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
                      <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-[#006895] to-[#0799ba] flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{player.name}</p>
                        <p className="text-sm text-muted-foreground">Skill Value: {player.skillValue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-sm text-muted-foreground">Adjustment:</span>
                      <span className="px-3 py-1 rounded-full bg-[#8ec1b8]/20 text-[#006895] font-semibold">
                        {player.skillAdjustment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team B */}
          <Card 
            className="shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{ borderTop: match.winner === "Team B" ? "4px solid #006895" : "4px solid #8ec1b8" }}
          >
            <CardHeader className="bg-gradient-to-bl from-[#1fa5b0]/5 to-transparent border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-[#006895]">Team B</CardTitle>
                {match.winner === "Team B" && <Trophy className="size-6 text-[#006895]" />}
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-3xl text-[#006895]" style={{ fontWeight: 700 }}>{match.scoreB}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Total Skill</p>
                  <p className="text-3xl text-[#1fa5b0]" style={{ fontWeight: 700 }}>{match.teamB.totalSkill}</p>
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
                      <div className="size-10 shrink-0 rounded-full bg-gradient-to-br from-[#1fa5b0] to-[#8ec1b8] flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{player.name}</p>
                        <p className="text-sm text-muted-foreground">Skill Value: {player.skillValue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-sm text-muted-foreground">Adjustment:</span>
                      <span className="px-3 py-1 rounded-full bg-[#8ec1b8]/20 text-[#006895] font-semibold">
                        {player.skillAdjustment}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- LIVE MATCH DISCUSSION (MONGODB + WEBSOCKETS) --- */}
        <Card className="mb-8 shadow-lg border-2 border-[#0799ba]/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#006895]/5 to-transparent border-b pb-4">
            <CardTitle className="text-xl flex items-center gap-2 text-[#006895]">
              <MessageSquare className="size-5" /> Live Match Discussion
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[350px] bg-slate-50/50" ref={scrollRef}>
              <div className="p-4 sm:p-6">
                {comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <MessageSquare className="size-10 mb-2 opacity-20" />
                    <p>No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => {
                      const isMine = user?.id === comment.userId;
                      return (
                        <div key={comment.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          <span className="text-xs text-muted-foreground mb-1 px-1 font-medium">
                            {comment.userEmail.split('@')[0]} • {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          <div className={`relative group max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            isMine 
                              ? 'bg-[#006895] text-white rounded-tr-sm' 
                              : 'bg-white border border-border rounded-tl-sm'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                            
                            {/* Admin Delete Button */}
                            {isAdmin && (
                              <button 
                                onClick={() => handleDelete(comment.id)}
                                className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-all ${
                                  isMine ? '-left-10' : '-right-10'
                                }`}
                                title="Delete Comment (Admin)"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 bg-white border-t border-border">
              {user ? (
                <form onSubmit={handleSend} className="flex gap-3">
                  <Input 
                    value={newText} 
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Write a comment..." 
                    className="flex-1 focus-visible:ring-[#0799ba] border-2 border-transparent bg-muted/50 focus:bg-background transition-colors"
                  />
                  <Button type="submit" disabled={!newText.trim()} className="bg-[#0799ba] hover:bg-[#006895] text-white px-6">
                    <Send className="size-4 sm:mr-2" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              ) : (
                <div className="py-3 text-center rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    You must be <button onClick={() => navigate("/login")} className="text-[#0799ba] font-medium hover:underline">logged in</button> to chat.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analysis footer */}
        <Card className="shadow-lg bg-gradient-to-r from-[#006895]/5 via-[#0799ba]/5 to-[#8ec1b8]/5">
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