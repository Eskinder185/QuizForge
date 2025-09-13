import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME, TAGLINE } from "../config/brand";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Hero Section */}
      <section className="card" style={{ textAlign: "center", padding: "48px 24px", marginBottom: "32px" }}>
        <h1 
          style={{ 
            fontSize: "var(--font-size-3xl)", 
            fontWeight: 700, 
            letterSpacing: "var(--letter-spacing-tight)",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--success) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "16px"
          }}
        >
          {APP_NAME}
        </h1>
        <p style={{ 
          fontSize: "var(--font-size-lg)", 
          color: "var(--text-muted)", 
          maxWidth: "600px", 
          margin: "0 auto 32px",
          lineHeight: 1.6
        }}>
          {TAGLINE}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <Link to="/build" className="btn primary" style={{ fontSize: "var(--font-size-lg)", padding: "16px 32px", minWidth: "160px" }}>
            Create a Quiz
          </Link>
          <Link to="/study" className="btn secondary" style={{ fontSize: "var(--font-size-lg)", padding: "16px 32px", minWidth: "160px" }}>
            Start Studying
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        <FeatureCard 
          title="Adaptive Review" 
          body="FSRS-style scheduling with intelligent spacing and 'Why now?' insights." 
          to="/study" 
        />
        <FeatureCard 
          title="AI-Powered Study" 
          body="Smart question generation and personalized study coaching." 
          to="/build" 
        />
        <FeatureCard 
          title="Exam Simulator" 
          body="Realistic exam presets with timing, flags, and performance analytics." 
          to="/exam" 
        />
      </section>

      {/* How it works */}
      <section className="card" style={{ textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 600, margin: 0 }}>
            How it works
          </h2>
          <p style={{ fontSize: "var(--font-size-base)", color: "var(--text-muted)", margin: 0 }}>
            Build → Study → Exam → Results. Stay local, stay focused.
          </p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, body, to }: { title: string; body: string; to: string }) {
  return (
    <Link 
      to={to} 
      className="card"
      style={{ 
        display: "block", 
        textDecoration: "none", 
        color: "inherit",
        transition: "all 150ms ease",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ fontSize: "var(--font-size-lg)", fontWeight: 600, marginBottom: "12px" }}>
        {title}
      </div>
      <div style={{ fontSize: "var(--font-size-base)", color: "var(--text-muted)", marginBottom: "20px", lineHeight: 1.5, flex: 1 }}>
        {body}
      </div>
      <div style={{ fontSize: "var(--font-size-base)", color: "var(--accent)", fontWeight: 500, alignSelf: "flex-start" }}>
        Learn more →
      </div>
    </Link>
  );
}
