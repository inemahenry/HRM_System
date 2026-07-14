import { useEffect, useId } from "react";
import { FaTimes } from "react-icons/fa";

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

/**
 * Accessible presentation modal. Its open state and all data mutations remain
 * controlled by the parent component.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className = "",
  contentClassName = "",
  ariaLabel = "Dialog",
  closeOnOverlayClick = true,
  showCloseButton = true,
}) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) onClose?.();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px] ${className}`}
      onClick={handleOverlayClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title ? undefined : ariaLabel}
        aria-labelledby={title ? titleId : undefined}
        className={`flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl ${sizeClasses[size] || sizeClasses.md}`}
      >
        {(title || showCloseButton) && (
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-6 py-5 sm:px-7">
            <div className="min-w-0">
              {title && <h2 id={titleId} className="text-lg font-semibold tracking-tight text-ink">{title}</h2>}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={() => onClose?.()}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-[#800C18]/[0.07] hover:text-hallmark focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
                aria-label="Close dialog"
              >
                <FaTimes aria-hidden="true" />
              </button>
            )}
          </header>
        )}
        <div className={`hallmark-scrollbar min-h-0 overflow-y-auto px-6 py-6 sm:px-7 ${contentClassName}`}>{children}</div>
        {footer && <footer className="shrink-0 border-t border-line bg-slate-50/70 px-6 py-4 sm:px-7">{footer}</footer>}
      </section>
    </div>
  );
}
