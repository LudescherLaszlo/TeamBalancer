import { VolleyballLogo } from "./volleyball-logo";

interface TeamBalancerLogoProps {
  iconSize?: number;
  showTagline?: boolean;
  layout?: "horizontal" | "vertical";
}

export function TeamBalancerLogo({ 
  iconSize = 120, 
  showTagline = true,
  layout = "horizontal" 
}: TeamBalancerLogoProps) {
  
  if (layout === "vertical") {
    return (
      <div className="flex flex-col items-center gap-6">
        <VolleyballLogo size={iconSize} />
        <div className="text-center">
          <h1 
            className="text-6xl tracking-tight text-[#006895]" 
            style={{ 
              fontWeight: 700,
              fontFamily: "'Poppins', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
          >
            TeamBalancer
          </h1>
          {showTagline && (
            <p className="text-xl mt-2 text-[#0799ba]" style={{ fontWeight: 500 }}>
              Fair games, better rallies.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className="flex items-center gap-6">
      <VolleyballLogo size={iconSize} />
      <div>
        <h1 
          className="text-5xl tracking-tight text-[#006895]" 
          style={{ 
            fontWeight: 700,
            fontFamily: "'Poppins', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
            letterSpacing: '-0.02em'
          }}
        >
          TeamBalancer
        </h1>
        {showTagline && (
          <p className="text-lg mt-1 text-[#0799ba]" style={{ fontWeight: 500 }}>
            Fair games, better rallies.
          </p>
        )}
      </div>
    </div>
  );
}
