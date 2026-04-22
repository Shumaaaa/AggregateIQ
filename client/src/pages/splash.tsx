/**
 * Splash Page — Video background intro
 * - Video plays full-screen as background (looped, muted, autoplay)
 * - After 6 seconds, overlay fades in: "Welcome to AggregateIQ" + Go button
 * - Clicking "Go →" navigates to Home
 * - Video file: /splash-video.mp4 (user supplies this file)
 */
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Splash() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [, navigate] = useLocation();

  // After 6 seconds, fade in the overlay
  useEffect(() => {
    const timer = setTimeout(() => setShowOverlay(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden">

      {/* ── Background Video ───────────────────────────────────── */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/splash-video.mp4"
        autoPlay
        muted
        playsInline
        loop
        data-testid="splash-video"
      />

      {/* ── Dark gradient overlay (always visible, subtle) ─────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* ── Main Overlay Content (fades in after 6s) ───────────── */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center
          transition-all duration-1000 ease-out
          ${showOverlay ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        data-testid="splash-overlay"
      >
        {/* Logo mark */}
        <div className="mb-6">
          <svg
            aria-label="AggregateIQ logo"
            viewBox="0 0 48 48"
            className="w-16 h-16 mx-auto drop-shadow-lg"
          >
            <circle cx="24" cy="24" r="22" fill="hsl(183 98% 22% / 0.25)" />
            <polygon
              points="24,5 42,15 42,33 24,43 6,33 6,15"
              fill="none"
              stroke="hsl(183 98% 70%)"
              strokeWidth="2.5"
            />
            <circle cx="24" cy="24" r="6" fill="hsl(183 98% 70%)" />
            <line x1="24" y1="5"  x2="24" y2="18" stroke="hsl(183 98% 70%)" strokeWidth="2" />
            <line x1="42" y1="15" x2="31" y2="20" stroke="hsl(183 98% 70%)" strokeWidth="2" />
            <line x1="42" y1="33" x2="31" y2="28" stroke="hsl(183 98% 70%)" strokeWidth="2" />
            <line x1="24" y1="43" x2="24" y2="30" stroke="hsl(183 98% 70%)" strokeWidth="2" />
            <line x1="6"  y1="33" x2="17" y2="28" stroke="hsl(183 98% 70%)" strokeWidth="2" />
            <line x1="6"  y1="15" x2="17" y2="20" stroke="hsl(183 98% 70%)" strokeWidth="2" />
          </svg>
        </div>

        {/* Welcome text */}
        <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-3 drop-shadow">
          Tanzania Pavement Engineering · 2026
        </p>
        <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-tight mb-3 drop-shadow-lg">
          Welcome to AggregateIQ
        </h1>
        <p className="text-white/80 text-base sm:text-lg max-w-md leading-relaxed drop-shadow mb-10">
          Bitumen-Aggregate Adhesivity Companion for road construction in Tanzania.
        </p>

        {/* Go button */}
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30
            hover:border-white/60 text-white font-semibold text-lg px-8 py-3.5 rounded-full
            backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl
            hover:shadow-black/30"
          data-testid="button-splash-go"
        >
          Go
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        <p className="text-white/40 text-xs mt-6">
          Click to enter the application
        </p>
      </div>

    </div>
  );
}
