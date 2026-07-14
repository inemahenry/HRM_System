import { useMemo, useState } from "react";
import { FaClock, FaDollarSign, FaMoneyBillWave, FaReceipt, FaWallet } from "react-icons/fa";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import ReceiptPreview from "../components/ReceiptPreview";
import StatCard from "../components/StatCard";
import { useGuests } from "../hooks/useGuests";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

const paymentMethods = ["Cash", "Mobile Money", "Bank Transfer", "Credit/Debit Card"];

export default function Payments() {
  const { guests, payments, addPayment, settings } = useGuests();
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(paymentMethods[0]);
  const [previewReceipt, setPreviewReceipt] = useState(null);

  const totalCollected = guests.reduce((sum, guest) => sum + (guest.depositPaid || 0), 0);
  const outstandingBalance = guests.reduce((sum, guest) => sum + (guest.remainingBalance || 0), 0);
  const paidCount = guests.filter((guest) => guest.paymentStatus === "Paid").length;
  const partialCount = guests.filter((guest) => guest.paymentStatus === "Partial").length;
  const unpaidCount = guests.filter((guest) => guest.paymentStatus === "Unpaid").length;
  const dueGuests = guests.filter((guest) => guest.paymentStatus !== "Paid");

  const selectedGuest = useMemo(() => guests.find((guest) => guest.id === selectedGuestId) || null, [guests, selectedGuestId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedGuestId || !amount) return;
    const result = addPayment(selectedGuestId, { amount, method });
    setPreviewReceipt(result.receiptRecord);
    setAmount("");
    setMethod(settings.paymentMethods?.[0] || paymentMethods[0]);
  };

  return (
    <AppLayout title="Payments" eyebrow="FINANCIAL OPERATIONS">
      <PageHeader
        eyebrow="Payment center"
        title="Payments"
        description="Record payments, review history, and generate receipts for every guest stay."
      />

      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Received" value={formatCurrency(totalCollected)} icon={FaMoneyBillWave} tone="green" />
        <StatCard title="Outstanding Balance" value={formatCurrency(outstandingBalance)} icon={FaWallet} tone="amber" />
        <StatCard title="Paid Bookings" value={paidCount} icon={FaDollarSign} tone="green" />
        <StatCard title="Pending Payments" value={partialCount + unpaidCount} icon={FaClock} tone="burgundy" />
      </section>

      <section className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-semibold text-ink">Payment follow-up</h2>
            <p className="mt-1 text-sm text-muted">Guests with balances or partial payments.</p>
          </div>
          <div className="hallmark-scrollbar overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#800C18]/[0.035] text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-6 py-4">Guest</th>
                  <th className="px-6 py-4">Villa</th>
                  <th className="px-6 py-4">Payment method</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {dueGuests.length ? (
                  dueGuests.map((guest) => (
                    <tr key={guest.id} className="transition hover:bg-[#800C18]/[0.035] even:bg-slate-50/60">
                      <td className="px-6 py-4 font-semibold text-ink">{guest.name}</td>
                      <td className="px-6 py-4 text-muted">{guest.villaNumber}</td>
                      <td className="px-6 py-4 text-muted">{guest.paymentMethod || "—"}</td>
                      <td className="px-6 py-4 font-semibold text-negative">{formatCurrency(guest.remainingBalance)}</td>
                      <td className="px-6 py-4 text-muted">{guest.paymentStatus}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-muted">All guest payments are up to date.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#800C18]/10 text-hallmark">
              <FaReceipt />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-ink">Record payment</h2>
              <p className="text-sm text-muted">Add a payment for any guest and issue a receipt instantly.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-ink">
              Guest
              <select value={selectedGuestId} onChange={(event) => setSelectedGuestId(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none">
                <option value="">Select guest</option>
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>{guest.name} • {guest.villaNumber}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-ink">
              Amount
              <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none" placeholder="Enter payment amount" />
            </label>

            <label className="block text-sm font-medium text-ink">
              Payment method
              <select value={method} onChange={(event) => setMethod(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none">
                {(settings.paymentMethods?.length ? settings.paymentMethods : paymentMethods).map((paymentMethod) => (
                  <option key={paymentMethod} value={paymentMethod}>{paymentMethod}</option>
                ))}
              </select>
            </label>

            {selectedGuest && (
              <div className="rounded-2xl border border-line bg-white p-4 text-sm text-muted">
                <p className="font-semibold text-ink">{selectedGuest.name}</p>
                <p className="mt-1">Balance: {formatCurrency(selectedGuest.remainingBalance)}</p>
                <p className="mt-1">Current status: {selectedGuest.paymentStatus}</p>
              </div>
            )}
          </div>

          <button type="submit" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-hallmark px-4 py-3 text-sm font-semibold text-white">
            Record payment & generate receipt
          </button>
        </form>
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
        <div className="border-b border-line px-6 py-5">
          <h2 className="text-lg font-semibold text-ink">Payment history</h2>
          <p className="mt-1 text-sm text-muted">Every payment and corresponding receipt issued for the current guest register.</p>
        </div>
        <div className="hallmark-scrollbar overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-[#800C18]/[0.035] text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-6 py-4">Guest</th>
                <th className="px-6 py-4">Receipt</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.length ? payments.map((payment) => (
                <tr key={payment.id} className="transition hover:bg-[#800C18]/[0.035] even:bg-slate-50/60">
                  <td className="px-6 py-4 font-semibold text-ink">{payment.guestName}</td>
                  <td className="px-6 py-4 text-muted">{payment.receiptNumber}</td>
                  <td className="px-6 py-4 font-semibold text-ink">{formatCurrency(payment.amount)}</td>
                  <td className="px-6 py-4 text-muted">{payment.method}</td>
                  <td className="px-6 py-4 text-muted">{payment.status}</td>
                  <td className="px-6 py-4 text-muted">{new Date(payment.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : <tr><td colSpan="6" className="px-6 py-16 text-center text-muted">No payments recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={Boolean(previewReceipt)} onClose={() => setPreviewReceipt(null)} title="Receipt generated" size="md">
        <ReceiptPreview
          receipt={previewReceipt}
          onPrint={() => window.print()}
          onDownload={() => window.print()}
        />
      </Modal>
    </AppLayout>
  );
}
