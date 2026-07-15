import { FaHome, FaMoneyCheckAlt, FaPlus, FaSearch, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { useAuth } from "../context/AuthContext";

const villaSummary = [
  { label: "Total Villas", value: "30", tone: "bg-hallmark/10" },
  { label: "Occupied", value: "18", tone: "bg-[#fff4f4]" },
  { label: "Available", value: "10", tone: "bg-[#f2fbf5]" },
  { label: "Maintenance", value: "2", tone: "bg-[#f6f6f6]" },
];

const paymentsDue = ["Villa 8", "Villa 17", "Villa 21"];

const quickActions = [
  { title: "New Guest", icon: FaPlus, to: "/placeholder", state: { title: "New Guest", description: "This screen will be built next for guest registration." } },
  { title: "Record Payment", icon: FaMoneyCheckAlt, to: "/placeholder", state: { title: "Record Payment", description: "This payment screen will be added soon." } },
  { title: "Search Guest", icon: FaSearch, to: "/placeholder", state: { title: "Search Guest", description: "Guest lookup will be available here soon." } },
];

export default function Dashboard() {
  const { user } = useAuth();
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
              <p className="text-sm text-muted">Simple occupancy overview for the front desk.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {villaSummary.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-line bg-surface p-5 shadow-sm">
                <p className="text-sm text-muted">{item.label}</p>
                <div className={`mt-3 inline-flex rounded-2xl px-3 py-2 text-2xl font-semibold text-ink ${item.tone}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-line bg-white p-7 shadow-[0_18px_44px_rgba(31,41,55,0.06)] sm:p-8">
            <h3 className="text-xl font-semibold text-ink">Payments Due</h3>
            <p className="mt-2 text-sm text-muted">A short list of villas that need attention.</p>
            <ul className="mt-6 space-y-3">
              {paymentsDue.map((villa) => (
                <li key={villa} className="rounded-2xl border border-line bg-canvas px-4 py-4 text-sm font-medium text-ink">
                  • {villa}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-7 shadow-[0_18px_44px_rgba(31,41,55,0.06)] sm:p-8">
            <h3 className="text-xl font-semibold text-ink">Quick Actions</h3>
            <p className="mt-2 text-sm text-muted">Fast tasks for daily reception work.</p>
            <div className="mt-6 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.to}
                    state={action.state}
                    className="flex items-center justify-between rounded-[22px] border border-line bg-surface px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-hallmark/30 hover:shadow-[0_12px_24px_rgba(128,12,24,0.08)]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="rounded-2xl bg-hallmark/10 p-3 text-hallmark">
                        <Icon className="text-lg" />
                      </span>
                      <span className="text-base font-semibold text-ink">{action.title}</span>
                    </span>
                    <span className="text-sm text-muted">Open</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
