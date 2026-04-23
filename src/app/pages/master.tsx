import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Edit2, Trash2, Plus, Home, BarChart3, Swords } from "lucide-react";

import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MatchFormDialog } from "../components/match-form-dialog";
import { DeleteMatchDialog } from "../components/delete-match-dialog";

// IMPORT FROM THE NEW GRAPHQL CONTEXT
import { useMatches } from "../contexts/graphql-context";
import { Match } from "../data/mock-data";

const tableContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function MasterPage() {
  const navigate = useNavigate();
  
  // Destructure the new Infinite Scroll variables alongside the CRUD functions
  const { matches, loadMatches, hasNextPage, isLoadingMore, createMatch, updateMatch, deleteMatch } = useMatches();
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>(undefined);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // The invisible div we watch for infinite scrolling
  const observerTarget = useRef<HTMLDivElement>(null);

  // --- INFINITE SCROLL OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          loadMatches();
        }
      },
      { threshold: 1.0, rootMargin: "100px" } 
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isLoadingMore, loadMatches]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  // --- CRUD HANDLERS ---
  const handleEdit = (id: string) => {
    const match = matches.find(m => m.id === id);
    if (match) {
      setSelectedMatch(match);
      setFormMode("edit");
      setFormDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const match = matches.find(m => m.id === id);
    if (match) {
      setSelectedMatch(match);
      setDeleteDialogOpen(true);
    }
  };

  const handleAddMatch = () => {
    setSelectedMatch(undefined);
    setFormMode("create");
    setFormDialogOpen(true);
  };

  const handleSaveMatch = (matchData: any) => {
    if (formMode === "create") {
      createMatch(matchData);
    } else if (selectedMatch) {
      updateMatch(selectedMatch.id, matchData);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedMatch) {
      deleteMatch(selectedMatch.id);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header - Slides down */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-6 scale-75 sm:scale-100 origin-left">
            <TeamBalancerLogo iconSize={60} showTagline={false} layout="horizontal" />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant="outline"
              className="border-2 border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10 whitespace-nowrap"
              onClick={() => navigate("/statistics")}
            >
              <BarChart3 className="mr-2 size-4" />
              Statistics
            </Button>
            
            <Button
              variant="outline"
              className="border-2 border-[#8ec1b8] text-[#006895] hover:bg-[#8ec1b8]/10 whitespace-nowrap"
              onClick={() => navigate("/")}
            >
              <Home className="mr-2 size-4" />
              Home
            </Button>
          </div>
        </motion.div>

        {/* Subtitle - Fades in */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-lg text-muted-foreground">
            Tournament Matches (Infinite Scroll)
          </p>
        </motion.div>

        {/* Main content card - Fades up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-2xl text-[#006895]">
                  Season Results
                </CardTitle>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-[#006895] hover:bg-[#005177] text-white transition-all duration-300 w-full sm:w-auto"
                    onClick={handleAddMatch}
                  >
                    <Plus className="mr-2 size-4" />
                    Add Match
                  </Button>
                </motion.div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-[#006895]" style={{ fontWeight: 600 }}>Date</TableHead>
                      <TableHead className="text-[#006895]" style={{ fontWeight: 600 }}>Final Score</TableHead>
                      <TableHead className="text-[#006895]" style={{ fontWeight: 600 }}>Winner</TableHead>
                      <TableHead className="text-[#006895] text-right" style={{ fontWeight: 600 }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  
                  <motion.tbody 
                    variants={tableContainer}
                    initial="hidden"
                    animate="show"
                    className="[&_tr:last-child]:border-0" 
                  >
                    <AnimatePresence>
                      {matches.length === 0 && !isLoadingMore ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No matches found in this tournament.
                          </TableCell>
                        </TableRow>
                      ) : (
                        matches.map((match, index) => (
                          <motion.tr 
                            key={match.id}
                            variants={tableRowVariants}
                            exit={{ opacity: 0, x: 20 }}
                            className="hover:bg-[#0799ba]/5 border-b transition-colors duration-200"
                            style={{
                              backgroundColor: index % 2 === 0 ? "transparent" : "rgba(142, 193, 184, 0.03)"
                            }}
                          >
                            <TableCell className="py-4">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <div className="size-2 rounded-full bg-[#1fa5b0]" />
                                <span>{formatDate(match.date)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-3">
                                <span className={match.winner === "Team A" ? "font-semibold text-[#006895]" : ""}>
                                  Team A: {match.scoreA}
                                </span>
                                <span className="text-muted-foreground">vs</span>
                                <span className={match.winner === "Team B" ? "font-semibold text-[#006895]" : ""}>
                                  Team B: {match.scoreB}
                                </span>
                              </span>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#8ec1b8]/20 text-[#006895]" style={{ fontWeight: 500 }}>
                                {match.winner}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#0799ba] hover:text-[#006895] hover:bg-[#0799ba]/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(match.id);
                                  }}
                                >
                                  <Edit2 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(match.id);
                                  }}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </motion.tbody>
                </Table>
              </div>

              {/* INFINITE SCROLL LOADER / FOOTER */}
              <div 
                ref={observerTarget} 
                className="w-full flex flex-col items-center justify-center py-6 bg-muted/10 border-t border-border min-h-[80px]"
              >
                {isLoadingMore && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-[#006895] font-medium"
                  >
                    <div className="size-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <span>Loading more matches...</span>
                  </motion.div>
                )}
                
                {!hasNextPage && matches.length > 0 && (
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-muted-foreground text-sm flex items-center gap-2"
                  >
                    <Swords className="size-4" />
                    End of tournament records.
                  </motion.p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CRUD Dialogs */}
        <MatchFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          match={selectedMatch}
          mode={formMode}
          onSave={handleSaveMatch}
        />

        <DeleteMatchDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          matchId={selectedMatch?.id || ""}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}