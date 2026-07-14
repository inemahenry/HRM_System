import { FaCheck, FaDoorOpen, FaReceipt } from "react-icons/fa";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import GuestStatusBadge from "../components/GuestStatusBadge";
import PageHeader from "../components/PageHeader";
import PaymentBadge from "../components/PaymentBadge";
import { useGuests } from "../hooks/useGuests";

const toLocalDateKey = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount) || 0);

export default function CheckOuts() {
  const { guests, updateGuest } = useGuests();
  const today = toLocalDateKey();
  const dueToday = guests.filter(
    (guest) => guest.checkOutDate === today && guest.stayStatus !== "Checked Out",
  );

  return (
    <AppLayout title="Check-outs Today" eyebrow="GUEST MANAGEMENT">
      <PageHeader
        eyebrow="Departure desk"
        title="Today&apos;s check-outs"
        description="Review balances and complete departures. Completing a check-out immediately releases the villa for the next stay."
        actions={(
          <Link
            to="/guests"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-gray-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
          >
            View all guests
          </Link>
        )}
      />

      <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Departure queue</h2>
            <p className="mt-1 text-sm text-muted">{dueToday.length} guest{dueToday.length === 1 ? "" : "s"} due to depart today.</p>
          </div>
          <div className="hallmark-scrollbar overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#800C18]/[0.035] text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Villa</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Stay status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {dueToday.map((guest) => (
                  <tr key={guest.id} className="transition hover:bg-[#800C18]/[0.035]">
                    <td className="px-6 py-4"><p className="font-semibold text-ink">{guest.name}</p><p className="mt-0.5 text-xs text-muted">{guest.phone}</p></td>
                    <td className="px-6 py-4 font-medium text-ink">{guest.villaNumber}</td>
                    <td className={`px-6 py-4 font-semibold ${guest.remainingBalance > 0 ? "text-negative" : "text-positive"}`}>{formatCurrency(guest.remainingBalance)}</td>
                    <td className="px-6 py-4"><PaymentBadge status={guest.paymentStatus} /></td>
                    <td className="px-6 py-4"><GuestStatusBadge status={guest.stayStatus} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => updateGuest(guest.id, { stayStatus: "Checked Out" })}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-hallmark px-3 text-xs font-semibold text-white transition hover:bg-hallmark-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
                      >
                        <FaCheck aria-hidden="true" />
                        Complete check-out
                      </button>
                    </td>
                  </tr>
                ))}
                {!dueToday.length && (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <FaDoorOpen aria-hidden="true" className="mx-auto text-3xl text-slate-300" />
                      <p className="mt-3 font-semibold text-ink">No check-outs remaining today</p>
                      <p className="mt-1 text-sm text-muted">The departure desk is clear.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#800C18]/10 text-hallmark"><FaReceipt aria-hidden="true" className="text-xl" /></span>
          <h2 className="mt-5 text-lg font-semibold text-ink">Departure reminder</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Confirm payment, return keys, and inspect the villa before completing each departure.</p>
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Outstanding today</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{formatCurrency(dueToday.reduce((sum, guest) => sum + (Number(guest.remainingBalance) || 0), 0))}</p>
          </div>
        </aside>
      </section>
    </AppLayout>
  );
}
