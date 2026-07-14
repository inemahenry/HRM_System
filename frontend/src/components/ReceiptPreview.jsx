import { FaDownload, FaPrint, FaReceipt } from "react-icons/fa";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

export default function ReceiptPreview({ receipt, companyName = "Hallmark Residences", onPrint, onDownload }) {
  if (!receipt) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-hallmark">Hallmark Receipt</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">{companyName}</h3>
          <p className="mt-1 text-sm text-muted">Professional payment confirmation for guest stays.</p>
        </div>
        <div className="rounded-2xl bg-[#800C18]/10 p-3 text-hallmark">
          <FaReceipt className="text-2xl" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Guest</p>
          <p className="mt-2 font-semibold text-ink">{receipt.guestName}</p>
          <p className="mt-1 text-sm text-muted">Villa {receipt.villaNumber}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Receipt number</p>
          <p className="mt-2 font-semibold text-ink">{receipt.receiptNumber}</p>
          <p className="mt-1 text-sm text-muted">{receipt.date} • {receipt.time}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Payment amount</span>
          <span className="font-semibold text-ink">{formatCurrency(receipt.amount)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted">Previous balance</span>
          <span className="font-semibold text-ink">{formatCurrency(receipt.previousBalance)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted">Remaining balance</span>
          <span className="font-semibold text-ink">{formatCurrency(receipt.remainingBalance)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted">Payment method</span>
          <span className="font-semibold text-ink">{receipt.paymentMethod}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-line bg-[#800C18]/5 p-4 text-sm text-muted">
        <p>Receptionist: {receipt.receptionistName || "Admin"}</p>
        <p>{receipt.companyFooter || "Thank you for staying with Hallmark Residences."}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={onPrint} className="inline-flex items-center gap-2 rounded-xl bg-hallmark px-4 py-2 text-sm font-semibold text-white">
          <FaPrint /> Print
        </button>
        <button type="button" onClick={onDownload} className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink">
          <FaDownload /> Download PDF
        </button>
      </div>
    </div>
  );
}
