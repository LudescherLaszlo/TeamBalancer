export function VolleyballLogo({ size = 80 }: { size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'rotate(15deg)' }}
    >
      {/* Base circle for reference - invisible */}
      <circle cx="50" cy="50" r="48" fill="none"/>
      
      {/* Top Swash - Deep Sea #006895 */}
      <path 
        d="M 50 2 
           C 75 2, 98 25, 98 50
           C 98 55, 97 60, 95 65
           C 80 58, 65 55, 50 55
           C 35 55, 20 58, 5 65
           C 3 60, 2 55, 2 50
           C 2 25, 25 2, 50 2 Z"
        fill="#006895"
      />
      
      {/* Middle Swash - Ocean Wave #0799ba */}
      <path 
        d="M 8 68
           C 12 64, 18 60, 25 58
           C 35 55, 42 54, 50 54
           C 58 54, 65 55, 75 58
           C 82 60, 88 64, 92 68
           C 88 82, 78 92, 65 96
           C 60 95, 55 93, 50 93
           C 45 93, 40 95, 35 96
           C 22 92, 12 82, 8 68 Z"
        fill="#0799ba"
      />
      
      {/* Bottom Swash - Teal #1fa5b0 */}
      <path 
        d="M 35 96
           C 40 95, 45 93, 50 93
           C 55 93, 60 95, 65 96
           C 60 98, 55 99, 50 99
           C 45 99, 40 98, 35 96 Z
           M 25 58
           C 18 60, 12 64, 8 68
           C 5 62, 3 56, 3 50
           C 3 45, 4 40, 6 35
           C 10 42, 16 50, 25 58 Z
           M 75 58
           C 82 60, 88 64, 92 68
           C 95 62, 97 56, 97 50
           C 97 45, 96 40, 94 35
           C 90 42, 84 50, 75 58 Z"
        fill="#1fa5b0"
      />
    </svg>
  );
}