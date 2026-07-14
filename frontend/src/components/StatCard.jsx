export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  tone = "burgundy",
}) {
  const toneClasses = {
    burgundy: "bg-[#800C18]/10 text-hallmark",
    green: "bg-green-50 text-positive",
    amber: "bg-amber-50 text-caution",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <article className="group rounded-2xl border border-line bg-surface p-5 shadow-[0_8px_30px_rgba(31,41,55,0.055)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(128,12,24,0.10)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-[2rem]">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-2xl text-xl transition duration-200 group-hover:scale-105 ${toneClasses[tone] || toneClasses.burgundy}`}
          >
            <Icon aria-hidden="true" />
          </span>
        )}
      </div>

      {(trend || trendLabel) && (
        <div className="mt-5 flex items-center gap-2 text-xs font-medium">
          {trend && <span className={trend.startsWith("+") ? "text-positive" : "text-caution"}>{trend}</span>}
          {trendLabel && <span className="text-muted">{trendLabel}</span>}
        </div>
      )}
    </article>
  );
}
