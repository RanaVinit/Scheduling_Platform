import { NavLink } from "react-router-dom";
import { Calendar, Clock, CalendarDays, Link2, Menu, X } from "lucide-react";
import { cn } from "../../utils/helpers";
import { useState } from "react";

const navItems = [
  { label: "Event Types", path: "/event-types", icon: Link2 },
  { label: "Bookings", path: "/bookings", icon: CalendarDays },
  { label: "Availability", path: "/availability", icon: Clock },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border border-gray-200 cursor-pointer">
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50",
        "w-64 flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <NavLink to="/event-types" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              Cal<span className="text-gray-400">.clone</span>
            </span>
          </NavLink>
          <button onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}>
                {({ isActive }) => (
                  <>
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-gray-900" : "text-gray-400")} />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">V</div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Vinit Rana</p>
              <p className="text-xs text-gray-500 truncate">ranavinit74@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
