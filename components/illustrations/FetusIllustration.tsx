export default function FetusIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="58" fill="#FFE8E0" />
      <circle cx="60" cy="60" r="50" fill="#FFD4C8" />
      <ellipse cx="55" cy="58" rx="28" ry="32" fill="#F5CBA0" />
      <ellipse cx="48" cy="52" rx="18" ry="20" fill="#FAD7A0" />
      <circle cx="42" cy="48" r="3" fill="#2D3436" opacity="0.6" />
      <path d="M35 65 Q30 75 28 85" stroke="#F5CBA0" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M75 55 Q85 50 90 42" stroke="#F5CBA0" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M70 70 Q80 78 82 88" stroke="#F5CBA0" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="55" cy="72" rx="14" ry="10" fill="#FAD7A0" />
    </svg>
  );
}
