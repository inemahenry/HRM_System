import { useState } from "react";
import { FaCheckCircle, FaDollarSign, FaPrint, FaReceipt, FaUserCheck } from "react-icons/fa";
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

export default function Receipts() {
  const { guests, receipts, settings } = useGuests();
  const [activeReceipt, setActiveReceipt] = useState(null);
  const totalReceipts = receipts.reduce((sum, receipt) => sum + (receipt.amount || 0), 0);

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
