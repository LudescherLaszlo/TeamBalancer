import { useLocation, useOutlet } from "react-router";
import { MatchProvider } from "../contexts/match-context";
import { useActivityTracker } from "../hooks/useActivityTracker";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { OfflineBanner } from "../components/offline-banner";

const bubbleVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 100,      // Reduced from 200 for a smoother, premium entry
    scale: 0.9,  // Start slightly smaller instead of halving the size
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      type: "spring", 
      mass: 0.8, 
      stiffness: 250, 
      damping: 15     
    } 
  },
  exit: { 
    opacity: 0, 
    transition: { 
      ease: "easeOut", 
      duration: 0.15 
    } 
  }
};

export default function RootLayout() {
  useActivityTracker();
  const location = useLocation();
  
  // MAGIC FIX: This hook creates a frozen snapshot of the current route's UI
  // so Framer Motion can cleanly animate it away without it flashing to the new page!
  const currentOutlet = useOutlet();

  return (
    <MatchProvider>
      <div className="min-h-screen w-full flex flex-col bg-background overflow-hidden">
        
        {/* Offline Banner sits at the absolute top, outside page transitions */}
        <OfflineBanner />

        {/* mode="wait" ensures the old page fades out completely before the new one bounces in */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={bubbleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 origin-bottom" 
          >
            {/* Replaced <Outlet /> with the frozen hook value */}
            {currentOutlet}
          </motion.div>
        </AnimatePresence>
      </div>
    </MatchProvider>
  );
}