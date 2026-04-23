import { WifiOff } from "lucide-react";
import { useMatches } from "../contexts/match-context";

export function OfflineBanner() {
  // Grab the isOffline state we just exposed from your context
  const { isOffline } = useMatches();

  // If the user is online, don't render anything!
  if (!isOffline) return null;

  return (
    <div className="bg-[#ff6b6b] text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm sm:text-base font-medium shadow-md relative z-50 transition-all duration-300">
      <WifiOff className="size-5 animate-pulse" />
      <span>
        You are offline. Changes are saved locally and will sync automatically when your connection returns.
      </span>
    </div>
  );
}