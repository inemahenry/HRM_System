import { FaBed, FaCalendarAlt, FaCheckCircle, FaTools, FaUserFriends } from "react-icons/fa";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { useGuests } from "../hooks/useGuests";

const villaStatusStyles = {
  Available: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Occupied: "border-red-100 bg-red-50 text-red-700",
  Reserved: "border-amber-100 bg-amber-50 text-amber-700",
  Maintenance: "border-slate-200 bg-slate-100 text-slate-600",
};

const getStatusIcon = (status) => {
  if (status === "Available") return FaCheckCircle;
  if (status === "Maintenance") return FaTools;
  return FaUserFriends;
};

export default function Villas() {
  const { villas } = useGuests();
  const totals = villas.reduce((summary, villa) => ({ ...summary, [villa.status]: (summary[villa.status] || 0) + 1 }), {});

  return (
    <AppLayout title="Villa Management" eyebrow="RESIDENCE OPERATIONS">
      <PageHeader
        eyebrow="Villa inventory"
        title="Villas"
        description="Monitor villa availability, active stays, upcoming reservations, and maintenance at a glance."
      />

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Available", "Ready for assignment"],
          ["Occupied", "Active guest stays"],
          ["Reserved", "Upcoming arrivals"],
          ["Maintenance", "Unavailable inventory"],
        ].map(([status, description]) => (
          <article key={status} className="rounded-2xl border border-line bg-surface p-5 shadow-[0_8px_30px_rgba(31,41,55,0.045)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted">{status}</p>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${villaStatusStyles[status]}`}>{status}</span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{totals[status] || 0}</p>
            <p className="mt-1 text-xs text-muted">{description}</p>
          </article>
        ))}
      </section>

      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {villas.map((villa) => {
          const StatusIcon = getStatusIcon(villa.status);
          const isAssigned = Boolean(villa.guestName);

          return (
            <article
              key={villa.id}
              className="group rounded-2xl border border-line bg-surface p-5 shadow-[0_8px_30px_rgba(31,41,55,0.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(128,12,24,0.10)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#800C18]/10 text-hallmark"><FaBed aria-hidden="true" className="text-xl" /></span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${villaStatusStyles[villa.status]}`}>
                  <StatusIcon aria-hidden="true" />
                  {villa.status}
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">{villa.number}</h2>
              <div className="mt-5 border-t border-line pt-4">
                {isAssigned ? (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Current guest</p>
                    <p className="mt-1 font-semibold text-ink">{villa.guestName}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted"><FaCalendarAlt aria-hidden="true" className="text-hallmark" /> Check-out {villa.checkOutDate}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Current guest</p>
                    <p className="mt-1 text-sm text-muted">{villa.status === "Maintenance" ? "Villa under maintenance" : "No guest assigned"}</p>
                    <p className="mt-3 text-sm font-medium text-positive">{villa.status === "Available" ? "Ready for check-in" : "Assignment unavailable"}</p>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </AppLayout>
  );
}
