import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Match, Tournament } from "../data/mock-data";

const GQL_URL = "http://localhost:3000/graphql";

// A reusable fetcher for GraphQL
const gqlFetch = async (query: string, variables = {}) => {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
};

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState("t_1"); // Default 1-to-N context
  
  // Infinite Scroll State
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch initial batch
  useEffect(() => {
    loadMatches(true);
  }, [activeTournamentId]);

  const loadMatches = async (reset = false) => {
    if (isLoadingMore || (!hasNextPage && !reset)) return;
    setIsLoadingMore(true);

    const query = `
      query GetMatches($tournamentId: ID, $cursor: String, $limit: Int) {
        matches(tournamentId: $tournamentId, cursor: $cursor, limit: $limit) {
          edges { id date scoreA scoreB winner teamA { totalSkill } teamB { totalSkill } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;

    try {
      const data = await gqlFetch(query, { 
        tournamentId: activeTournamentId, 
        cursor: reset ? null : endCursor, 
        limit: 10 
      });

      setMatches(prev => reset ? data.matches.edges : [...prev, ...data.matches.edges]);
      setHasNextPage(data.matches.pageInfo.hasNextPage);
      setEndCursor(data.matches.pageInfo.endCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <MatchContext.Provider value={{ matches, loadMatches, hasNextPage, isLoadingMore, activeTournamentId }}>
      {children}
    </MatchContext.Provider>
  );
}