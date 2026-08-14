export default function PregnantWomanIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="170" rx="60" ry="8" fill="#DDE4EA" />
      <path d="M100 35C85 35 72 48 72 63C72 78 85 88 100 88C115 88 128 78 128 63C128 48 115 35 100 35Z" fill="#F5CBA0" />
      <path d="M78 45C74 32 88 22 100 24C112 26 124 32 120 45" fill="#4A3728" />
      <path d="M75 88 L125 88 L130 130 L70 130 Z" fill="#1FB387" />
      <ellipse cx="100" cy="115" rx="30" ry="25" fill="#179A73" />
      <path d="M70 130 L55 165 L75 165 L80 130 Z" fill="#1FB387" />
      <path d="M130 130 L145 165 L125 165 L120 130 Z" fill="#1FB387" />
      <path d="M55 100 L70 105 L65 130 L50 125 Z" fill="#F5CBA0" />
      <path d="M145 100 L130 105 L135 130 L150 125 Z" fill="#F5CBA0" />
    </svg>
  );
}
