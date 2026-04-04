import React, { useRef } from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../store/app";
import NeonToggle from "./NeonToggle";

const GITHUB_URL = "https://github.com/Eskinder185/QuizForge";
const PORTFOLIO_URL = "https://eskinder.dev/";

const Navbar: React.FC = () => {
  const { state, dispatch } = useApp();
  const hasDataToExport =
    state.quizzes.length > 0 || state.examAttempts.length > 0 || state.practiceAttempts.length > 0;
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
    <header className="site-header">
      <div className="container site-header__inner">
        <nav
          aria-label="Main navigation"
          style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)", flexWrap: "wrap" }}
        >
          <NavLink to="/" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`} end>
            Home
          </NavLink>
          <NavLink to="/build" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}>
            Build
          </NavLink>
          <NavLink to="/study" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}>
            Study
          </NavLink>
          <NavLink to="/exam" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}>
            Exam
          </NavLink>
          <NavLink to="/results" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}>
            Results
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}>
            About
          </NavLink>
        </nav>

        <div className="site-header__actions" role="group" aria-label="Theme, data, and links">
          <NeonToggle />

          <button
            type="button"
            onClick={handleExport}
            className="btn ghost sm"
            disabled={!hasDataToExport}
            title={
              hasDataToExport
                ? "Download quizzes, attempts, and presets as a JSON backup"
                : "Create a quiz or finish a study or exam session first—then you can back up your work"
            }
          >
            Export
          </button>
          <button
            type="button"
            onClick={handleImport}
            className="btn ghost sm"
            title="Restore data from a QuizForge JSON file"
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
            aria-label="QuizForge on GitHub (opens in a new tab)"
          >
            GitHub
          </a>
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn secondary sm nav-portfolio"
            aria-label="Eskinder's portfolio site (opens in a new tab)"
          >
            Portfolio
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
