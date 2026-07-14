export default function HallmarkMark({ className = "" }) {
  return (
    <span
      aria-label="Hallmark Residences"
      role="img"
      className={`inline-flex size-11 items-center justify-center rounded-2xl bg-hallmark text-white shadow-[0_8px_18px_rgba(128,12,24,0.24)] ${className}`}
    >
      <svg
        aria-hidden="true"
        className="h-[55%] w-[55%]"
        fill="none"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="12.2" stroke="currentColor" strokeWidth="1.35" />
        <path
          d="M9.8 23V9M9.8 16h6.8M16.6 9v14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <path
          d="M16.6 23V9h3.8c2.55 0 4.1 1.35 4.1 3.5 0 2.2-1.55 3.5-4.1 3.5h-3.8M20.1 16l4.45 7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
    </span>
  );
}
