/**
 * Standard page heading used across the operational modules.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className = "",
}) {
  const actionContent = actions ?? children;

  return (
    <header className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-hallmark">
            {eyebrow}
          </p>
        )}
        {title && <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">{title}</h1>}
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {actionContent && <div className="flex shrink-0 flex-wrap items-center gap-3">{actionContent}</div>}
    </header>
  );
}
