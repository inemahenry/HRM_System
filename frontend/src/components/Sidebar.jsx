import {
  FaCog,
  FaFileInvoice,
  FaHome,
  FaHotel,
  FaMoneyBill,
  FaPlusCircle,
  FaUsers,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import HallmarkMark from "./HallmarkMark";

const navigationItems = [
  { label: "Home", icon: FaHome, to: "/dashboard", end: true },
  {
    label: "Guests",
    icon: FaUsers,
    to: "/guests",
    children: [
      { label: "All Guests", to: "/guests", end: true },
      { label: "New Check-in", to: "/guests/new" },
      { label: "Check-outs Today", to: "/guests/checkouts" },
    ],
  },
  { label: "Payments", icon: FaMoneyBill, to: "/payments" },
  { label: "Receipts", icon: FaFileInvoice, to: "/receipts" },
  { label: "Villas", icon: FaHotel, to: "/villas" },
  { label: "Settings", icon: FaCog, to: "/settings" },
];

const itemClassName = (isActive) =>
  `group flex items-center justify-center gap-3 rounded-xl border-l-[3px] px-2 py-3 text-sm font-medium transition duration-200 lg:justify-start lg:px-3 ${
    isActive
      ? "border-white bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] lg:pl-[9px]"
      : "border-transparent text-white/90 hover:bg-hallmark-deep hover:text-white"
  }`;

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-20 shrink-0 flex-col overflow-y-auto bg-hallmark px-3 py-5 text-white shadow-[5px_0_22px_rgba(31,41,55,0.08)] lg:w-64 lg:px-4">
      <div className="flex items-center justify-center gap-3 px-0 pb-8 lg:justify-start lg:px-2">
        <HallmarkMark className="size-11 rounded-xl bg-white text-hallmark shadow-[0_8px_18px_rgba(33,4,8,0.20)]" />
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-base font-semibold leading-none tracking-wide">HALLMARK</p>
          <p className="mt-1 truncate text-[9px] font-medium tracking-[0.18em] text-white/70">
            RESIDENCES
          </p>
        </div>
      </div>

      <p className="hidden px-3 pb-3 text-[10px] font-semibold tracking-[0.16em] text-white/50 lg:block">
        MAIN MENU
      </p>

      <nav aria-label="Primary navigation">
        <ul className="space-y-1.5">
          {navigationItems.map(({ label, icon: Icon, to, end, children }) => (
            <li key={label}>
              <NavLink
                to={to}
                end={end}
                aria-label={label}
                className={({ isActive }) => itemClassName(isActive)}
              >
                <Icon aria-hidden="true" className="shrink-0 text-base" />
                <span className="hidden lg:inline">{label}</span>
              </NavLink>

              {children && (
                <ul className="ml-5 mt-1 hidden space-y-1 border-l border-white/20 pl-3 lg:block">
                  {children.map((child) => (
                    <li key={child.label}>
                      <NavLink
                        to={child.to}
                        end={child.end}
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-lg px-2 py-2 text-xs transition ${
                            isActive
                              ? "bg-white/10 font-semibold text-white"
                              : "text-white/65 hover:bg-hallmark-deep hover:text-white"
                          }`
                        }
                      >
                        {child.label === "New Check-in" && <FaPlusCircle aria-hidden="true" className="text-[10px]" />}
                        <span>{child.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
