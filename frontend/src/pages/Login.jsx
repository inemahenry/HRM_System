import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaUser } from "react-icons/fa";
import HallmarkMark from "../components/HallmarkMark";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      await login({ username, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to authenticate.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 top-16 size-80 rounded-full bg-hallmark/[0.055] blur-3xl" />
        <div className="absolute -right-20 bottom-0 size-96 rounded-full bg-hallmark/[0.045] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-1 bg-hallmark" />
      </div>

      <section className="hallmark-page-enter relative w-[58vw] min-w-[550px] max-w-[900px] rounded-3xl border border-white/80 bg-surface/95 p-8 shadow-2xl shadow-slate-900/10 transition-all duration-300 ease-out lg:p-14 xl:p-20">
        <div className="flex flex-col items-center text-center">
          <HallmarkMark className="size-16 rounded-[22px] text-3xl shadow-[0_14px_30px_rgba(128,12,24,0.25)] transition-all duration-300 lg:size-20" />
          <p className="mt-6 text-[10px] font-bold tracking-[0.24em] text-hallmark transition-all duration-300 lg:mt-8 lg:text-xs">
            WELCOME TO
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink transition-all duration-300 lg:mt-3 lg:text-4xl">
            Hallmark Residences
          </h1>
          <p className="mt-2 text-sm text-muted transition-all duration-300 lg:text-base">Residence Management System</p>
        </div>

        <div className="mt-9 space-y-5 transition-all duration-300 lg:mt-12 lg:space-y-7">
          {error && <div className="rounded-2xl border border-negative/20 bg-negative/10 px-4 py-3 text-sm text-negative">{error}</div>}
          <label className="block">
            <span className="text-sm font-medium text-ink lg:text-base">Username</span>
            <span className="relative mt-2 block lg:mt-3">
              <FaUser
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-muted transition-all duration-300 lg:text-lg"
              />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                className="h-14 w-full rounded-xl border border-line bg-white pl-14 pr-5 text-lg text-ink outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10"
              />
            </span>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink lg:text-base">Password</span>
            <span className="relative mt-2 block lg:mt-3">
              <FaLock
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-base text-muted transition-all duration-300 lg:text-lg"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-14 w-full rounded-xl border border-line bg-white pl-14 pr-5 text-lg text-ink outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10"
              />
            </span>
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 text-sm transition-all duration-300 lg:mt-7 lg:text-base">
          <label className="flex cursor-pointer items-center gap-2.5 text-muted">
            <input
              type="checkbox"
              className="size-4 rounded border-gray-300 accent-hallmark focus:ring-2 focus:ring-hallmark/20 lg:size-5"
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="font-medium text-hallmark transition hover:text-hallmark-deep hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="mt-8 flex h-14 w-full items-center justify-center rounded-xl bg-hallmark px-4 text-base font-semibold tracking-wide text-white shadow-[0_8px_18px_rgba(128,12,24,0.25)] transition-all duration-300 hover:-translate-y-px hover:bg-hallmark-deep hover:shadow-[0_12px_24px_rgba(128,12,24,0.32)] focus:outline-none focus-visible:ring-4 focus-visible:ring-hallmark/25 active:translate-y-0 lg:mt-10 lg:text-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "LOGIN"}
        </button>

        <p className="mt-7 text-center text-xs text-muted transition-all duration-300 lg:mt-9 lg:text-sm">v1.0</p>
      </section>
    </main>
  );
}
