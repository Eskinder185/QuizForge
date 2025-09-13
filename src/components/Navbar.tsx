import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../store/app";

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
        padding: "16px 24px", 
        display: "flex", 
        alignItems: "center", 
        gap: "24px", 
        justifyContent: "space-between",
        marginBottom: "20px",
        backdropFilter: "blur(20px)",
        background: "rgba(255, 255, 255, 0.08)"
      }}
    >
      <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "btn primary" : "btn ghost"} 
          end
        >
          Home
        </NavLink>
        <NavLink 
          to="/build" 
          className={({ isActive }) => isActive ? "btn primary" : "btn ghost"}
        >
          Build
        </NavLink>
        <NavLink 
          to="/study" 
          className={({ isActive }) => isActive ? "btn primary" : "btn ghost"}
        >
          Study
        </NavLink>
        <NavLink 
          to="/exam" 
          className={({ isActive }) => isActive ? "btn primary" : "btn ghost"}
        >
          Exam
        </NavLink>
        <NavLink 
          to="/results" 
          className={({ isActive }) => isActive ? "btn primary" : "btn ghost"}
        >
          Results
        </NavLink>
        <NavLink 
          to="/about" 
          className={({ isActive }) => isActive ? "btn primary" : "btn ghost"}
        >
          About
        </NavLink>
      </nav>
      
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={bgOn}
            onChange={e => setBgOn(e.target.checked)}
            style={{ 
              accentColor: "var(--accent)", 
              width: "16px", 
              height: "16px",
              cursor: "pointer"
            }}
            aria-label="Toggle animated background"
          />
          Background
        </label>
        
        <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={hc}
            onChange={e => setHc(e.target.checked)}
            style={{ 
              accentColor: "var(--accent)", 
              width: "16px", 
              height: "16px",
              cursor: "pointer"
            }}
            aria-label="Toggle high contrast mode"
          />
          High contrast
        </label>
        
        <button
          onClick={handleExport}
          className="btn ghost"
          style={{ fontSize: "12px" }}
        >
          Export
        </button>
        <button
          onClick={handleImport}
          className="btn ghost"
          style={{ fontSize: "12px" }}
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
          className="btn ghost"
          style={{ fontWeight: 600 }}
        >
          GitHub
        </a>
      </div>
    </header>
  );
};

export default Navbar;
