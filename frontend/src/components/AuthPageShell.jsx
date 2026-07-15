import HallmarkMark from "./HallmarkMark";

export default function AuthPageShell({ subtitle, children, footer }) {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-canvas px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-10 size-72 rounded-full bg-hallmark/[0.055] blur-3xl" />
        <div className="absolute -right-16 bottom-0 size-96 rounded-full bg-hallmark/[0.045] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-1 bg-hallmark" />
      </div>

      <section className="hallmark-page-enter relative w-full max-w-6xl rounded-[28px] border border-white/80 bg-surface/95 p-8 shadow-2xl shadow-slate-900/10 sm:p-10 lg:p-14">
        <div className="flex flex-col items-center text-center">
          <HallmarkMark className="size-16 rounded-[22px] text-3xl shadow-[0_14px_30px_rgba(128,12,24,0.25)] transition-all duration-300 lg:size-20" />
          <p className="mt-6 text-[10px] font-bold tracking-[0.24em] text-hallmark transition-all duration-300 lg:mt-8 lg:text-xs">
            WELCOME TO
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink transition-all duration-300 lg:mt-3 lg:text-4xl">
            Hallmark Residences
          </h1>
          <p className="mt-2 text-sm text-muted transition-all duration-300 lg:text-base">{subtitle}</p>
        </div>

        {children}

        {footer ? <div className="mt-8 text-center text-xs text-muted">{footer}</div> : null}
      </section>
    </main>
  );
}
