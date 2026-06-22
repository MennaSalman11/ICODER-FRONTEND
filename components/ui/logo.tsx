export const Logo = ({ dark = false, scale = 1 }: { dark?: boolean; scale?: number }) => {
  const color = dark ? "#ffffff" : "#1B3F7A";
  return (
    <svg 
      viewBox="0 0 180 60" 
      width={180 * scale} 
      height={60 * scale} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(18, 8)">
        <line x1="10" y1="6" x2="10" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="4" y1="6" x2="16" y2="6" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="4" y1="38" x2="16" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="10" cy="2" r="3.5" fill="#E87722"/>
        <circle cx="10" cy="14" r="2" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="12" y1="14" x2="17" y2="14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="18" cy="14" r="1.5" fill={color}/>
        <circle cx="10" cy="26" r="2" fill="none" stroke={color} strokeWidth="1.5"/>
        <line x1="4" y1="26" x2="0" y2="26" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="-1" cy="32" r="1.5" fill={color}/>
        <line x1="4" y1="32" x2="0" y2="32" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      <text x="48" y="38" fontFamily="'Segoe UI', system-ui, sans-serif" fontSize="26" fontWeight="700" fill={color} letterSpacing="-0.5">Coder</text>
    </svg>
  );
};