import { useState } from "react";
import { FaBed, FaBroom, FaCalendarAlt, FaEdit, FaUserFriends } from "react-icons/fa";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { useGuests } from "../hooks/useGuests";

const statusStyle = {
  Available: "border-emerald-100 bg-emerald-50 text-emerald-700",
  Occupied: "border-red-100 bg-red-50 text-red-700",
  Cleaning: "border-amber-100 bg-amber-50 text-amber-700",
};

export default function Villas() {
  const { villas, guests, updateVilla } = useGuests();
  const [editingVilla, setEditingVilla] = useState(null);
  const rentable = villas.filter((villa) => villa.rentable !== false);
  const count = (status) => rentable.filter((villa) => villa.status === status).length;
  const saveVillaDetails = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await updateVilla(editingVilla.id, {
      type: formData.get("type"),
      cleaningDay: formData.get("cleaningDay"),
      assignedCleaners: formData.get("assignedCleaners"),
      notes: formData.get("notes"),
    });
    setEditingVilla(null);
  };

  return (
    <AppLayout title="Villas" eyebrow="RESIDENCE OPERATIONS">
      <PageHeader eyebrow="Villa register" title="Villas" description="View and manage the current rentable villa register." />

      <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Rentable villas", rentable.length],
          ["Occupied", count("Occupied")],
          ["Vacant", count("Available")],
          ["Cleaning", count("Cleaning")],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-line bg-white p-5 shadow-sm"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-3xl font-semibold text-ink">{value}</p></article>
        ))}
      </section>

      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {villas.map((villa) => {
          const villaGuests = guests.filter((guest) => guest.stayStatus === "OCCUPIED" && String(guest.villaId) === String(villa.id));
          return (
          <article key={villa.id} className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-hallmark/10 text-hallmark"><FaBed /></span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[villa.status] || statusStyle.Cleaning}`}>{villa.status}</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-ink">Villa {villa.number}</h2>
            <p className="mt-1 text-sm text-muted">{villa.type || "Residence villa"}</p>

            <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
              <div className="flex items-start justify-between gap-3"><dt className="text-muted">Occupancy</dt><dd className="font-semibold text-ink">{villa.occupancy || 0}</dd></div>
              <div><dt className="text-muted">Primary tenant</dt><dd className="mt-1 font-semibold text-ink">{villa.primaryTenantName || "—"}</dd></div>
              <div><dt className="text-muted">Guest list</dt><dd className="mt-1 text-ink">{villaGuests.map((guest) => guest.name).join(", ") || "—"}</dd></div>
              <div className="flex items-start justify-between gap-3"><dt className="text-muted">Rent status</dt><dd className="font-semibold text-ink">{villa.rentStatus || "NOT DUE"}</dd></div>
              <div className="flex items-start justify-between gap-3"><dt className="text-muted">Cleaning payment</dt><dd className="font-semibold text-ink">{villa.cleaningPaymentStatus || "DUE"}</dd></div>
              <div className="flex items-center gap-2 text-muted"><FaCalendarAlt className="text-hallmark" /><span>{villa.cleaningDay || "Cleaning day not set"}</span></div>
              <div className="flex items-center gap-2 text-muted"><FaBroom className="text-hallmark" /><span>{villa.assignedCleaners || "No cleaner assigned"}</span></div>
              {villa.guestName && <div className="flex items-center gap-2 text-muted"><FaUserFriends className="text-hallmark" /><span>{villa.guestName}</span></div>}
              {villa.notes && <div><dt className="text-muted">Notes</dt><dd className="mt-1 text-ink">{villa.notes}</dd></div>}
            </dl>
            <button type="button" onClick={() => setEditingVilla(villa)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink"><FaEdit />Edit details</button>
          </article>
          );
        })}
      </section>
      <Modal isOpen={Boolean(editingVilla)} onClose={() => setEditingVilla(null)} title={editingVilla ? `Villa ${editingVilla.number} details` : "Villa details"} size="md">
        {editingVilla && <form onSubmit={saveVillaDetails} className="space-y-4">
          <label className="block text-sm font-medium text-ink">Villa type<input name="type" defaultValue={editingVilla.type || ""} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm" placeholder="Optional" /></label>
          <label className="block text-sm font-medium text-ink">Cleaning day<input name="cleaningDay" defaultValue={editingVilla.cleaningDay || ""} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm" placeholder="For example: Monday" /></label>
          <label className="block text-sm font-medium text-ink">Assigned cleaner(s)<input name="assignedCleaners" defaultValue={editingVilla.assignedCleaners || ""} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm" placeholder="Names of assigned cleaner(s)" /></label>
          <label className="block text-sm font-medium text-ink">Notes<textarea name="notes" defaultValue={editingVilla.notes || ""} className="mt-2 min-h-24 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm" /></label>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setEditingVilla(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted">Cancel</button><button type="submit" className="rounded-xl bg-hallmark px-4 py-2.5 text-sm font-semibold text-white">Save details</button></div>
        </form>}
      </Modal>
    </AppLayout>
  );
}
