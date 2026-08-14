export default function HealthAidLogo({
  size = 48,
  animated = false,
}: {
  size?: number;
  animated?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={animated ? "healthaid-logo-animated" : undefined}
    >
      <rect width="48" height="48" rx="14" fill="#1FB387" />
      <path
        d="M24 34C24 34 12 26 12 18.5C12 14.5 15 12 18 12C20.5 12 22.5 13.5 24 16C25.5 13.5 27.5 12 30 12C33 12 36 14.5 36 18.5C36 26 24 34 24 34Z"
        fill="white"
        className={animated ? "healthaid-heart" : undefined}
      />
      <rect x="22" y="16" width="4" height="12" rx="1" fill="#1FB387" />
      <rect x="18" y="20" width="12" height="4" rx="1" fill="#1FB387" />
    </svg>
  );
}
