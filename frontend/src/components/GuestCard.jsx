import {
  FaBed,
  FaCalendarAlt,
  FaEdit,
  FaEye,
  FaPhoneAlt,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import GuestStatusBadge from "./GuestStatusBadge";
import PaymentBadge from "./PaymentBadge";

function getGuestName(guest) {
  return guest?.name || guest?.fullName || guest?.guestName || "Unnamed guest";
}

function getVillaNumber(guest) {
  return guest?.villaNumber || guest?.villa?.number || guest?.villa || "Unassigned";
}

function formatDate(value) {
  if (!value) return "—";

  const stringValue = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(stringValue)
    ? new Date(`${stringValue}T00:00:00`)
    : new Date(stringValue);

  if (Number.isNaN(date.getTime())) return stringValue;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * Guest summary card for responsive or alternate list views.
 */
export default function GuestCard({
  guest,
  onView,
  onEdit,
  onDelete,
  className = "",
}) {
  const name = getGuestName(guest);
  const villaNumber = getVillaNumber(guest);
  const stayStatus = guest?.stayStatus || guest?.status;
  const paymentStatus = guest?.paymentStatus || guest?.payment;

  return (
    <article className={`group rounded-2xl border border-line bg-surface p-5 shadow-[0_8px_30px_rgba(31,41,55,0.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(128,12,24,0.10)] ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#800C18]/10 text-sm font-semibold text-hallmark">
            {name === "Unnamed guest" ? <FaUser aria-hidden="true" /> : getInitials(name)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-ink">{name}</h3>
            <p className="mt-0.5 truncate text-sm text-muted">{guest?.email || guest?.nationality || "Guest profile"}</p>
          </div>
        </div>
        {stayStatus && <GuestStatusBadge status={stayStatus} />}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line py-4 text-sm">
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted"><FaPhoneAlt aria-hidden="true" /> Phone</dt>
          <dd className="mt-1 truncate font-medium text-ink">{guest?.phone || guest?.phoneNumber || "—"}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted"><FaBed aria-hidden="true" /> Villa</dt>
          <dd className="mt-1 truncate font-medium text-ink">{villaNumber}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted"><FaCalendarAlt aria-hidden="true" /> Check-in</dt>
          <dd className="mt-1 truncate font-medium text-ink">{formatDate(guest?.checkInDate || guest?.checkIn)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs font-medium text-muted"><FaCalendarAlt aria-hidden="true" /> Check-out</dt>
          <dd className="mt-1 truncate font-medium text-ink">{formatDate(guest?.checkOutDate || guest?.checkOut)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">Payment</p>
          <div className="mt-1.5">{paymentStatus ? <PaymentBadge status={paymentStatus} /> : <span className="text-sm text-muted">—</span>}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onView?.(guest)}
            disabled={!onView}
            className="flex size-9 items-center justify-center rounded-xl text-hallmark transition hover:bg-[#800C18]/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`View ${name}`}
            title="View guest"
          >
            <FaEye aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(guest)}
            disabled={!onEdit}
            className="flex size-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Edit ${name}`}
            title="Edit guest"
          >
            <FaEdit aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(guest)}
            disabled={!onDelete}
            className="flex size-9 items-center justify-center rounded-xl text-negative transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-negative focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Delete ${name}`}
            title="Delete guest"
          >
            <FaTrash aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
