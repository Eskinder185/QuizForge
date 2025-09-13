import React from "react";
import { useLocation } from "react-router-dom";
import "./Backdrop.css";

type RouteMode = "home" | "build" | "study" | "exam" | "library" | "results" | "about";

export default function Backdrop() {
  const location = useLocation();

  // Get route mode from pathname
  const getRouteMode = (pathname: string): RouteMode => {
    if (pathname === "/") return "home";
    if (pathname.startsWith("/build")) return "build";
    if (pathname.startsWith("/study")) return "study";
    if (pathname.startsWith("/exam")) return "exam";
    if (pathname.startsWith("/library")) return "library";
    if (pathname.startsWith("/results")) return "results";
    if (pathname.startsWith("/about")) return "about";
    return "home";
  };

  const mode = getRouteMode(location.pathname);

  return (
    <div 
      className="backdrop-layer"
      data-mode={mode}
      aria-hidden="true"
    >
      {/* Animated SVG Background */}
      <svg
        className="backdrop-svg"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15
        }}
      >
        {/* Flowing Wave Lines */}
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(244, 114, 182, 0.3)" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
            <stop offset="50%" stopColor="rgba(34, 211, 238, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0.2)" />
          </linearGradient>
          <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(244, 114, 182, 0.2)" />
            <stop offset="50%" stopColor="rgba(16, 185, 129, 0.3)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.2)" />
          </linearGradient>
        </defs>

        {/* Wave 1 - Top flowing line */}
        <path
          d="M0,150 Q300,100 600,150 T1200,150 L1200,0 L0,0 Z"
          fill="url(#waveGradient1)"
          className="wave-path wave-1"
        />

        {/* Wave 2 - Middle flowing line */}
        <path
          d="M0,400 Q400,350 800,400 T1200,400 L1200,200 L0,200 Z"
          fill="url(#waveGradient2)"
          className="wave-path wave-2"
        />

        {/* Wave 3 - Bottom flowing line */}
        <path
          d="M0,650 Q200,600 400,650 T800,650 Q1000,700 1200,650 L1200,450 L0,450 Z"
          fill="url(#waveGradient3)"
          className="wave-path wave-3"
        />

        {/* Animated connecting lines */}
        <path
          d="M100,200 Q300,300 500,200 T900,200"
          stroke="rgba(34, 211, 238, 0.4)"
          strokeWidth="2"
          fill="none"
          className="connecting-line line-1"
        />
        <path
          d="M200,500 Q400,400 600,500 T1000,500"
          stroke="rgba(139, 92, 246, 0.4)"
          strokeWidth="2"
          fill="none"
          className="connecting-line line-2"
        />
        <path
          d="M50,600 Q250,550 450,600 T850,600"
          stroke="rgba(244, 114, 182, 0.4)"
          strokeWidth="2"
          fill="none"
          className="connecting-line line-3"
        />

        {/* Flowing dots/circles */}
        <circle cx="200" cy="100" r="3" fill="rgba(34, 211, 238, 0.6)" className="flowing-dot dot-1" />
        <circle cx="600" cy="300" r="2" fill="rgba(139, 92, 246, 0.6)" className="flowing-dot dot-2" />
        <circle cx="1000" cy="500" r="4" fill="rgba(244, 114, 182, 0.6)" className="flowing-dot dot-3" />
        <circle cx="400" cy="700" r="2.5" fill="rgba(16, 185, 129, 0.6)" className="flowing-dot dot-4" />
        <circle cx="800" cy="150" r="3.5" fill="rgba(34, 211, 238, 0.6)" className="flowing-dot dot-5" />
      </svg>

      {/* Subtle overlay for depth */}
      <div 
        className="backdrop-overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(11, 15, 20, 0.1) 100%)",
          pointerEvents: "none"
        }}
      />
    </div>
  );
}
