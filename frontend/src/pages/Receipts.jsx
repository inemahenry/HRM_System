import { useMemo, useState } from "react";
import { FaEye, FaPrint, FaReceipt } from "react-icons/fa";
import AppLayout from "../components/AppLayout";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import ReceiptPreview from "../components/ReceiptPreview";
import { useGuests } from "../hooks/useGuests";

const money = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(amount) || 0);

export default function Receipts() {
  const { receipts, settings } = useGuests();
  const [activeReceipt, setActiveReceipt] = useState(null);
  const orderedReceipts = useMemo(() => [...receipts].sort((left, right) => String(right.issuedAt || right.date).localeCompare(String(left.issuedAt || left.date))), [receipts]);

  return (
    <AppLayout title="Receipts" eyebrow="FINANCIAL OPERATIONS">
      <PageHeader eyebrow="Receipt archive" title="Receipts" description="Receipts are generated automatically after every rent or cleaning payment. View, print, or reprint any receipt here." />

      <section className="mt-7 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
        <div className="flex items-center gap-3 border-b border-line px-6 py-5">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-hallmark/10 text-hallmark"><FaReceipt /></span>
          <div><h2 className="text-lg font-semibold text-ink">Receipt archive</h2><p className="text-sm text-muted">{orderedReceipts.length} receipt{orderedReceipts.length === 1 ? "" : "s"} issued</p></div>
        </div>
        <div className="hallmark-scrollbar overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#800C18]/[0.035] text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              <tr><th className="px-6 py-4">Receipt</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Guest</th><th className="px-6 py-4">Villa</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orderedReceipts.length ? orderedReceipts.map((receipt) => (
                <tr key={receipt.id} className="even:bg-slate-50/60 hover:bg-[#800C18]/[0.035]">
                  <td className="px-6 py-4 font-semibold text-ink">{receipt.receiptNumber}</td>
                  <td className="px-6 py-4 text-muted">{receipt.date}</td>
                  <td className="px-6 py-4 text-muted">{receipt.guestName}</td>
                  <td className="px-6 py-4 text-muted">{receipt.villaNumber}</td>
                  <td className="px-6 py-4 text-muted">{receipt.paymentType === "CLEANING" ? "Cleaning" : "Rent"}</td>
                  <td className="px-6 py-4 font-semibold text-ink">{money(receipt.amount)}</td>
                  <td className="px-6 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setActiveReceipt(receipt)} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 font-semibold text-ink"><FaEye />View</button><button type="button" onClick={() => { setActiveReceipt(receipt); setTimeout(() => window.print(), 0); }} className="inline-flex items-center gap-2 rounded-xl bg-hallmark px-3 py-2 font-semibold text-white"><FaPrint />Reprint</button></div></td>
                </tr>
              )) : <tr><td colSpan="7" className="px-6 py-16 text-center text-muted">No receipts have been generated yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={Boolean(activeReceipt)} onClose={() => setActiveReceipt(null)} title="Receipt" size="md">
        <ReceiptPreview receipt={{ ...activeReceipt, companyFooter: activeReceipt?.companyFooter || settings.receiptFooter }} onPrint={() => window.print()} onDownload={() => window.print()} />
      </Modal>
    </AppLayout>
  );
}
