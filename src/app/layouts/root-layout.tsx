import { Outlet, useLocation } from "react-router";
import { MatchProvider } from "../contexts/match-context";
import { useActivityTracker } from "../hooks/useActivityTracker";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { OfflineBanner } from "../components/offline-banner"; // <-- Added import

const bubbleVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 200, 
    scale: 0.5, 
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
    y: -100, 
    scale: 1.1, 
    transition: { 
      ease: "easeIn", 
      duration: 0.2 
    } 
  }
};

export default function RootLayout() {
  useActivityTracker();
  const location = useLocation();

  return (
    <MatchProvider>
      <div className="min-h-screen w-full flex flex-col bg-background overflow-hidden">
        
        {/* Offline Banner sits at the absolute top, outside page transitions */}
        <OfflineBanner />

        {/* mode="wait" is CRITICAL for Playwright tests to pass */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={bubbleVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 origin-bottom" // Changed to flex-1 to flow under the banner
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </MatchProvider>
  );
}