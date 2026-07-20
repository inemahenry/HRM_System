import { FaBell, FaHome, FaMoneyCheckAlt, FaPlus, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useGuests } from "../hooks/useGuests";

const cards = (summary) => [
  ["Occupied villas", summary.occupiedVillas],
  ["Vacant villas", summary.vacantVillas],
  ["Booked villas", summary.bookedVillas],
  ["Rent payments due", summary.rentPaymentsDue],
  ["Cleaning payments due", summary.cleaningPaymentsDue],
  ["Check-outs today", summary.guestsCheckingOutToday],
  ["Check-outs this week", summary.guestsCheckingOutThisWeek],
  ["Action required", summary.actionRequired],
];

export default function Dashboard() {
  const { dashboardSummary, isLoading } = useGuests();
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <AppLayout title="Home" eyebrow="RECEPTION">
      <div className="space-y-7">
        <section className="flex flex-col gap-4 rounded-[28px] border border-line bg-white p-7 shadow-[0_18px_44px_rgba(31,41,55,0.06)] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-hallmark">Hallmark Residences</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Home</h2>
            <p className="mt-2 text-sm text-muted">{today}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/guests/new" className="inline-flex items-center gap-2 rounded-xl bg-hallmark px-4 py-3 text-sm font-semibold text-white">
              <FaPlus /> Check in guest
            </Link>
            <Link to="/payments" className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink">
              <FaMoneyCheckAlt /> Record payment
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards(dashboardSummary).map(([label, value]) => (
            <article key={label} className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_30px_rgba(31,41,55,0.045)]">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{isLoading ? "–" : value || 0}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] border border-line bg-white p-7 shadow-[0_18px_44px_rgba(31,41,55,0.06)]">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-hallmark/10 text-hallmark"><FaBell /></span>
            <div>
              <h3 className="text-xl font-semibold text-ink">Action required</h3>
              <p className="text-sm text-muted">These reminders remain visible until the payment is recorded or the guest checks out.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {dashboardSummary.reminders?.length ? dashboardSummary.reminders.map((reminder) => (
              <article key={reminder.id} className={`rounded-2xl border px-4 py-4 ${reminder.overdue ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{reminder.title}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">Due {reminder.dueDate}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{reminder.message}</p>
              </article>
            )) : (
              <div className="rounded-2xl border border-dashed border-line bg-canvas px-4 py-8 text-center text-sm text-muted">No action is required today.</div>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link to="/villas" className="flex items-center gap-3 rounded-2xl border border-line bg-white p-5 text-ink shadow-sm transition hover:border-hallmark/30">
            <FaHome className="text-hallmark" />
            <span><span className="block font-semibold">Villas</span><span className="text-sm text-muted">View the current rentable villa register.</span></span>
          </Link>
          <Link to="/guests/checkouts" className="flex items-center gap-3 rounded-2xl border border-line bg-white p-5 text-ink shadow-sm transition hover:border-hallmark/30">
            <FaSignOutAlt className="text-hallmark" />
            <span><span className="block font-semibold">Check-outs</span><span className="text-sm text-muted">Complete scheduled guest departures.</span></span>
          </Link>
        </section>
      </div>
    </AppLayout>
  );
}
