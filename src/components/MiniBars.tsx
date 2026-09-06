export default function MiniBars({ className = "" }: { className?: string }) {
  const heights = [6, 10, 14, 18];
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" className={className} aria-hidden>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 7}
          y={20 - h}
          width={4}
          height={h}
          rx={1.5}
          fill="currentColor"
          opacity={0.5 + i * 0.15}
        />
      ))}
    </svg>
  );
}
