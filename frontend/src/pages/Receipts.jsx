import { useMemo, useState } from "react";
import { FaCheckCircle, FaDollarSign, FaPrint, FaReceipt, FaUserCheck } from "react-icons/fa";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import ReceiptPreview from "../components/ReceiptPreview";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useGuests } from "../hooks/useGuests";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

const paymentMethods = ["Cash", "Mobile Money", "Bank Transfer", "Credit/Debit Card"];

export default function Receipts() {
  const { guests, receipts, settings, addPayment } = useGuests();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [method, setMethod] = useState(paymentMethods[0]);
  const [paymentDuration, setPaymentDuration] = useState("Monthly");
  const [durationDays, setDurationDays] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const totalReceipts = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return guests.slice(0, 8);
    }

    return guests.filter((guest) => {
      const haystack = [guest.name, guest.phone, guest.villaNumber, guest.identityNumber].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(term);
    }).slice(0, 8);
  }, [guests, searchTerm]);

  const selectedGuest = useMemo(() => guests.find((guest) => guest.id === selectedGuestId) || null, [guests, selectedGuestId]);

  const receiptPreview = useMemo(() => {
    if (!selectedGuest) {
      return null;
    }

    const latestReceipt = receipts.find((item) => item.guestId === selectedGuest.id) || null;
    return latestReceipt ? { ...latestReceipt, receptionistName: latestReceipt.receptionistName || user?.name || user?.fullName || user?.username || "Receptionist" } : null;
  }, [receipts, selectedGuest, user]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedGuest || !amountPaid) {
      return;
    }

    try {
      setIsSaving(true);
      const result = await addPayment(selectedGuest.id, {
        amount: amountPaid,
        method,
        paymentDuration,
        durationDays,
        reference: referenceNumber,
        notes,
      });
      setActiveReceipt(result?.receiptRecord ?? null);
      setAmountPaid("");
      setMethod(settings.paymentMethods?.[0] || paymentMethods[0]);
      setPaymentDuration("Monthly");
      setDurationDays("");
      setReferenceNumber("");
      setNotes("");
    } catch (error) {
      console.warn("Unable to save receipt", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Receipts" eyebrow="FINANCIAL OPERATIONS">
      <PageHeader
        eyebrow="Receipt archive"
        title="Receipts"
        description="Preview, print, and download professional receipts for every successful payment."
      />

      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total receipts" value={receipts.length} icon={FaReceipt} tone="burgundy" />
        <StatCard title="Collected" value={formatCurrency(totalReceipts)} icon={FaDollarSign} tone="green" />
        <StatCard title="Fully paid" value={guests.filter((guest) => guest.paymentStatus === "Paid").length} icon={FaCheckCircle} tone="green" />
        <StatCard title="Active stays" value={guests.filter((guest) => guest.stayStatus !== "Checked Out").length} icon={FaUserCheck} tone="amber" />
      </section>

      <section className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Find guest receipt</h2>
            <p className="mt-1 text-sm text-muted">Search by villa, guest name, or phone number and select the guest to prepare the receipt.</p>
          </div>
          <div className="space-y-4 p-6">
            <label className="block text-sm font-medium text-ink">
              Search guest
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none" placeholder="Villa number, guest name, or phone" />
            </label>

            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Matching guests</p>
                <span className="text-xs uppercase tracking-[0.22em] text-muted">{searchResults.length} results</span>
              </div>
              <div className="mt-3 space-y-2">
                {searchResults.length ? searchResults.map((guest) => (
                  <button key={guest.id} type="button" onClick={() => setSelectedGuestId(guest.id)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm ${selectedGuestId === guest.id ? "border-hallmark bg-[#800C18]/10" : "border-line bg-slate-50/70"}`}>
                    <span>
                      <span className="block font-semibold text-ink">{guest.name}</span>
                      <span className="mt-1 block text-xs text-muted">Villa {guest.villaNumber} • {guest.phone}</span>
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Select</span>
                  </button>
                )) : <p className="text-sm text-muted">No matching guests found.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#800C18]/10 text-hallmark"><FaReceipt /></span>
            <div>
              <h2 className="text-lg font-semibold text-ink">Receipt details</h2>
              <p className="text-sm text-muted">The receptionist name is filled automatically and the receipt is ready for printing.</p>
            </div>
          </div>

          {selectedGuest ? (
            <div className="mt-6 space-y-3 text-sm text-muted">
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Guest</p>
                <p className="mt-2 font-semibold text-ink">{selectedGuest.name}</p>
                <p className="mt-1">Villa {selectedGuest.villaNumber}</p>
                <p className="mt-1">Phone: {selectedGuest.phone}</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Auto-filled receipt</p>
                <p className="mt-2">Receipt number: <span className="font-semibold text-ink">{receiptPreview?.receiptNumber || "Will be generated on save"}</span></p>
                <p className="mt-1">Date: <span className="font-semibold text-ink">{receiptPreview?.date || new Date().toISOString().split("T")[0]}</span></p>
                <p className="mt-1">Previous balance: <span className="font-semibold text-ink">{formatCurrency(receiptPreview?.previousBalance ?? selectedGuest.remainingBalance)}</span></p>
                <p className="mt-1">Current balance: <span className="font-semibold text-ink">{formatCurrency(receiptPreview?.remainingBalance ?? selectedGuest.remainingBalance)}</span></p>
                <p className="mt-1">Due date: <span className="font-semibold text-ink">{receiptPreview?.dueDate || selectedGuest.nextDueDate || "—"}</span></p>
                <p className="mt-1">Received by: <span className="font-semibold text-ink">{user?.name || user?.fullName || user?.username || "Receptionist"}</span></p>
              </div>

              <form onSubmit={handleSave} className="space-y-3 rounded-2xl border border-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Save payment & receipt</p>

                <label className="block text-sm font-medium text-ink">
                  Amount paid
                  <input type="number" min="0" step="0.01" value={amountPaid} onChange={(event) => setAmountPaid(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none" placeholder="Enter amount" />
                </label>

                <label className="block text-sm font-medium text-ink">
                  Payment duration
                  <select value={paymentDuration} onChange={(event) => setPaymentDuration(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none">
                    <option value="Monthly">Monthly</option>
                    <option value="Daily">Daily</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                {paymentDuration === "Other" && (
                  <label className="block text-sm font-medium text-ink">
                    Days
                    <input type="number" min="1" step="1" value={durationDays} onChange={(event) => setDurationDays(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none" placeholder="Enter number of days" />
                  </label>
                )}

                <label className="block text-sm font-medium text-ink">
                  Payment method
                  <select value={method} onChange={(event) => setMethod(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none">
                    {(settings.paymentMethods?.length ? settings.paymentMethods : paymentMethods).map((paymentMethod) => (
                      <option key={paymentMethod} value={paymentMethod}>{paymentMethod}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-medium text-ink">
                  Reference number
                  <input type="text" value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none" placeholder="Optional" />
                </label>

                <label className="block text-sm font-medium text-ink">
                  Notes
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 min-h-[90px] w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none" placeholder="Optional" />
                </label>

                <button type="submit" disabled={isSaving} className="inline-flex w-full items-center justify-center rounded-xl bg-hallmark px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
                  {isSaving ? "Saving..." : "Save & generate receipt"}
                </button>
              </form>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-line p-4 text-sm text-muted">Select a guest to populate the receipt details.</div>
          )}
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
        <div className="border-b border-line px-6 py-5">
          <h2 className="text-lg font-semibold text-ink">Recent receipts</h2>
          <p className="mt-1 text-sm text-muted">Each record includes a unique Hallmark receipt number and professional formatting.</p>
        </div>
        <div className="hallmark-scrollbar overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#800C18]/[0.035] text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-6 py-4">Receipt</th>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Villa</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {receipts.length ? receipts.map((receipt) => (
                <tr key={receipt.id} className="transition hover:bg-[#800C18]/[0.035] even:bg-slate-50/60">
                  <td className="px-6 py-4 font-semibold text-ink">{receipt.receiptNumber}</td>
                  <td className="px-6 py-4 text-muted">{receipt.guestName}</td>
                  <td className="px-6 py-4 text-muted">{receipt.villaNumber}</td>
                  <td className="px-6 py-4 font-semibold text-ink">{formatCurrency(receipt.amount)}</td>
                  <td className="px-6 py-4 text-muted">{receipt.paymentMethod}</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => setActiveReceipt(receipt)} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold text-ink">
                      <FaPrint /> Preview
                    </button>
                  </td>
                </tr>
              )) : <tr><td colSpan="6" className="px-6 py-16 text-center text-muted">No receipts available yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={Boolean(activeReceipt)} onClose={() => setActiveReceipt(null)} title="Receipt preview" size="md">
        <ReceiptPreview
          receipt={{ ...activeReceipt, companyFooter: activeReceipt?.companyFooter || settings.receiptFooter }}
          onPrint={() => window.print()}
          onDownload={() => window.print()}
        />
      </Modal>
    </AppLayout>
  );
}
