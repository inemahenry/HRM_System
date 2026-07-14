import { useState } from "react";
import { FaCalendarAlt, FaRegBell, FaSearch } from "react-icons/fa";
import SearchOverlay from "./SearchOverlay";
import { useGuests } from "../hooks/useGuests";

export default function Navbar({ title = "Dashboard", eyebrow = "OPERATIONS CENTER" }) {
  const { searchResults, searchQuery, setSearchQuery } = useGuests();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      <header className="flex min-h-20 items-center justify-between gap-5 border-b border-line bg-surface px-6 shadow-[0_2px_10px_rgba(31,41,55,0.035)] lg:px-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-hallmark">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden items-center gap-2 border-r border-line pr-5 text-sm text-muted md:flex">
            <FaCalendarAlt aria-hidden="true" className="text-hallmark" />
            <span>{currentDate}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted"
          >
            <FaSearch aria-hidden="true" className="text-hallmark" />
            <span className="hidden sm:inline">Search</span>
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex size-10 items-center justify-center rounded-xl text-muted transition hover:bg-[#800C18]/[0.06] hover:text-hallmark focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
          >
            <FaRegBell aria-hidden="true" className="text-lg" />
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-hallmark ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">Admin</p>
              <p className="text-xs text-muted">Welcome back</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full bg-[#800C18]/10 text-sm font-semibold text-hallmark ring-2 ring-white shadow-[0_3px_10px_rgba(31,41,55,0.08)]">
              A
            </span>
          </div>
        </div>
      </header>

      <SearchOverlay
        open={isSearchOpen}
        query={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onClose={() => setIsSearchOpen(false)}
        results={searchResults}
      />
    </>
  );
}
