export default function DashboardIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* plant */}
      <g transform="translate(10,90)">
        <path d="M20 60 Q4 30 20 0 Q36 30 20 60 Z" fill="#22c55e" opacity="0.85" />
        <path d="M20 60 Q30 24 44 6" fill="none" stroke="#16a34a" strokeWidth="6" strokeLinecap="round" />
        <rect x="4" y="58" width="32" height="26" rx="4" fill="#f97316" />
        <rect x="4" y="58" width="32" height="8" rx="4" fill="#fb923c" />
      </g>

      {/* book stack */}
      <g transform="translate(60,120)">
        <rect x="0" y="20" width="90" height="14" rx="3" fill="#4f46e5" />
        <rect x="6" y="6" width="78" height="14" rx="3" fill="#2563eb" />
        <rect x="0" y="-8" width="90" height="14" rx="3" fill="#60a5fa" />
      </g>

      {/* laptop */}
      <g transform="translate(150,40)">
        <rect x="0" y="0" width="150" height="96" rx="10" fill="#1e293b" />
        <rect x="8" y="8" width="134" height="80" rx="4" fill="#3b82f6" opacity="0.25" />
        <rect x="20" y="24" width="90" height="8" rx="4" fill="#93c5fd" />
        <rect x="20" y="40" width="60" height="8" rx="4" fill="#93c5fd" opacity="0.7" />
        <path d="M-10 96 L160 96 L172 116 L-22 116 Z" fill="#334155" />

        {/* graduation cap on top corner */}
        <g transform="translate(96,-34)">
          <rect x="6" y="14" width="26" height="16" rx="2" fill="#1e293b" />
          <path d="M19 0 L44 14 L19 28 L-6 14 Z" fill="#1e293b" />
          <line x1="38" y1="16" x2="38" y2="34" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="38" cy="36" r="3" fill="#f59e0b" />
        </g>
      </g>

      {/* mug */}
      <g transform="translate(250,130)">
        <path d="M2 -10 Q6 -18 2 -26" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <path d="M14 -10 Q18 -20 14 -30" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <rect x="0" y="0" width="40" height="32" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
        <path d="M40 6 h8 a10 10 0 0 1 0 20 h-8 Z" fill="none" stroke="#e2e8f0" strokeWidth="3" />
      </g>
    </svg>
  );
}
