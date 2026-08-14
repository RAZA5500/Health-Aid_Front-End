export default function TelemedicineDoctor({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="160" width="260" height="60" rx="8" fill="#E8EDF2" />
      <rect x="40" y="130" width="80" height="50" rx="6" fill="#4A90D9" />
      <rect x="180" y="140" width="60" height="40" rx="4" fill="#1FB387" opacity="0.3" />
      <ellipse cx="150" cy="220" rx="100" ry="10" fill="#DDE4EA" />
      <path d="M150 50C125 50 105 70 105 95C105 120 125 135 150 135C175 135 195 120 195 95C195 70 175 50 150 50Z" fill="#F5CBA0" />
      <path d="M120 60C115 45 130 30 150 32C170 34 185 45 180 60C175 55 160 48 150 48C140 48 125 55 120 60Z" fill="#6B4423" />
      <circle cx="135" cy="88" r="4" fill="#2D3436" />
      <circle cx="165" cy="88" r="4" fill="#2D3436" />
      <path d="M138 102 Q150 110 162 102" stroke="#2D3436" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M110 135 L190 135 L195 175 L105 175 Z" fill="#E91E8C" />
      <path d="M95 175 L205 175 L210 210 L90 210 Z" fill="#E91E8C" />
      <path d="M75 140 L95 140 L90 175 L70 175 Z" fill="#F5CBA0" transform="rotate(-20 82 157)" />
      <path d="M205 140 L225 140 L230 175 L210 175 Z" fill="#F5CBA0" />
      <path d="M210 150 L240 130 L245 145 L220 165 Z" fill="#F5CBA0" />
      <path d="M130 135 Q150 155 170 135" stroke="#C2185B" strokeWidth="3" fill="none" />
      <circle cx="150" cy="148" r="5" fill="white" stroke="#C2185B" strokeWidth="2" />
    </svg>
  );
}
