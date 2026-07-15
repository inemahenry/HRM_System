import { Link } from "react-router-dom";

export default function FlowCard({ to, state, title, description, icon: Icon, accent = "bg-hallmark/5", onClick, disabled = false }) {
  const cardContent = (
    <div className={`flex h-full flex-col justify-between rounded-[24px] border border-line bg-white/90 p-6 text-left shadow-sm transition-all duration-300 ${disabled ? "opacity-80" : "hover:-translate-y-1 hover:border-hallmark/30 hover:shadow-[0_18px_36px_rgba(128,12,24,0.12)]"}`}>
      <div className={`inline-flex w-fit rounded-2xl p-3 ${accent}`}>
        <Icon className="text-3xl text-hallmark" />
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <div className="mt-2 space-y-1">
          {description.split("\n").map((line) => (
            <p key={`${title}-${line}`} className="text-sm leading-6 text-muted">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  if (to && !disabled) {
    return (
      <Link to={to} state={state} onClick={onClick} className="block h-full">
        {cardContent}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className="block h-full w-full text-left">
      {cardContent}
    </button>
  );
}
