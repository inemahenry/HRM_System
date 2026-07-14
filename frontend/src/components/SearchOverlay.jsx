import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchOverlay({ open, query, onChange, onClose, results = [] }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/35 p-4 pt-16 backdrop-blur-[2px]">
      <div className="w-full max-w-2xl rounded-3xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-4">
          <FaSearch className="text-hallmark" />
          <input
            autoFocus
            value={query}
            onChange={onChange}
            placeholder="Search guests, receipts, payments, villa numbers, phones or passports"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button type="button" onClick={onClose} className="rounded-full p-2 text-muted hover:bg-slate-100">
            <FaTimes />
          </button>
        </div>

        <div className="max-h-80 overflow-auto p-3">
          {results.length ? (
            results.map((result, index) => (
              <div key={`${result.type}-${index}`} className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3">
                <div>
                  <p className="font-semibold text-ink">{result.label}</p>
                  <p className="text-sm text-muted">{result.detail}</p>
                </div>
                <span className="rounded-full bg-[#800C18]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-hallmark">
                  {result.type}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
              No matches yet. Try another keyword.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
