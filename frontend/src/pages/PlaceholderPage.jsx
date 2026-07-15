import { Link, useLocation } from "react-router-dom";
import AppLayout from "../components/AppLayout";

export default function PlaceholderPage() {
  const location = useLocation();
  const title = location.state?.title || "Placeholder";
  const description = location.state?.description || "This area will be built soon.";

  return (
    <AppLayout title="Dashboard" eyebrow="OPERATIONS CENTER">
      <div className="mx-auto flex max-w-2xl flex-col items-start rounded-[28px] border border-line bg-white p-8 shadow-[0_18px_44px_rgba(31,41,55,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-hallmark">Coming soon</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-3 text-base leading-7 text-muted">{description}</p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center rounded-xl bg-hallmark px-5 py-3 text-sm font-semibold text-white transition hover:bg-hallmark-deep"
        >
          Back to dashboard
        </Link>
      </div>
    </AppLayout>
  );
}
