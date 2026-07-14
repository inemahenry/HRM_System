import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import Modal from "./Modal";

function getGuestName(guest, guestName) {
  if (guestName) return guestName;
  if (!guest) return "this guest";
  return guest.name || guest.fullName || guest.guestName || "this guest";
}

/**
 * Confirmation wrapper for destructive guest actions. The caller owns dialog
 * state and deletion state, and receives the selected guest on confirmation.
 */
export default function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  guest,
  guestName,
  title = "Delete guest?",
  description,
  confirmLabel = "Delete guest",
  cancelLabel = "Cancel",
  isDeleting = false,
}) {
  const resolvedGuestName = getGuestName(guest, guestName);
  const message = description || `This will permanently remove ${resolvedGuestName}. This action cannot be undone.`;
  const closeDialog = () => {
    if (!isDeleting) onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeDialog}
      title={title}
      size="sm"
      closeOnOverlayClick={!isDeleting}
      showCloseButton={!isDeleting}
      footer={(
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeDialog}
            disabled={isDeleting}
            className="h-11 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-gray-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.(guest)}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-negative px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(220,38,38,0.20)] transition duration-200 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_12px_22px_rgba(220,38,38,0.26)] focus:outline-none focus-visible:ring-2 focus-visible:ring-negative focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none disabled:opacity-60"
          >
            <FaTrash aria-hidden="true" />
            {isDeleting ? "Deleting..." : confirmLabel}
          </button>
        </div>
      )}
    >
      <div className="flex gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-negative">
          <FaExclamationTriangle aria-hidden="true" className="text-lg" />
        </span>
        <p className="pt-1 text-sm leading-6 text-muted">{message}</p>
      </div>
    </Modal>
  );
}
