import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../store/app";
import NeonToggle from "./NeonToggle";

const GITHUB_URL = "https://github.com/Eskinder185/FactForge";

function useHighContrast() {
  const [hc, setHc] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("qf_hc") === "1"
      : false
  );
  useEffect(() => {
    if (hc) {
      document.documentElement.classList.add("hc");
      localStorage.setItem("qf_hc", "1");
    } else {
      document.documentElement.classList.remove("hc");
      localStorage.setItem("qf_hc", "0");
    }
  }, [hc]);
  return [hc, setHc] as const;
}

function useBackgroundToggle() {
  const [bgOn, setBgOn] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("qf_bg") !== "0"
      : true
  );
  useEffect(() => {
    if (bgOn) {
      document.documentElement.classList.remove("bg-off");
      localStorage.setItem("qf_bg", "1");
    } else {
      document.documentElement.classList.add("bg-off");
      localStorage.setItem("qf_bg", "0");
    }
  }, [bgOn]);
  return [bgOn, setBgOn] as const;
}


const Navbar: React.FC = () => {
  const { dispatch } = useApp();
  const [hc, setHc] = useHighContrast();
  const [bgOn, setBgOn] = useBackgroundToggle();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    dispatch({ type: "exportData" });
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        dispatch({ type: "importData", data });
        alert("Data imported successfully!");
      } catch (error) {
        alert("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };
  
  return (
    <header 
      className="glass-panel" 
      style={{ 
        position: "sticky", 
        top: 0, 
        zIndex: 50,
        padding: "var(--pad-2) var(--pad-3)", 
        display: "flex", 
        alignItems: "center", 
        gap: "var(--space-lg)", 
        justifyContent: "space-between",
        marginBottom: "var(--space-lg)",
        backdropFilter: "blur(20px)",
        background: "var(--surface-1)",
        border: "1px solid var(--border-weak)",
        borderRadius: "var(--radius-lg)"
      }}
    >
      <nav style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexWrap: "wrap" }}>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
          end
        >
          Home
        </NavLink>
        <NavLink 
          to="/build" 
          className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
        >
          Build
        </NavLink>
        <NavLink 
          to="/study" 
          className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
        >
          Study
        </NavLink>
        <NavLink 
          to="/exam" 
          className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
        >
          Exam
        </NavLink>
        <NavLink 
          to="/results" 
          className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
        >
          Results
        </NavLink>
        <NavLink 
          to="/about" 
          className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
        >
          About
        </NavLink>
      </nav>
      
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", flexWrap: "wrap" }}>
        <NeonToggle />
        
        <label style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", fontSize: "var(--font-size-xs)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={bgOn}
            onChange={e => setBgOn(e.target.checked)}
            style={{ 
              accentColor: "var(--accent)", 
              width: "14px", 
              height: "14px",
              cursor: "pointer"
            }}
            aria-label="Toggle animated background"
          />
          Background
        </label>
        
        <label style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", fontSize: "var(--font-size-xs)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={hc}
            onChange={e => setHc(e.target.checked)}
            style={{ 
              accentColor: "var(--accent)", 
              width: "14px", 
              height: "14px",
              cursor: "pointer"
            }}
            aria-label="Toggle high contrast mode"
          />
          High contrast
        </label>
        
        <button
          onClick={handleExport}
          className="btn ghost sm"
        >
          Export
        </button>
        <button
          onClick={handleImport}
          className="btn ghost sm"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn ghost sm"
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Navbar;
