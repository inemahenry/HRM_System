import { useMemo, useState } from "react";
import { FaCreditCard, FaEdit, FaFileInvoiceDollar, FaSignOutAlt, FaUser, FaUserCircle } from "react-icons/fa";
import AppLayout from "../components/AppLayout";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import GuestForm from "../components/GuestForm";
import GuestStatusBadge from "../components/GuestStatusBadge";
import Modal from "../components/Modal";
import PaymentBadge from "../components/PaymentBadge";
import SearchBar from "../components/SearchBar";
import { useGuests } from "../hooks/useGuests";

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

const calculateDaysStayed = (checkIn) => {
  if (!checkIn) return 0;
  const today = new Date();
  const checkInDate = new Date(checkIn);
  const diff = today - checkInDate;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const calculateExpectedStay = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const calculateDaysRemaining = (checkOut) => {
  if (!checkOut) return 0;
  const today = new Date();
  const checkOutDate = new Date(checkOut);
  const diff = checkOutDate - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function Guests() {
  const { guests, updateGuest, removeGuest, selectedGuest, selectGuest, clearSelectedGuest } = useGuests();
  const [searchTerm, setSearchTerm] = useState("");
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
        guest.passportNumber,
        guest.nationalId,
      ];
      return !normalizedSearch || searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(normalizedSearch),
      );
    });
  }, [guests, searchTerm]);

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

  const handleGuestClick = (guest) => {
    selectGuest(guest);
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return "text-red-600";
    return "text-green-600";
  };

  const getAvatarInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout title="Guest Management" eyebrow="RESIDENCE OPERATIONS">
      <div className="space-y-4">
        <section className="rounded-[24px] border border-line bg-white p-5 shadow-[0_18px_44px_rgba(31,41,55,0.06)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-hallmark">Guest registry</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Guests</h2>
            </div>
            <div className="w-full max-w-xl">
              <SearchBar
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onClear={() => setSearchTerm("")}
                placeholder="Search by name, villa, phone, passport..."
                label="Search guest"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[35%_65%]">
          {/* LEFT PANEL - Guest List */}
          <div className="rounded-[24px] border border-line bg-white p-4 shadow-[0_18px_44px_rgba(31,41,55,0.06)]">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-base font-semibold text-ink">Guest list</h3>
                <p className="text-xs text-muted">Click any guest to view profile</p>
              </div>
              <div className="rounded-xl bg-hallmark/10 px-2.5 py-1.5 text-xs font-semibold text-hallmark">
                {filteredGuests.length} found
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  onClick={() => handleGuestClick(guest)}
                  className={`group cursor-pointer rounded-[16px] border px-3 py-2.5 transition-all duration-200 hover:-translate-y-0.5 ${
                    selectedGuest?.id === guest.id
                      ? "border-hallmark bg-hallmark/5 shadow-[0_4px_12px_rgba(128,12,24,0.12)]"
                      : "border-line bg-white hover:border-hallmark/30 hover:shadow-[0_4px_12px_rgba(128,12,24,0.08)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hallmark/10 text-xs font-semibold text-hallmark">
                        {getAvatarInitials(guest.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate group-hover:text-hallmark transition-colors">
                          {guest.name}
                        </p>
                        <p className="text-xs text-muted">Villa {guest.villaNumber}</p>
                      </div>
                    </div>
                    <PaymentBadge status={guest.paymentStatus} />
                  </div>
                </div>
              ))}

              {!filteredGuests.length && (
                <div className="rounded-[20px] border border-dashed border-line bg-canvas px-4 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-hallmark/10 text-hallmark">
                      <FaUser className="text-xl" />
                    </div>
                    <h4 className="mt-3 text-sm font-semibold text-ink">No guests found</h4>
                    <p className="mt-1 text-xs text-muted">Try adjusting your search</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL - Guest Profile */}
          <div className="rounded-[24px] border border-line bg-white p-5 shadow-[0_18px_44px_rgba(31,41,55,0.06)]">
            {selectedGuest ? (
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-center gap-4 p-4 bg-surface rounded-[20px] border border-line">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-hallmark/10 text-xl font-semibold text-hallmark">
                    {getAvatarInitials(selectedGuest.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-ink truncate">{selectedGuest.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-sm text-muted">Villa {selectedGuest.villaNumber}</span>
                      <PaymentBadge status={selectedGuest.paymentStatus} />
                    </div>
                  </div>
                  <GuestStatusBadge status={selectedGuest.stayStatus} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="col-span-2 rounded-[20px] border border-line bg-surface p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Personal Information</h4>
                    <dl className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <dt className="text-xs text-muted">Phone Number</dt>
                        <dd className="text-sm font-medium text-ink">{selectedGuest.phone || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Nationality</dt>
                        <dd className="text-sm font-medium text-ink">{selectedGuest.nationality || "—"}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-xs text-muted">Passport / ID</dt>
                        <dd className="text-sm font-medium text-ink">{selectedGuest.identityNumber || "—"}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Stay Information */}
                  <div className="col-span-2 rounded-[20px] border border-line bg-surface p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Stay Information</h4>
                    <dl className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <dt className="text-xs text-muted">Villa Number</dt>
                        <dd className="text-sm font-medium text-ink">{selectedGuest.villaNumber || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Check-in</dt>
                        <dd className="text-sm font-medium text-ink">{selectedGuest.checkInDate || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Check-out</dt>
                        <dd className="text-sm font-medium text-ink">{selectedGuest.checkOutDate || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Stayed</dt>
                        <dd className="text-sm font-medium text-ink">{calculateDaysStayed(selectedGuest.checkInDate)} days</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Expected Stay</dt>
                        <dd className="text-sm font-medium text-ink">
                          {calculateExpectedStay(selectedGuest.checkInDate, selectedGuest.checkOutDate)} days
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">Next Rent Due</dt>
                        <dd className="text-sm font-medium text-ink">
                          {selectedGuest.nextPaymentDue ? (
                            <>
                              {selectedGuest.nextPaymentDue}
                              <span className="ml-1 text-xs text-muted">
                                ({calculateDaysRemaining(selectedGuest.nextPaymentDue)} days remaining)
                              </span>
                            </>
                          ) : (
                            "Not Scheduled"
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Payment Information */}
                  <div className="col-span-2 rounded-[20px] border border-line bg-surface p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Payment Information</h4>
                    <dl className="mt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <dt className="text-xs text-muted">Payment Status</dt>
                        <dd>
                          <PaymentBadge status={selectedGuest.paymentStatus} />
                        </dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-line">
                        <div>
                          <dt className="text-xs text-muted">Monthly Rent</dt>
                          <dd className="text-sm font-semibold text-ink">{formatCurrency(selectedGuest.roomPrice)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">Amount Paid</dt>
                          <dd className="text-sm font-semibold text-ink">{formatCurrency(selectedGuest.depositPaid)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">Remaining Balance</dt>
                          <dd className={`text-sm font-bold ${getBalanceColor(selectedGuest.remainingBalance)}`}>
                            {formatCurrency(selectedGuest.remainingBalance)}
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>

                  {/* Notes */}
                  <div className="col-span-2 rounded-[20px] border border-line bg-surface p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Notes</h4>
                    <p className="mt-2 text-sm text-ink">{selectedGuest.notes || "No notes added yet."}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-3">
                  <button 
                    type="button" 
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#800C18] px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6A0A14]"
                  >
                    <FaCreditCard className="text-white" />
                    Record Payment
                  </button>
                  <button 
                    type="button" 
                    className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <FaFileInvoiceDollar className="text-white" />
                    Print Receipt
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditingGuest(selectedGuest)} 
                    className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                  >
                    <FaEdit className="text-white" />
                    Edit Guest
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setDeletingGuest(selectedGuest)} 
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-3 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    <FaSignOutAlt className="text-white" />
                    Check Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-[20px] border border-dashed border-line bg-canvas px-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-hallmark/10 text-hallmark">
                  <FaUser className="text-3xl" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-ink">Select a Guest</h3>
                <p className="mt-2 text-sm text-muted max-w-sm">
                  Choose a guest from the left to view their complete information, payments and receipts.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

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
          clearSelectedGuest();
        }}
      />
    </AppLayout>
  );
}