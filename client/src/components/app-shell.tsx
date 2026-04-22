/**
 * AppShell — Top navigation bar, mobile nav, footer
 * - Predict / Compare / Information → link to pages
 * - About → opens AboutPanel overlay (does NOT navigate)
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { Sun, Moon, BarChart3, GitCompare, BookOpen, Info } from "lucide-react";
import { AboutPanel } from "@/components/ui-custom/about-panel";

const PAGE_NAV = [
  { href: "/predict", label: "Predict",     icon: BarChart3  },
  { href: "/compare", label: "Compare",     icon: GitCompare },
  { href: "/info",    label: "Information", icon: BookOpen   },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">

      {/* ── Top Navigation ───────────────────────────────────────── */}
      <header className="border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* Logo — always goes home */}
          <Link href="/home" className="flex items-center gap-2.5" data-testid="link-logo">
            <svg aria-label="AggregateIQ logo" viewBox="0 0 32 32" className="w-8 h-8 shrink-0">
              <circle cx="16" cy="16" r="14" fill="hsl(var(--primary))" opacity="0.15" />
              <polygon points="16,4 28,12 28,20 16,28 4,20 4,12" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
              <circle cx="16" cy="16" r="4" fill="hsl(var(--primary))" />
              <line x1="16" y1="4"  x2="16" y2="12" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="28" y1="12" x2="22" y2="14" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="28" y1="20" x2="22" y2="18" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="16" y1="28" x2="16" y2="20" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="4"  y1="20" x2="10" y2="18" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="4"  y1="12" x2="10" y2="14" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            </svg>
            <span className="font-semibold text-base tracking-tight">AggregateIQ</span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Desktop nav — page links */}
            <nav className="hidden sm:flex items-center mr-1">
              {PAGE_NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    location === href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  data-testid={`nav-${label.toLowerCase()}`}
                >
                  {label}
                </Link>
              ))}

              {/* About — opens panel */}
              <button
                onClick={() => setAboutOpen(true)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  aboutOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                data-testid="nav-about"
              >
                About
              </button>
            </nav>

            {/* Dark / light toggle */}
            <button
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="sm:hidden border-t border-border flex">
          {PAGE_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                location === href
                  ? "text-primary border-t-2 border-primary -mt-px"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label === "Information" ? "Info" : label}
            </Link>
          ))}

          {/* Mobile About button */}
          <button
            onClick={() => setAboutOpen(true)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              aboutOpen ? "text-primary border-t-2 border-primary -mt-px" : "text-muted-foreground"
            }`}
            data-testid="nav-about-mobile"
          >
            <Info className="w-4 h-4" />
            About
          </button>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        AggregateIQ — Bitumen-Aggregate Adhesivity Companion · Tanzania Pavement Engineering Research
      </footer>

      {/* ── About Panel (overlay) ─────────────────────────────────── */}
      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
