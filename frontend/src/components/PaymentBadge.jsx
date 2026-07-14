const paymentStyles = {
  paid: "border-emerald-100 bg-emerald-50 text-emerald-700",
  partial: "border-amber-100 bg-amber-50 text-amber-700",
  unpaid: "border-red-100 bg-red-50 text-red-700",
};

function getPaymentKey(status) {
  return String(status || "").trim().toLowerCase();
}

/**
 * Compact, consistent presentation for a guest's payment status.
 */
export default function PaymentBadge({ status, className = "" }) {
  const label = status || "Unknown";
  const tone = paymentStyles[getPaymentKey(status)] || "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${tone} ${className}`}
    >
      {label}
    </span>
  );
}
