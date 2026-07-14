const statusStyles = {
  reserved: "border-emerald-100 bg-emerald-50 text-emerald-700",
  staying: "border-blue-100 bg-blue-50 text-blue-700",
  "checking out": "border-amber-100 bg-amber-50 text-amber-700",
  "checked out": "border-slate-200 bg-slate-100 text-slate-600",
};

function getStatusKey(status) {
  return String(status || "").trim().toLowerCase();
}

/**
 * Compact, consistent presentation for a guest's current stay status.
 */
export default function GuestStatusBadge({ status, className = "" }) {
  const label = status || "Unknown";
  const tone = statusStyles[getStatusKey(status)] || "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${tone} ${className}`}
    >
      {label}
    </span>
  );
}
