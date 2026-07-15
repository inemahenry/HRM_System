import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import AuthPageShell from "../components/AuthPageShell";
import { useAuth } from "../context/AuthContext";

export default function PasswordEntry() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setIsAuthenticated } = useAuth();
  const [password, setPassword] = useState("");

  const receptionistName = location.state?.receptionistName || "Receptionist";

  const handleLogin = (event) => {
    event.preventDefault();
    setUser({ name: receptionistName, role: "Receptionist" });
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  return (
    <AuthPageShell subtitle="Enter the password for the selected receptionist">
      <div className="mx-auto mt-10 max-w-xl rounded-[24px] border border-line bg-canvas/70 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-hallmark">Welcome,</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{receptionistName}</h2>
        <p className="mt-2 text-sm text-muted">No username is needed because your receptionist has already been selected.</p>

        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <div className="relative mt-2">
              <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                className="h-14 w-full rounded-xl border border-line bg-white pl-12 pr-4 text-base text-ink outline-none transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10"
              />
            </div>
          </label>

          <button
            type="submit"
            className="flex h-14 w-full items-center justify-center rounded-xl bg-hallmark px-4 text-base font-semibold tracking-wide text-white shadow-[0_8px_18px_rgba(128,12,24,0.25)] transition-all duration-300 hover:-translate-y-px hover:bg-hallmark-deep hover:shadow-[0_12px_24px_rgba(128,12,24,0.32)] focus:outline-none focus-visible:ring-4 focus-visible:ring-hallmark/25"
          >
            Login
          </button>
        </form>
      </div>
    </AuthPageShell>
  );
}
