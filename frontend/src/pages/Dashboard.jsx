import { FaHome, FaMoneyCheckAlt, FaPlus, FaSearch, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";
import { useGuests } from "../hooks/useGuests";

const quickActions = [
  { title: "New Guest", icon: FaPlus, to: "/guests/new", state: { title: "New Guest", description: "Create a fresh stay record for a new arrival." } },
  { title: "Record Payment", icon: FaMoneyCheckAlt, to: "/payments", state: { title: "Record Payment", description: "Capture a payment and issue a receipt." } },
  { title: "Search Guest", icon: FaSearch, to: "/guests", state: { title: "Search Guest", description: "Locate an existing guest and review their stay." } },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { dashboardSummary, villas, isLoading } = useGuests();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppLayout title="Dashboard" eyebrow="RECEPTION DESK">
      <div className="space-y-8">
        <section className="rounded-[28px] border border-line bg-white p-7 shadow-[0_18px_44px_rgba(31,41,55,0.06)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-hallmark">Receptionist Dashboard</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Welcome, {user?.name || "Receptionist"}</h2>
              <p className="mt-2 text-sm text-muted">{today}</p>
            </div>
            <div className="inline-flex items-center gap-3 rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-muted">
              <FaUser className="text-hallmark" />
              <span>Daily operations ready</span>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-white p-7 shadow-[0_18px_44px_rgba(31,41,55,0.06)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-hallmark/10 p-3 text-hallmark">
              <FaHome className="text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-ink">Villa Summary</h3>
              <p className="text-sm text-muted">Live occupancy overview from the Hallmark backend.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Villas", value: dashboardSummary.totalVillas ?? villas.length, tone: "bg-hallmark/10" },
              { label: "Occupied", value: dashboardSummary.occupiedVillas ?? 0, tone: "bg-[#fff4f4]" },
              { label: "Vacant", value: dashboardSummary.vacantVillas ?? 0, tone: "bg-[#f2fbf5]" },
              { label: "Maintenance", value: dashboardSummary.maintenanceVillas ?? 0, tone: "bg-[#f6f6f6]" },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
                <p className="text-sm text-muted">{item.label}</p>
                <div className={`mt-3 inline-flex rounded-2xl px-3 py-2 text-2xl font-semibold text-ink ${item.tone}`}>
                  {isLoading ? "—" : item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-line bg-white p-7 shadow-[0_18px_44px_rgba(31,41,55,0.06)] sm:p-8">
            <h3 className="text-xl font-semibold text-ink">Upcoming check-outs</h3>
            <p className="mt-2 text-sm text-muted">The next departures from the live reservations.</p>
            <ul className="mt-6 space-y-3">
              {(dashboardSummary.upcomingCheckouts || []).map((item) => (
                <li key={item.id} className="rounded-2xl border border-line bg-canvas px-4 py-4 text-sm font-medium text-ink">
                  • {item.guestName} • {item.villaNumber} • {item.checkOutDate}
                </li>
              ))}
              {!dashboardSummary.upcomingCheckouts?.length && <li className="rounded-2xl border border-dashed border-line bg-canvas px-4 py-4 text-sm text-muted">No departures are scheduled right now.</li>}
            </ul>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-7 shadow-[0_18px_44px_rgba(31,41,55,0.06)] sm:p-8">
            <h3 className="text-xl font-semibold text-ink">Payment reminders</h3>
            <p className="mt-2 text-sm text-muted">Fast tasks for daily reception work.</p>
            <div className="mt-6 space-y-3">
              {(dashboardSummary.paymentReminders || []).map((item) => (
                <div key={item.id} className="rounded-[22px] border border-line bg-surface px-4 py-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-ink">{item.guestName}</span>
                    <span className="text-sm text-muted">{item.villaNumber}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">Outstanding balance: {item.amount}</p>
                </div>
              ))}
              {!dashboardSummary.paymentReminders?.length && <div className="rounded-[22px] border border-dashed border-line bg-surface px-4 py-4 text-sm text-muted">No payment reminders currently.</div>}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
