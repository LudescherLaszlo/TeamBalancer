import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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

interface SyncAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload?: any;
  matchId?: string;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);
const GQL_URL = "http://192.168.1.50:3000/graphql";

// --- BULLETPROOF FETCHER ---
// We now parse the JSON *before* checking !res.ok, because Apollo Server 
// returns HTTP 400 for validation errors. We need to catch those specifically!
const gqlFetch = async (query: string, variables = {}) => {
  const res = await fetch(GQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  
  const json = await res.json().catch(() => null); 
  
  if (json && json.errors) {
    throw new Error(`GRAPHQL_ERROR: ${json.errors[0].message}`);
  }
  
  if (!res.ok) {
    throw new Error(`HTTP_ERROR: Server returned ${res.status}`);
  }
  
  return json.data;
};

// --- PAYLOAD SANITIZER ---
const sanitizeForGraphQL = (payload: any) => {
  return {
    tournamentId: payload.tournamentId,
    date: payload.date || new Date().toISOString(), // Fallback prevents Apollo 400 errors
    scoreA: Number(payload.scoreA || 0),
    scoreB: Number(payload.scoreB || 0),
    winner: payload.winner || "Team A",
    teamA: {
      name: payload.teamA?.name || "Team A",
      totalSkill: Number(payload.teamA?.totalSkill || 0),
      players: (payload.teamA?.players || []).map((p: any) => ({
        id: p.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: p.name || "Unknown Player",
        skillValue: Number(p.skillValue || 0),
        skillAdjustment: p.skillAdjustment || "+0"
      }))
    },
    teamB: {
      name: payload.teamB?.name || "Team B",
      totalSkill: Number(payload.teamB?.totalSkill || 0),
      players: (payload.teamB?.players || []).map((p: any) => ({
        id: p.id || `p_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: p.name || "Unknown Player",
        skillValue: Number(p.skillValue || 0),
        skillAdjustment: p.skillAdjustment || "+0"
      }))
    }
  };
};

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTournamentId, setActiveTournamentId] = useState("t_1");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const saveLocalCache = (data: Match[]) => localStorage.setItem('gqlMatchesCache', JSON.stringify(data));
  const getSyncQueue = (): SyncAction[] => JSON.parse(localStorage.getItem('gqlSyncQueue') || '[]');
  const addToSyncQueue = (action: Omit<SyncAction, 'id'>) => {
    const queue = getSyncQueue();
    queue.push({ ...action, id: Date.now().toString() });
    localStorage.setItem('gqlSyncQueue', JSON.stringify(queue));
  };

  // --- SYNCHRONIZATION ENGINE ---
  const syncWithServer = useCallback(async () => {
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} background operations to GraphQL server...`);
    
    const idTranslationMap: Record<string, string> = {};
    const failedActions: SyncAction[] = [];

    for (const action of queue) {
      try {
        let targetId = action.matchId;
        if (targetId && idTranslationMap[targetId]) {
          targetId = idTranslationMap[targetId];
        }

        if (action.type === 'CREATE') {
          const data = await gqlFetch(`mutation CreateMatch($input: MatchInput!) { createMatch(input: $input) { id } }`, { input: action.payload });
          if (action.matchId && data?.createMatch?.id) {
            idTranslationMap[action.matchId] = data.createMatch.id;
          }
        } else if (action.type === 'UPDATE') {
          await gqlFetch(`mutation UpdateMatch($id: ID!, $input: MatchInput!) { updateMatch(id: $id, input: $input) { id } }`, { id: targetId, input: action.payload });
        } else if (action.type === 'DELETE') {
          await gqlFetch(`mutation DeleteMatch($id: ID!) { deleteMatch(id: $id) }`, { id: targetId });
        }
      } catch (err: any) {
        if (err.message && err.message.includes('GRAPHQL_ERROR')) {
          console.error("GraphQL validation rejected this action. Dropping it to unblock queue.", err.message);
        } else {
          console.error("Network dropped mid-sync. Pausing queue.");
          failedActions.push(action);
          break; 
        }
      }
    }

    if (failedActions.length > 0) {
      localStorage.setItem('gqlSyncQueue', JSON.stringify(failedActions));
    } else {
      localStorage.removeItem('gqlSyncQueue');
      loadMatches(true); // Fetch fresh data ONLY AFTER the queue completes!
    }
  }, []);


  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await gqlFetch(`query { tournaments { id name status } }`);
        setTournaments(data.tournaments);
      } catch (err) { console.error("Offline: Cannot fetch tournaments"); }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); syncWithServer(); };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadMatches(true);

    const ws = new WebSocket("ws://localhost:3000");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NEW_MATCH' && data.payload.tournamentId === activeTournamentId) {
          setMatches(prev => {
            const updated = [data.payload, ...prev];
            saveLocalCache(updated);
            return updated;
          });
        }
      } catch (err) { }
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      ws.close();
    };
  }, [syncWithServer, activeTournamentId]);

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
      const data = await gqlFetch(query, { tournamentId: activeTournamentId, cursor: reset ? null : endCursor, limit: 10 });
      const newMatches = reset ? data.matches.edges : [...matches, ...data.matches.edges];
      
      setMatches(newMatches);
      saveLocalCache(newMatches);
      setHasNextPage(data.matches.pageInfo.hasNextPage);
      setEndCursor(data.matches.pageInfo.endCursor);
      setIsOffline(false);
    } catch (err) {
      console.warn("Offline Mode Active: Serving from local cache.");
      setIsOffline(true);
      if (reset) {
        const cached = localStorage.getItem('gqlMatchesCache');
        if (cached) setMatches(JSON.parse(cached));
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getMatchById = (id: string) => matches.find(m => m.id === id);

  const createMatch = async (matchData: any) => {
    const rawPayload = { ...matchData, tournamentId: matchData.tournamentId || activeTournamentId };
    const cleanInput = sanitizeForGraphQL(rawPayload);
    
    const tempMatch = { id: `temp_${Date.now()}`, ...rawPayload };
    if (rawPayload.tournamentId === activeTournamentId) {
      const updated = [tempMatch, ...matches];
      setMatches(updated);
      saveLocalCache(updated);
    }

    try {
      if (isOffline) throw new Error("Offline");
      const mutation = `mutation CreateMatch($input: MatchInput!) { createMatch(input: $input) { id tournamentId date scoreA scoreB winner teamA { name totalSkill players { id name skillValue skillAdjustment } } teamB { name totalSkill players { id name skillValue skillAdjustment } } } }`;
      const data = await gqlFetch(mutation, { input: cleanInput });
      
      if (rawPayload.tournamentId === activeTournamentId) {
        setMatches(prev => prev.map(m => m.id === tempMatch.id ? data.createMatch : m));
      }
      return data.createMatch;
    } catch (error) {
      setIsOffline(true);
      addToSyncQueue({ type: 'CREATE', matchId: tempMatch.id, payload: cleanInput });
      return tempMatch;
    }
  };

  const updateMatch = async (id: string, matchData: any) => {
    const rawPayload = { ...matchData, tournamentId: matchData.tournamentId || activeTournamentId };
    const cleanInput = sanitizeForGraphQL(rawPayload);
    
    const updatedMatches = matches.map(m => m.id === id ? { ...m, ...rawPayload } as any : m);
    setMatches(updatedMatches);
    saveLocalCache(updatedMatches);

    try {
      if (isOffline) throw new Error("Offline");
      const mutation = `mutation UpdateMatch($id: ID!, $input: MatchInput!) { updateMatch(id: $id, input: $input) { id tournamentId date scoreA scoreB winner teamA { name totalSkill players { id name skillValue skillAdjustment } } teamB { name totalSkill players { id name skillValue skillAdjustment } } } }`;
      const data = await gqlFetch(mutation, { id, input: cleanInput });
      return data.updateMatch;
    } catch (error) {
      setIsOffline(true);
      addToSyncQueue({ type: 'UPDATE', matchId: id, payload: cleanInput });
    }
  };

  const deleteMatch = async (id: string) => {
    const updatedMatches = matches.filter(m => m.id !== id);
    setMatches(updatedMatches);
    saveLocalCache(updatedMatches);

    try {
      if (isOffline) throw new Error("Offline");
      await gqlFetch(`mutation DeleteMatch($id: ID!) { deleteMatch(id: $id) }`, { id });
    } catch (error) {
      setIsOffline(true);
      addToSyncQueue({ type: 'DELETE', matchId: id });
    }
  };

  return (
    <MatchContext.Provider value={{ matches, tournaments, activeTournamentId, setActiveTournamentId, hasNextPage, isLoadingMore, isOffline, loadMatches, createMatch, updateMatch, deleteMatch, getMatchById }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (!context) throw new Error("useMatches must be used within a MatchProvider");
  return context;
}