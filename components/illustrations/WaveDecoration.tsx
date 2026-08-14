export default function WaveDecoration({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path
        d="M0 40 Q50 20 100 40 T200 40 T300 40 T400 40 V80 H0 Z"
        fill="#1FB387"
        opacity="0.08"
      />
      <path
        d="M0 50 Q50 35 100 50 T200 50 T300 50 T400 50"
        stroke="#1FB387"
        strokeWidth="2"
        fill="none"
        opacity="0.25"
      />
      <path
        d="M0 55 Q80 45 160 55 T320 55 T400 55"
        stroke="#4A90D9"
        strokeWidth="1.5"
        fill="none"
        opacity="0.2"
      />
    </svg>
  );
}
