// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { MatchProvider, useMatches } from '../src/app/contexts/match-context'; 
import React from 'react';
import { describe, it, expect } from 'vitest';

// Wrapper to provide the context to our hook during testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MatchProvider>{children}</MatchProvider>
);

describe('Match Context CRUD Operations (RAM Storage)', () => {

  // --- HAPPY PATH TESTS ---

  it('READ: Should initialize with default mock data', () => {
    const { result } = renderHook(() => useMatches(), { wrapper });
    expect(result.current.matches.length).toBeGreaterThan(0);
  });

  it('CREATE: Should add a new match to RAM', () => {
    const { result } = renderHook(() => useMatches(), { wrapper });
    const initialLength = result.current.matches.length;

    const newMatch = {
      date: "2026-05-20",
      scoreA: 25,
      scoreB: 23,
      winner: "Team A",
      teamA: { name: "Team A", totalSkill: 150, players: [] },
      teamB: { name: "Team B", totalSkill: 145, players: [] }
    };

    act(() => {
      result.current.createMatch(newMatch as any);
    });

    expect(result.current.matches.length).toBe(initialLength + 1);
    expect(result.current.matches[0].scoreA).toBe(25); // Assumes new matches prepend
  });

  it('UPDATE: Should modify an existing match in RAM', () => {
    const { result } = renderHook(() => useMatches(), { wrapper });
    const targetMatchId = result.current.matches[0].id;
    
    act(() => {
      result.current.updateMatch(targetMatchId, { scoreA: 30, winner: "Team A" });
    });

    const updatedMatch = result.current.getMatchById(targetMatchId);
    expect(updatedMatch?.scoreA).toBe(30);
  });

  it('DELETE: Should remove a match from RAM', () => {
    const { result } = renderHook(() => useMatches(), { wrapper });
    const initialLength = result.current.matches.length;
    const targetMatchId = result.current.matches[0].id;

    act(() => {
      result.current.deleteMatch(targetMatchId);
    });

    expect(result.current.matches.length).toBe(initialLength - 1);
    const deletedMatch = result.current.getMatchById(targetMatchId);
    expect(deletedMatch).toBeUndefined();
  });

  // --- EDGE CASE TESTS (Added for Maximum Coverage) ---

  it('READ: Should return undefined for a non-existent match ID', () => {
    const { result } = renderHook(() => useMatches(), { wrapper });
    const match = result.current.getMatchById('invalid-id-123');
    expect(match).toBeUndefined();
  });

  it('UPDATE: Should not break when updating a non-existent match', () => {
    const { result } = renderHook(() => useMatches(), { wrapper });
    const initialLength = result.current.matches.length;

    act(() => {
      result.current.updateMatch('invalid-id-123', { scoreA: 99 });
    });

    // Length should remain unchanged and no crashes should occur
    expect(result.current.matches.length).toBe(initialLength);
  });

  it('DELETE: Should not break or modify array when deleting a non-existent match', () => {
    const { result } = renderHook(() => useMatches(), { wrapper });
    const initialLength = result.current.matches.length;

    act(() => {
      result.current.deleteMatch('invalid-id-123');
    });

    // Length should remain unchanged
    expect(result.current.matches.length).toBe(initialLength);
  });
});