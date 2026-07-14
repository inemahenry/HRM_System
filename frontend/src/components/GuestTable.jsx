import { FaEdit, FaEye, FaTrash, FaUsers } from "react-icons/fa";
import GuestStatusBadge from "./GuestStatusBadge";
import PaymentBadge from "./PaymentBadge";

function getGuestName(guest) {
  return guest?.name || guest?.fullName || guest?.guestName || "Unnamed guest";
}

function getVillaNumber(guest) {
  return guest?.villaNumber || guest?.villa?.number || guest?.villa || "—";
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
 * A desktop-first guest data table. Pass an already-filtered `guests` list and
 * action callbacks; the component never changes guest data itself.
 */
export default function GuestTable({
  guests = [],
  onView,
  onEdit,
  onDelete,
  className = "",
  emptyMessage = "No guests match the current view.",
  isLoading = false,
  ariaLabel = "Guests",
}) {
  const rows = Array.isArray(guests) ? guests : [];

  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)] ${className}`}>
      <div className="hallmark-scrollbar max-h-[min(62vh,680px)] overflow-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm" aria-label={ariaLabel}>
          <caption className="sr-only">{ariaLabel}</caption>
          <thead className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 shadow-[0_1px_0_#E5E7EB]">Guest name</th>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 shadow-[0_1px_0_#E5E7EB]">Phone</th>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 shadow-[0_1px_0_#E5E7EB]">Villa</th>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 shadow-[0_1px_0_#E5E7EB]">Nationality</th>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 shadow-[0_1px_0_#E5E7EB]">Check-in</th>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 shadow-[0_1px_0_#E5E7EB]">Check-out</th>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 shadow-[0_1px_0_#E5E7EB]">Status</th>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 shadow-[0_1px_0_#E5E7EB]">Payment</th>
              <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-5 py-4 text-right shadow-[0_1px_0_#E5E7EB]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {isLoading && (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center text-sm text-muted">Loading guests...</td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan="9" className="px-6 py-14 text-center">
                  <FaUsers aria-hidden="true" className="mx-auto text-3xl text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-ink">No guest records found</p>
                  <p className="mt-1 text-sm text-muted">{emptyMessage}</p>
                </td>
              </tr>
            )}
            {!isLoading && rows.map((guest, index) => {
              const name = getGuestName(guest);
              const stayStatus = guest?.stayStatus || guest?.status;
              const paymentStatus = guest?.paymentStatus || guest?.payment;
              const key = guest?.id || `${name}-${guest?.phone || index}`;

              return (
                <tr key={key} className="group bg-white transition duration-150 hover:bg-[#800C18]/[0.035] even:bg-slate-50/55">
                  <td className="px-5 py-4">
                    <div className="flex min-w-[190px] items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#800C18]/10 text-xs font-semibold text-hallmark">
                        {name === "Unnamed guest" ? <FaUsers aria-hidden="true" /> : getInitials(name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{name}</p>
                        {guest?.email && <p className="mt-0.5 truncate text-xs text-muted">{guest.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">{guest?.phone || guest?.phoneNumber || "—"}</td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-ink">{getVillaNumber(guest)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">{guest?.nationality || "—"}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">{formatDate(guest?.checkInDate || guest?.checkIn)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">{formatDate(guest?.checkOutDate || guest?.checkOut)}</td>
                  <td className="whitespace-nowrap px-5 py-4">{stayStatus ? <GuestStatusBadge status={stayStatus} /> : <span className="text-muted">—</span>}</td>
                  <td className="whitespace-nowrap px-5 py-4">{paymentStatus ? <PaymentBadge status={paymentStatus} /> : <span className="text-muted">—</span>}</td>
                  <td className="px-5 py-4">
                    <div className="flex min-w-[176px] justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onView?.(guest)}
                        disabled={!onView}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-hallmark transition hover:bg-[#800C18]/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`View ${name}`}
                      >
                        <FaEye aria-hidden="true" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit?.(guest)}
                        disabled={!onEdit}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Edit ${name}`}
                      >
                        <FaEdit aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(guest)}
                        disabled={!onDelete}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-negative transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-negative focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Delete ${name}`}
                      >
                        <FaTrash aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
