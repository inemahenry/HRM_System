import { useMemo, useState } from "react";
import { FaFilter, FaPlus, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import GuestCard from "../components/GuestCard";
import GuestForm from "../components/GuestForm";
import GuestStatusBadge from "../components/GuestStatusBadge";
import GuestTable from "../components/GuestTable";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import PaymentBadge from "../components/PaymentBadge";
import SearchBar from "../components/SearchBar";
import { useGuests } from "../hooks/useGuests";

const paymentOptions = ["All", "Paid", "Partial", "Unpaid"];
const stayOptions = ["All", "Reserved", "Staying", "Checking Out", "Checked Out"];

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
};

const getPaymentStatus = (roomPrice, depositPaid) => {
  if (roomPrice > 0 && depositPaid >= roomPrice) return "Paid";
  return depositPaid > 0 ? "Partial" : "Unpaid";
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(toAmount(value));

export default function Guests() {
  const { guests, villas, updateGuest, removeGuest, selectedGuest, selectGuest, clearSelectedGuest } = useGuests();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [stayFilter, setStayFilter] = useState("All");
  const [villaFilter, setVillaFilter] = useState("All");
  const [editingGuest, setEditingGuest] = useState(null);
  const [deletingGuest, setDeletingGuest] = useState(null);

  const filteredGuests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return guests.filter((guest) => {
      const searchableValues = [
        guest.name,
        guest.phone,
        guest.villaNumber,
        guest.identityNumber,
        guest.nationality,
      ];
      const matchesSearch = !normalizedSearch || searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(normalizedSearch),
      );
      const matchesPayment = paymentFilter === "All" || guest.paymentStatus === paymentFilter;
      const matchesStay = stayFilter === "All" || guest.stayStatus === stayFilter;
      const matchesVilla = villaFilter === "All" || guest.villaNumber === villaFilter;

      return matchesSearch && matchesPayment && matchesStay && matchesVilla;
    });
  }, [guests, paymentFilter, searchTerm, stayFilter, villaFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setPaymentFilter("All");
    setStayFilter("All");
    setVillaFilter("All");
  };

  const handleUpdateGuest = (values) => {
    if (!editingGuest) return;

    const roomPrice = toAmount(values.roomPrice);
    const depositPaid = toAmount(values.depositPaid);
    updateGuest(editingGuest.id, {
      ...values,
      roomPrice,
      depositPaid,
      remainingBalance: Math.max(roomPrice - depositPaid, 0),
      paymentStatus: getPaymentStatus(roomPrice, depositPaid),
    });
    setEditingGuest(null);
  };

  return (
    <AppLayout title="Guest Management" eyebrow="RESIDENCE OPERATIONS">
      <PageHeader
        eyebrow="Guest registry"
        title="Guests"
        description="Manage guest profiles, stays, payment progress, and villa assignments from one place."
        actions={(
          <Link
            to="/guests/new"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-hallmark px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(128,12,24,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-hallmark-deep hover:shadow-[0_12px_22px_rgba(128,12,24,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
          >
            <FaPlus aria-hidden="true" />
            New Check-in
          </Link>
        )}
      />

      <section className="mt-7 rounded-2xl border border-line bg-surface p-5 shadow-[0_8px_30px_rgba(31,41,55,0.045)] lg:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <SearchBar
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onClear={() => setSearchTerm("")}
            className="xl:max-w-md"
          />
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted"><FaFilter aria-hidden="true" /> Payment</span>
              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition hover:border-gray-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10"
              >
                {paymentOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 text-xs font-semibold text-muted">Stay status</span>
              <select
                value={stayFilter}
                onChange={(event) => setStayFilter(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition hover:border-gray-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10"
              >
                {stayOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 text-xs font-semibold text-muted">Villa</span>
              <select
                value={villaFilter}
                onChange={(event) => setVillaFilter(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition hover:border-gray-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10"
              >
                <option>All</option>
                {villas.map((villa) => <option key={villa.id}>{villa.number}</option>)}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-gray-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
          >
            <FaTimes aria-hidden="true" />
            Clear
          </button>
        </div>
        <p className="mt-4 text-sm text-muted"><span className="font-semibold text-ink">{filteredGuests.length}</span> guest records in this view</p>
      </section>

      <div className="mt-6 hidden lg:block">
        <GuestTable
          guests={filteredGuests}
          onView={selectGuest}
          onEdit={setEditingGuest}
          onDelete={setDeletingGuest}
          emptyMessage="Try adjusting the filters or create a new check-in."
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:hidden">
        {filteredGuests.map((guest) => (
          <GuestCard
            key={guest.id}
            guest={guest}
            onView={selectGuest}
            onEdit={setEditingGuest}
            onDelete={setDeletingGuest}
          />
        ))}
        {!filteredGuests.length && (
          <div className="col-span-full rounded-2xl border border-dashed border-line bg-surface px-6 py-12 text-center text-sm text-muted">
            No guest records match the current filters.
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selectedGuest)}
        onClose={clearSelectedGuest}
        title="Guest profile"
        size="lg"
        footer={(
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => clearSelectedGuest()}
              className="h-11 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
            >
              Close
            </button>
          </div>
        )}
      >
        {selectedGuest && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-ink">{selectedGuest.name}</h3>
                <p className="mt-1 text-sm text-muted">{selectedGuest.nationality} · {selectedGuest.phone}</p>
              </div>
              <div className="flex gap-2">
                <GuestStatusBadge status={selectedGuest.stayStatus} />
                <PaymentBadge status={selectedGuest.paymentStatus} />
              </div>
            </div>
            <dl className="grid gap-x-8 gap-y-5 border-y border-line py-5 sm:grid-cols-2">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Villa</dt><dd className="mt-1 font-medium text-ink">{selectedGuest.villaNumber}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Identity document</dt><dd className="mt-1 font-medium text-ink">{selectedGuest.identityNumber || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Check-in</dt><dd className="mt-1 font-medium text-ink">{selectedGuest.checkInDate}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Check-out</dt><dd className="mt-1 font-medium text-ink">{selectedGuest.checkOutDate}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Guests</dt><dd className="mt-1 font-medium text-ink">{selectedGuest.adults} adults · {selectedGuest.children} children</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Payment method</dt><dd className="mt-1 font-medium text-ink">{selectedGuest.paymentMethod || "—"}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Room price</dt><dd className="mt-1 font-medium text-ink">{formatCurrency(selectedGuest.roomPrice)}</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Balance remaining</dt><dd className="mt-1 font-medium text-negative">{formatCurrency(selectedGuest.remainingBalance)}</dd></div>
            </dl>
            {selectedGuest.notes && <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-muted"><span className="font-semibold text-ink">Notes: </span>{selectedGuest.notes}</p>}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(editingGuest)}
        onClose={() => setEditingGuest(null)}
        title="Edit guest"
        size="xl"
        contentClassName="p-0"
      >
        {editingGuest && (
          <GuestForm
            initialValues={editingGuest}
            onSubmit={handleUpdateGuest}
            onCancel={() => setEditingGuest(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>

      <ConfirmDeleteDialog
        isOpen={Boolean(deletingGuest)}
        guest={deletingGuest}
        onClose={() => setDeletingGuest(null)}
        onConfirm={(guest) => {
          removeGuest(guest.id);
          setDeletingGuest(null);
        }}
      />
    </AppLayout>
  );
}
