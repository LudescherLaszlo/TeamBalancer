import { useState } from "react";
import { useNavigate } from "react-router";
import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useMatches } from "../contexts/match-context";
import { Match } from "../data/mock-data";
import { MatchFormDialog } from "../components/match-form-dialog";
import { DeleteMatchDialog } from "../components/delete-match-dialog";
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight, Home, BarChart3 } from "lucide-react";
import { motion, AnimatePresence,Variants } from "framer-motion";

const ITEMS_PER_PAGE = 5;

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
  const { matches, createMatch, updateMatch, deleteMatch } = useMatches();
  const [currentPage, setCurrentPage] = useState(1);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>(undefined);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  const totalPages = Math.ceil(matches.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMatches = matches.slice(startIndex, endIndex);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

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

        {/* Subtitle - Restored and animated! */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <p className="text-lg text-muted-foreground">
            Track and manage your volleyball matches
          </p>
        </motion.div>

        {/* Main content card - Fades up */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="border-b border-border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-2xl text-[#006895]">
                  Recent Matches
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
                      {currentMatches.map((match, index) => (
                        <motion.tr 
                          key={match.id}
                          variants={tableRowVariants}
                          exit={{ opacity: 0, x: 20 }}
                          className="cursor-pointer hover:bg-[#0799ba]/5 border-b transition-colors duration-200"
                          onClick={() => navigate(`/matches/${match.id}`)}
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
                      ))}
                    </AnimatePresence>
                  </motion.tbody> {/* ✅ Don't forget to close it with motion.tbody! */}
                </Table>
              </div>

              {/* Pagination controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-border bg-muted/30 gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing {startIndex + 1}-{Math.min(endIndex, matches.length)} of {matches.length} matches
                </p>
                
                <div className="flex flex-wrap justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="size-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "bg-[#006895] text-white hover:bg-[#005177]"
                            : "border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10"
                        }
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10 disabled:opacity-50"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialogs remain untouched */}
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