import { useNavigate } from "react-router";
import { TeamBalancerLogo } from "../components/team-balancer-logo";
import { Button } from "../components/ui/button";
import { motion, Variants } from "framer-motion";

// Animation Variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};



export default function PresentationPage() {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-8 py-16"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Logo */}
      <motion.div variants={item} className="mb-12 scale-75 sm:scale-100">
        <TeamBalancerLogo iconSize={140} showTagline={false} layout="vertical" />
      </motion.div>

      {/* Tagline */}
      <motion.p 
        variants={item}
        className="text-xl sm:text-2xl mb-8 text-[#0799ba] text-center" 
        style={{ fontWeight: 500 }}
      >
        Fair games, better rallies.
      </motion.p>

      {/* Body copy */}
      <motion.div variants={item} className="max-w-2xl text-center mb-12 space-y-4 px-2">
        <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
          TeamBalancer is your intelligent volleyball match-balancing assistant. By analyzing 
          match results and player performance, our application creates perfectly balanced 
          teams for fair and competitive gameplay.
        </p>
        
        <p className="text-sm sm:text-base leading-relaxed text-foreground/80">
          Track your games, monitor player statistics, and ensure every match is exciting 
          and evenly matched. Whether you're organizing beach volleyball tournaments or 
          casual weekend games, TeamBalancer takes the guesswork out of team formation.
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
          <Button 
            size="lg"
            className="bg-[#006895] hover:bg-[#005177] text-white px-8 py-6 text-lg transition-colors duration-300 w-full"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-[#0799ba] text-[#0799ba] hover:bg-[#0799ba]/10 px-8 py-6 text-lg transition-colors duration-300 w-full"
            onClick={() => navigate("/matches")}
          >
            View Matches
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-[#1fa5b0] text-[#1fa5b0] hover:bg-[#1fa5b0]/10 px-8 py-6 text-lg transition-colors duration-300 w-full"
            onClick={() => navigate("/statistics")}
          >
            View Statistics
          </Button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div variants={item} className="mt-16 text-sm text-muted-foreground text-center">
        <p>Powered by intelligent match analytics</p>
      </motion.div>
    </motion.div>
  );
}