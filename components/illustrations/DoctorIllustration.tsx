export default function DoctorIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="140" cy="300" rx="90" ry="12" fill="#E8EDF2" />
      <rect x="70" y="200" width="140" height="90" rx="8" fill="#4A90D9" />
      <rect x="85" y="215" width="110" height="60" rx="4" fill="white" opacity="0.3" />
      <path d="M140 90C115 90 95 110 95 135C95 160 115 175 140 175C165 175 185 160 185 135C185 110 165 90 140 90Z" fill="#F5CBA0" />
      <path d="M110 100C105 85 120 70 140 72C160 74 175 85 170 100C165 95 150 88 140 88C130 88 115 95 110 100Z" fill="#4A3728" />
      <circle cx="125" cy="130" r="4" fill="#2D3436" />
      <circle cx="155" cy="130" r="4" fill="#2D3436" />
      <path d="M130 145 Q140 152 150 145" stroke="#2D3436" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="115" y="155" width="50" height="8" rx="4" fill="#E8EDF2" />
      <circle cx="140" cy="159" r="3" fill="#1FB387" />
      <path d="M100 175 L180 175 L185 200 L95 200 Z" fill="#1FB387" />
      <path d="M85 200 L195 200 L200 290 L80 290 Z" fill="#1FB387" />
      <path d="M60 210 L85 210 L80 260 L55 260 Z" fill="#F5CBA0" />
      <path d="M195 210 L220 210 L225 260 L200 260 Z" fill="#F5CBA0" />
      <path d="M120 175 Q140 195 160 175" stroke="#179A73" strokeWidth="3" fill="none" />
      <circle cx="140" cy="185" r="6" fill="#E8EDF2" stroke="#179A73" strokeWidth="2" />
      <path d="M130 185 L140 195 L155 175" stroke="#179A73" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
