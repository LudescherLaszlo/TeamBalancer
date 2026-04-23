import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Match } from "../data/mock-data";

interface MatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (matchData: Omit<Match, "id"> | Match) => void;
  match?: Match;
  mode: "create" | "edit";
}

export function MatchFormDialog({
  open,
  onOpenChange,
  onSave,
  match,
  mode,
}: MatchFormDialogProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    teamAPlayers: ["", "", "", ""],
    teamBPlayers: ["", "", "", ""],
    scoreA: 21,
    scoreB: 19,
    winner: "Team A" as "Team A" | "Team B",
  });

  useEffect(() => {
    if (match && mode === "edit") {
      setFormData({
        date: match.date,
        teamAPlayers: match.teamA.players.map(p => p.name),
        teamBPlayers: match.teamB.players.map(p => p.name),
        scoreA: match.scoreA,
        scoreB: match.scoreB,
        winner: match.winner,
      });
    } else {
      // Reset form for create mode
      setFormData({
        date: new Date().toISOString().split("T")[0],
        teamAPlayers: ["", "", "", ""],
        teamBPlayers: ["", "", "", ""],
        scoreA: 21,
        scoreB: 19,
        winner: "Team A",
      });
    }
  }, [match, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate player objects with skill values
    const createPlayers = (names: string[], startId: number) => {
      return names
        .filter(name => name.trim() !== "")
        .map((name, index) => ({
          id: `p${startId + index}`,
          name: name.trim(),
          skillValue: Math.floor(Math.random() * 15) + 75, // Random skill 75-90
          skillAdjustment: `+${Math.floor(Math.random() * 3) + 1}`,
        }));
    };

    const teamAPlayers = createPlayers(formData.teamAPlayers, 1);
    const teamBPlayers = createPlayers(formData.teamBPlayers, 100);

    const teamATotalSkill = teamAPlayers.reduce((sum, p) => sum + p.skillValue, 0);
    const teamBTotalSkill = teamBPlayers.reduce((sum, p) => sum + p.skillValue, 0);

    const matchData = {
      ...(mode === "edit" && match ? { id: match.id } : {}),
      date: formData.date,
      teamA: {
        name: "Team A",
        players: teamAPlayers,
        totalSkill: teamATotalSkill,
      },
      teamB: {
        name: "Team B",
        players: teamBPlayers,
        totalSkill: teamBTotalSkill,
      },
      scoreA: formData.scoreA,
      scoreB: formData.scoreB,
      winner: formData.winner,
    };

    onSave(matchData as any);
    onOpenChange(false);
  };

  const updateTeamAPlayer = (index: number, value: string) => {
    const newPlayers = [...formData.teamAPlayers];
    newPlayers[index] = value;
    setFormData({ ...formData, teamAPlayers: newPlayers });
  };

  const updateTeamBPlayer = (index: number, value: string) => {
    const newPlayers = [...formData.teamBPlayers];
    newPlayers[index] = value;
    setFormData({ ...formData, teamBPlayers: newPlayers });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#006895]">
            {mode === "create" ? "Add New Match" : "Edit Match"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Enter the details for the new match."
              : "Update the match information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-[#006895]">
                Match Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="border-[#8ec1b8] focus:border-[#006895]"
              />
            </div>

            {/* Team A Players */}
            <div className="space-y-2">
              <Label className="text-[#006895] font-semibold text-lg">Team A Players</Label>
              <div className="grid grid-cols-2 gap-3">
                {formData.teamAPlayers.map((player, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`teamA-${index}`} className="text-sm text-muted-foreground">
                      Player {index + 1}
                    </Label>
                    <Input
                      id={`teamA-${index}`}
                      value={player}
                      onChange={(e) => updateTeamAPlayer(index, e.target.value)}
                      placeholder={`Player ${index + 1} name`}
                      className="border-[#8ec1b8]/50 focus:border-[#006895]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Team B Players */}
            <div className="space-y-2">
              <Label className="text-[#0799ba] font-semibold text-lg">Team B Players</Label>
              <div className="grid grid-cols-2 gap-3">
                {formData.teamBPlayers.map((player, index) => (
                  <div key={index} className="space-y-1">
                    <Label htmlFor={`teamB-${index}`} className="text-sm text-muted-foreground">
                      Player {index + 1}
                    </Label>
                    <Input
                      id={`teamB-${index}`}
                      value={player}
                      onChange={(e) => updateTeamBPlayer(index, e.target.value)}
                      placeholder={`Player ${index + 1} name`}
                      className="border-[#8ec1b8]/50 focus:border-[#0799ba]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scoreA" className="text-[#006895]">
                  Team A Score
                </Label>
                <Input
                  id="scoreA"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.scoreA}
                  onChange={(e) => {
                    const score = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      scoreA: score,
                      winner: score > formData.scoreB ? "Team A" : "Team B"
                    });
                  }}
                  required
                  className="border-[#8ec1b8] focus:border-[#006895]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scoreB" className="text-[#0799ba]">
                  Team B Score
                </Label>
                <Input
                  id="scoreB"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.scoreB}
                  onChange={(e) => {
                    const score = parseInt(e.target.value);
                    setFormData({ 
                      ...formData, 
                      scoreB: score,
                      winner: score > formData.scoreA ? "Team B" : "Team A"
                    });
                  }}
                  required
                  className="border-[#8ec1b8] focus:border-[#0799ba]"
                />
              </div>
            </div>

            {/* Winner Display */}
            <div className="p-4 rounded-lg bg-[#8ec1b8]/10 border-2 border-[#8ec1b8]/30">
              <p className="text-sm text-muted-foreground mb-1">Winner</p>
              <p className="text-lg font-semibold text-[#006895]">{formData.winner}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-2 border-[#8ec1b8] text-[#006895]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#006895] hover:bg-[#005177] text-white"
            >
              {mode === "create" ? "Create Match" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
