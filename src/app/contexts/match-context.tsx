// @refresh reset
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Match } from "../data/mock-data";

interface MatchContextType {
  matches: Match[];
  getMatchById: (id: string) => Match | undefined;
  createMatch: (match: Omit<Match, "id">) => Promise<Match | undefined>;
  updateMatch: (id: string, match: Partial<Match>) => Promise<Match | undefined>;
  deleteMatch: (id: string) => Promise<void>;
  isLoading: boolean;
  isOffline: boolean; // Exposing this so you can show a "You are offline" banner in your UI
}

interface SyncAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload?: any;
  matchId?: string; // Target ID for update/delete
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);
const API_URL = "http://localhost:3000/api/matches";

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // --- 1. LOCAL MEMORY HELPERS ---
  const saveLocalCache = (data: Match[]) => localStorage.setItem('matchesCache', JSON.stringify(data));
  
  const getSyncQueue = (): SyncAction[] => JSON.parse(localStorage.getItem('syncQueue') || '[]');
  
  const addToSyncQueue = (action: Omit<SyncAction, 'id'>) => {
    const queue = getSyncQueue();
    queue.push({ ...action, id: Date.now().toString() });
    localStorage.setItem('syncQueue', JSON.stringify(queue));
  };

  // --- 2. SYNCHRONIZATION ENGINE ---
  const syncWithServer = useCallback(async () => {
    const queue = getSyncQueue();
    if (queue.length === 0) return;

    console.log(`Syncing ${queue.length} background operations to server...`);
    
    // Process queue sequentially to preserve the order of operations
    for (const action of queue) {
      try {
        if (action.type === 'CREATE') {
          await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action.payload) });
        } else if (action.type === 'UPDATE') {
          await fetch(`${API_URL}/${action.matchId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action.payload) });
        } else if (action.type === 'DELETE') {
          await fetch(`${API_URL}/${action.matchId}`, { method: "DELETE" });
        }
      } catch (err) {
        console.error("Failed to sync action, stopping queue processing:", err);
        return; // Stop processing if server goes down mid-sync
      }
    }

    // If we get here, all syncs succeeded! Clear the queue.
    localStorage.removeItem('syncQueue');
    fetchMatches(); // Pull the authoritative true state from the server
  }, []);

  // --- 3. FETCH AND NETWORK DETECTION ---
  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_URL}?limit=1000`);
      if (!response.ok) throw new Error("Server rejected request");
      
      const result = await response.json();
      setMatches(result.data);
      saveLocalCache(result.data);
      
      if (isOffline) {
        setIsOffline(false);
        syncWithServer(); // We are back online, trigger sync!
      }
    } catch (error) {
      console.warn("Offline Mode Active: Serving from local cache.");
      setIsOffline(true);
      // Fallback to local memory if the server is unreachable
      const cached = localStorage.getItem('matchesCache');
      if (cached) setMatches(JSON.parse(cached));
    } finally {
      setIsLoading(false);
    }
  };

  // Listen to browser network events
 useEffect(() => {
    const handleOnline = () => { setIsOffline(false); fetchMatches(); syncWithServer(); };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    fetchMatches(); 

    // --- Establish WebSocket Connection ---
    const ws = new WebSocket("ws://localhost:3000");
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // If the server broadcasts a new match, inject it directly into React State!
        if (data.type === 'NEW_MATCH') {
          setMatches(prev => {
            const updated = [data.payload, ...prev];
            saveLocalCache(updated); // Update offline cache too
            return updated;
          });
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message", err);
      }
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      ws.close(); // Clean up socket when context unmounts
    };
  }, [syncWithServer]);


  // --- 4. CRUD OPERATIONS (Optimistic + Queued) ---
  const getMatchById = (id: string) => matches.find(m => m.id === id);

  const createMatch = async (matchData: Omit<Match, "id">) => {
    // Optimistic UI Update (generate a temporary ID)
    const tempMatch: Match = { id: `temp_${Date.now()}`, ...matchData as any };
    const updatedMatches = [tempMatch, ...matches];
    setMatches(updatedMatches);
    saveLocalCache(updatedMatches);

    try {
      if (isOffline) throw new Error("Offline");
      const response = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(matchData) });
      if (!response.ok) throw new Error("Server error");
      
      const newMatch = await response.json();
      // Replace temp match with real server match
      setMatches(prev => prev.map(m => m.id === tempMatch.id ? newMatch : m));
      return newMatch;
    } catch (error) {
      setIsOffline(true);
      addToSyncQueue({ type: 'CREATE', payload: matchData });
      return tempMatch;
    }
  };

  const updateMatch = async (id: string, matchData: Partial<Match>) => {
    // Optimistic Update
    const updatedMatches = matches.map(m => m.id === id ? { ...m, ...matchData } as Match : m);
    setMatches(updatedMatches);
    saveLocalCache(updatedMatches);

    try {
      if (isOffline) throw new Error("Offline");
      const response = await fetch(`${API_URL}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(matchData) });
      if (!response.ok) throw new Error("Server error");
      return await response.json();
    } catch (error) {
      setIsOffline(true);
      addToSyncQueue({ type: 'UPDATE', matchId: id, payload: matchData });
    }
  };

  const deleteMatch = async (id: string) => {
    // Optimistic Update
    const updatedMatches = matches.filter(m => m.id !== id);
    setMatches(updatedMatches);
    saveLocalCache(updatedMatches);

    try {
      if (isOffline) throw new Error("Offline");
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Server error");
    } catch (error) {
      setIsOffline(true);
      addToSyncQueue({ type: 'DELETE', matchId: id });
    }
  };

  return (
    <MatchContext.Provider value={{ matches, getMatchById, createMatch, updateMatch, deleteMatch, isLoading, isOffline }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (!context) throw new Error("useMatches must be used within a MatchProvider");
  return context;
}