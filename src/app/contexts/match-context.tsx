import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Match, Tournament } from "../data/mock-data";

interface MatchContextType {
  matches: Match[];
  tournaments: Tournament[];
  activeTournamentId: string;
  setActiveTournamentId: (id: string) => void;
  hasNextPage: boolean;
  isLoadingMore: boolean;
  isOffline: boolean;
  loadMatches: (reset?: boolean) => Promise<void>;
  createMatch: (match: Omit<Match, "id">) => Promise<Match | undefined>;
  updateMatch: (id: string, match: Partial<Match>) => Promise<Match | undefined>;
  deleteMatch: (id: string) => Promise<void>;
  getMatchById: (id: string) => Match | undefined;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);
const GQL_URL = "http://localhost:3000/graphql";

// Reusable fetcher for GraphQL queries and mutations
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
  const [activeTournamentId, setActiveTournamentId] = useState("t_1");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Fetch Tournaments on initial load so the Dropdown is populated
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await gqlFetch(`query { tournaments { id name status } }`);
        setTournaments(data.tournaments);
      } catch (err) {
        console.error("Failed to load tournaments:", err);
      }
    };
    fetchTournaments();
  }, []);

  // Reload Matches whenever the Active Tournament Dropdown changes
  useEffect(() => {
    loadMatches(true);
  }, [activeTournamentId]);

  const loadMatches = async (reset = false) => {
    if (isLoadingMore || (!hasNextPage && !reset)) return;
    setIsLoadingMore(true);

    const query = `
      query GetMatches($tournamentId: ID, $cursor: String, $limit: Int) {
        matches(tournamentId: $tournamentId, cursor: $cursor, limit: $limit) {
          edges { 
            id tournamentId date scoreA scoreB winner 
            teamA { name totalSkill players { id name skillValue skillAdjustment } } 
            teamB { name totalSkill players { id name skillValue skillAdjustment } } 
          }
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
      setIsOffline(false);
    } catch (err) {
      console.error(err);
      setIsOffline(true);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getMatchById = (id: string) => matches.find(m => m.id === id);

  const createMatch = async (matchData: any) => {
    const payload = { ...matchData, tournamentId: matchData.tournamentId || activeTournamentId };
    
    const mutation = `
      mutation CreateMatch($input: MatchInput!) {
        createMatch(input: $input) {
          id tournamentId date scoreA scoreB winner
          teamA { name totalSkill players { id name skillValue skillAdjustment } }
          teamB { name totalSkill players { id name skillValue skillAdjustment } }
        }
      }
    `;
    try {
      const data = await gqlFetch(mutation, { input: payload });
      if (payload.tournamentId === activeTournamentId) {
        setMatches(prev => [data.createMatch, ...prev]);
      }
      return data.createMatch;
    } catch (error) {
      console.error("GraphQL Create Error:", error);
    }
  };

  const updateMatch = async (id: string, matchData: any) => {
    const payload = { ...matchData, tournamentId: matchData.tournamentId || activeTournamentId };
    const mutation = `
      mutation UpdateMatch($id: ID!, $input: MatchInput!) {
        updateMatch(id: $id, input: $input) {
          id tournamentId date scoreA scoreB winner
          teamA { name totalSkill players { id name skillValue skillAdjustment } }
          teamB { name totalSkill players { id name skillValue skillAdjustment } }
        }
      }
    `;
    try {
      const data = await gqlFetch(mutation, { id, input: payload });
      setMatches(prev => prev.map(m => m.id === id ? data.updateMatch : m));
      return data.updateMatch;
    } catch (error) {
      console.error("GraphQL Update Error:", error);
    }
  };

  const deleteMatch = async (id: string) => {
    const mutation = `
      mutation DeleteMatch($id: ID!) {
        deleteMatch(id: $id)
      }
    `;
    try {
      await gqlFetch(mutation, { id });
      setMatches(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("GraphQL Delete Error:", error);
    }
  };

  return (
    <MatchContext.Provider value={{ 
      matches, tournaments, activeTournamentId, setActiveTournamentId, 
      hasNextPage, isLoadingMore, isOffline, 
      loadMatches, createMatch, updateMatch, deleteMatch, getMatchById 
    }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (!context) throw new Error("useMatches must be used within a MatchProvider");
  return context;
}