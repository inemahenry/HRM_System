import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const toneClasses = {
  info: "border-slate-200 bg-slate-50 text-slate-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const iconMap = {
  info: FaInfoCircle,
  warning: FaExclamationTriangle,
  success: FaCheckCircle,
};

export default function NotificationCenter({ notifications = [] }) {
  if (!notifications.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#800C18]/10 text-hallmark">
          <FaBell />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-ink">Live notifications</h2>
          <p className="text-sm text-muted">Operations updates for checkouts, payments, and availability changes.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {notifications.map((notification) => {
          const Icon = iconMap[notification.type] || FaInfoCircle;
          return (
            <article key={notification.id} className={`rounded-2xl border p-4 ${toneClasses[notification.type] || toneClasses.info}`}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">{notification.title}</p>
                  <p className="mt-1 text-sm">{notification.message}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
