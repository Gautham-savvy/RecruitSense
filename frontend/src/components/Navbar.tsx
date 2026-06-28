import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { Sun, Moon, BrainCircuit, LayoutDashboard, Kanban, BarChart3, Menu, X } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Jobs", icon: LayoutDashboard },
  { to: "/pipeline", label: "Pipeline", icon: Kanban },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Navbar() {
  const { dark, toggle } = useDarkMode();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        background: dark ? "rgba(13,13,13,0.88)" : "rgba(225,212,194,0.92)",
        borderColor: dark ? "#2a2a2a" : "#C4B8AB",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
            style={{ background: dark ? "linear-gradient(135deg, #22c55e, #4ade80)" : "linear-gradient(135deg, #291C0E, #6E473B)" }}
          >
            <BrainCircuit className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--text-1)" }}>
            Recruit<span style={{ color: "var(--accent)" }}>Sense</span>
          </span>
        </Link>

        {/* Desktop Nav Pills */}
        <nav
          className="hidden md:flex items-center gap-0.5 rounded-xl p-1 border"
          style={{ background: dark ? "#111111" : "#EDE6DA", borderColor: dark ? "#2a2a2a" : "#C4B8AB" }}
        >
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}>
              <div
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={isActive(to) ? {
                  background: dark ? "#22c55e" : "#291C0E",
                  color: dark ? "#0a0a0a" : "#E1D4C2",
                  boxShadow: dark ? "0 1px 8px rgba(34,197,94,0.30)" : "0 1px 8px rgba(41,28,14,0.25)",
                } : { color: "var(--text-2)", background: "transparent" }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </div>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ background: dark ? "#1a1a1a" : "#EDE6DA", border: `1px solid ${dark ? "#22c55e" : "#A78D78"}`, color: "var(--accent)" }}
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <UserButton afterSignOutUrl="/sign-in" />
          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: dark ? "#1a1a1a" : "#EDE6DA", border: `1px solid ${dark ? "#2a2a2a" : "#C4B8AB"}`, color: "var(--text-1)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Open menu"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-4 py-3 space-y-1"
          style={{ background: dark ? "rgba(13,13,13,0.97)" : "rgba(225,212,194,0.97)", borderColor: dark ? "#2a2a2a" : "#C4B8AB" }}
        >
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
                style={isActive(to) ? {
                  background: dark ? "#22c55e" : "#291C0E",
                  color: dark ? "#0a0a0a" : "#E1D4C2",
                } : { color: "var(--text-1)" }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </div>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
