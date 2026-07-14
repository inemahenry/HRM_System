import {
  FaCalendarCheck,
  FaCalendarTimes,
  FaHotel,
  FaMoneyBillWave,
  FaSearch,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import AppLayout from "../components/AppLayout";
import GuestStatusBadge from "../components/GuestStatusBadge";
import NotificationCenter from "../components/NotificationCenter";
import StatCard from "../components/StatCard";
import { useGuests } from "../hooks/useGuests";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function Dashboard() {
  const {
    guests,
    totalGuests,
    occupiedVillas,
    availableVillas,
    todaysCheckIns,
    todaysRevenue,
    outstandingBalance,
    monthlyRevenue,
    mostUsedPaymentMethod,
    notifications,
  } = useGuests();

  const today = new Date().toISOString().slice(0, 10);
  const arrivingGuests = guests.filter((guest) => guest.checkInDate === today);
  const totalVillas = occupiedVillas + availableVillas;
  const occupancyRate = totalVillas ? Math.round((occupiedVillas / totalVillas) * 100) : 0;
  const guestsLeavingToday = guests.filter((guest) => guest.checkOutDate === today && guest.stayStatus !== "Checked Out");

  return (
    <AppLayout title="Dashboard">
      <section className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">A live view of today&apos;s Hallmark Residence activity.</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">Today&apos;s overview</h2>
        </div>
        <div className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-muted shadow-sm">
          <span className="font-semibold text-ink">{occupancyRate}%</span> current occupancy
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today's Revenue" value={formatCurrency(todaysRevenue)} icon={FaMoneyBillWave} trendLabel="Payments received today" tone="green" />
        <StatCard title="Monthly Revenue" value={formatCurrency(monthlyRevenue)} icon={FaMoneyBillWave} trendLabel="Cumulative this month" tone="green" />
        <StatCard title="Outstanding Balance" value={formatCurrency(outstandingBalance)} icon={FaWallet} trendLabel="Across active stays" tone="amber" />
        <StatCard title="Occupancy Percentage" value={`${occupancyRate}%`} icon={FaHotel} trendLabel="Of all villas" />
        <StatCard title="Guests Staying" value={totalGuests - guests.filter((guest) => guest.stayStatus === "Checked Out").length} icon={FaUsers} trendLabel="Active stays" />
        <StatCard title="Guests Arriving Today" value={todaysCheckIns} icon={FaCalendarCheck} trendLabel="Scheduled arrivals" tone="amber" />
        <StatCard title="Guests Leaving Today" value={guestsLeavingToday.length} icon={FaCalendarTimes} trendLabel="Scheduled departures" tone="slate" />
        <StatCard title="Most Used Payment Method" value={mostUsedPaymentMethod} icon={FaMoneyBillWave} trendLabel="Preferred by guests" tone="burgundy" />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <div className="flex flex-col gap-4 border-b border-line px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">Today&apos;s Check-ins</h2>
              <p className="mt-1 text-sm text-muted">Guests expected to arrive at Hallmark Residences.</p>
            </div>
            <div className="relative w-full lg:w-72">
              <FaSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted"
              />
              <div className="rounded-xl border border-line bg-canvas py-2.5 pl-10 pr-4 text-sm text-muted">
                Live arrival schedule
              </div>
            </div>
          </div>

          <div className="hallmark-scrollbar max-h-[420px] overflow-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-[#800C18]/[0.035] text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-6 py-4">Guest</th>
                  <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-6 py-4">Villa</th>
                  <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-6 py-4">Arrival</th>
                  <th scope="col" className="sticky top-0 z-10 bg-[#fcf9f9] px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {arrivingGuests.length ? (
                  arrivingGuests.map((guest) => (
                    <tr key={guest.id} className="bg-white transition hover:bg-[#800C18]/[0.035] even:bg-slate-50/60">
                      <td className="px-6 py-4 font-medium text-ink">{guest.name}</td>
                      <td className="px-6 py-4 text-muted">{guest.villaNumber}</td>
                      <td className="px-6 py-4 text-muted">{guest.checkInDate}</td>
                      <td className="px-6 py-4"><GuestStatusBadge status={guest.stayStatus} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-muted">No check-ins scheduled for today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-line px-6 py-3.5 text-xs text-muted">
            <span>{arrivingGuests.length} scheduled arrivals</span>
            <span>Hallmark Residence Operations</span>
          </div>
        </div>

        <NotificationCenter notifications={notifications} />
      </section>
    </AppLayout>
  );
}
