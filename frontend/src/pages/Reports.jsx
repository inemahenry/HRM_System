import { useMemo, useState } from "react";
import { FaChartLine, FaClipboardList, FaFileDownload, FaHotel, FaUsers } from "react-icons/fa";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import GuestStatusBadge from "../components/GuestStatusBadge";
import { useGuests } from "../hooks/useGuests";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

export default function Reports() {
  const { guests, villas, payments, receipts } = useGuests();
  const [range, setRange] = useState("monthly");

  const totalGuests = guests.length;
  const activeGuests = guests.filter((guest) => guest.stayStatus !== "Checked Out").length;
  const completedCheckouts = guests.filter((guest) => guest.stayStatus === "Checked Out").length;
  const revenue = guests.reduce((sum, guest) => sum + (guest.depositPaid || 0), 0);
  const outstandingBalances = guests.reduce((sum, guest) => sum + (guest.remainingBalance || 0), 0);
  const occupied = villas.filter((villa) => villa.status === "Occupied").length;
  const available = villas.filter((villa) => villa.status === "Available").length;
  const roomRevenue = formatCurrency(revenue);

  const byStatus = guests.reduce((summary, guest) => {
    summary[guest.stayStatus] = (summary[guest.stayStatus] || 0) + 1;
    return summary;
  }, {});

  const reportSummary = useMemo(() => ({
    range,
    revenue,
    paymentsReceived: payments.length,
    outstandingBalances,
    occupiedVillas: occupied,
    availableVillas: available,
    guestsCheckedIn: guests.filter((guest) => guest.stayStatus === "Staying" || guest.stayStatus === "Checking Out").length,
    guestsCheckedOut: completedCheckouts,
    receiptsIssued: receipts.length,
  }), [available, completedCheckouts, occupied, payments.length, range, receipts.length, revenue, outstandingBalances, guests]);

  const exportReport = (format) => {
    const reportBody = [
      `Hallmark Residences ${range} report`,
      `Revenue: ${formatCurrency(revenue)}`,
      `Payments Received: ${payments.length}`,
      `Outstanding Balances: ${formatCurrency(outstandingBalances)}`,
      `Occupied Villas: ${occupied}`,
      `Available Villas: ${available}`,
      `Guests Checked In: ${reportSummary.guestsCheckedIn}`,
      `Guests Checked Out: ${reportSummary.guestsCheckedOut}`,
    ].join("\n");

    const blob = new Blob([reportBody], { type: format === "csv" ? "text/csv" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hallmark-${range}-report.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout title="Reports" eyebrow="OPERATIONS INSIGHTS">
      <PageHeader
        eyebrow="Business analytics"
        title="Reports"
        description="Review daily, weekly, monthly, and custom-range business insights for Hallmark Residences."
      />

      <section className="mt-7 flex flex-wrap items-center gap-3">
        {[
          ["daily", "Daily"],
          ["weekly", "Weekly"],
          ["monthly", "Monthly"],
          ["custom", "Custom"],
        ].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setRange(value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${range === value ? "bg-hallmark text-white" : "border border-line bg-white text-ink"}`}>
            {label}
          </button>
        ))}
      </section>

      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total guests" value={totalGuests} icon={FaUsers} />
        <StatCard title="Active stays" value={activeGuests} icon={FaHotel} tone="green" />
        <StatCard title="Completed check-outs" value={completedCheckouts} icon={FaClipboardList} tone="slate" />
        <StatCard title="Collected revenue" value={roomRevenue} icon={FaChartLine} tone="green" />
      </section>

      <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Operations summary</h2>
            <p className="mt-1 text-sm text-muted">Current reservation and departure mix plus payment operations for the selected range.</p>
          </div>
          <div className="space-y-4 p-6">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="rounded-3xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{status}</p>
                  <span className="text-sm text-muted">{count} record{count === 1 ? "" : "s"}</span>
                </div>
                <div className="mt-3">
                  <GuestStatusBadge status={status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <h2 className="text-lg font-semibold text-ink">Business metrics</h2>
          <p className="mt-2 text-sm text-muted">Core indicators for executive reporting and export.</p>
          <div className="mt-5 space-y-4">
            {[
              ["Revenue", formatCurrency(revenue)],
              ["Payments received", payments.length],
              ["Outstanding balances", formatCurrency(outstandingBalances)],
              ["Occupied villas", occupied],
              ["Available villas", available],
              ["Guests checked in", reportSummary.guestsCheckedIn],
              ["Guests checked out", reportSummary.guestsCheckedOut],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-line bg-white px-4 py-3">
                <p className="text-sm text-muted">{label}</p>
                <p className="mt-1 font-semibold text-ink">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => exportReport("pdf")} className="inline-flex items-center gap-2 rounded-xl bg-hallmark px-4 py-2 text-sm font-semibold text-white">
              <FaFileDownload /> PDF
            </button>
            <button type="button" onClick={() => exportReport("csv")} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink">
              <FaFileDownload /> CSV
            </button>
          </div>
        </aside>
      </section>
    </AppLayout>
  );
}
