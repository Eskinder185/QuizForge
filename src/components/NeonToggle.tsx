import React from "react";

type PaletteId = "cyan" | "rose" | "lime" | "amber" | "violet";

const PALETTES: Record<PaletteId, { label: string; vars: Record<string, string> }> = {
  cyan:  { label: "Cyan",  vars: { 
    "--accent": "#22d3ee",
    "--qf-c1":  "#22d3ee66", "--qf-c2": "#a78bfa55", "--qf-c3": "#f43f5e55",
    "--qf-glow-a": "#22d3ee2a", "--qf-glow-b": "#a78bfa20"
  }},
  rose:  { label: "Rose",  vars: { 
    "--accent": "#f43f5e",
    "--qf-c1":  "#f43f5e66", "--qf-c2": "#22d3ee55", "--qf-c3": "#a78bfa55",
    "--qf-glow-a": "#f43f5e22", "--qf-glow-b": "#22d3ee18"
  }},
  lime:  { label: "Lime",  vars: {
    "--accent": "#84cc16",
    "--qf-c1":  "#84cc1666", "--qf-c2": "#10b98155", "--qf-c3": "#22d3ee55",
    "--qf-glow-a": "#84cc1622", "--qf-glow-b": "#10b98118"
  }},
  amber: { label: "Amber", vars: {
    "--accent": "#f59e0b",
    "--qf-c1":  "#f59e0b66", "--qf-c2": "#f43f5e55", "--qf-c3": "#22d3ee55",
    "--qf-glow-a": "#f59e0b22", "--qf-glow-b": "#f43f5e18"
  }},
  violet:{ label: "Violet",vars: {
    "--accent": "#a78bfa",
    "--qf-c1":  "#a78bfa66", "--qf-c2": "#22d3ee55", "--qf-c3": "#f43f5e55",
    "--qf-glow-a": "#a78bfa22", "--qf-glow-b": "#22d3ee18"
  }},
};

const KEY = "qf_neon";

function applyPalette(id: PaletteId) {
  const root = document.documentElement;
  root.setAttribute("data-neon", id);
  const p = PALETTES[id];
  Object.entries(p.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem(KEY, id);
}

function nextOf(id: PaletteId): PaletteId {
  const keys = Object.keys(PALETTES) as PaletteId[];
  return keys[(keys.indexOf(id) + 1) % keys.length];
}

export default function NeonToggle() {
  const [id, setId] = React.useState<PaletteId>(() => {
    const saved = localStorage.getItem(KEY) as PaletteId | null;
    return saved && PALETTES[saved] ? saved : "cyan";
  });

  React.useEffect(() => { applyPalette(id); }, [id]);

  const handleClick = () => setId(prev => nextOf(prev));

  const label = PALETTES[id].label;
  return (
    <button
      aria-label={`Switch neon color (current ${label})`}
      title={`Neon: ${label} — click to change`}
      onClick={handleClick}
      className="btn"
      style={{ display:"inline-flex", alignItems:"center", gap:8 }}
    >
      <span className="neon-swatch" aria-hidden />
      {label}
    </button>
  );
}
