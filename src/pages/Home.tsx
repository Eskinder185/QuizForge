import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME, HOME_LEDE } from "../config/brand";
import { PageShell } from "../components/ui";

const FLOW_STEPS = [
  {
    to: "/build",
    title: "Build",
    desc: "Author questions, attach sources, and shape quizzes that match what you actually need to learn.",
    Icon: IconBuild,
  },
  {
    to: "/study",
    title: "Study",
    desc: "Run review and practice sessions with spacing that adapts to how confident you feel on each topic.",
    Icon: IconStudy,
  },
  {
    to: "/exam",
    title: "Exam",
    desc: "Simulate test conditions with timing and structure so the real sitting feels familiar, not frantic.",
    Icon: IconExam,
  },
  {
    to: "/results",
    title: "Results",
    desc: "See how you performed, spot weak areas, and decide what to revisit before the next session.",
    Icon: IconResults,
  },
] as const;

export default function Home() {
  return (
    <PageShell variant="landing" staggerChildren>
      <section className="home-hero" aria-labelledby="home-hero-heading">
        <p className="home-hero-eyebrow">Private · Local · Exam-focused</p>
        <h1 id="home-hero-heading" className="home-hero-title">
          {APP_NAME}
        </h1>
        <p className="home-hero-lede">{HOME_LEDE}</p>

        <div className="home-cta-grid">
          <div className="home-cta-block">
            <Link to="/build" className="btn primary lg" style={{ minWidth: "11.5rem" }}>
              Build a quiz
            </Link>
            <p className="home-cta-hint">Start here: add questions, topics, and optional sources.</p>
          </div>
          <div className="home-cta-block">
            <Link to="/study" className="btn secondary lg" style={{ minWidth: "11.5rem" }}>
              Open Study
            </Link>
            <p className="home-cta-hint">Pick up adaptive review or practice when you are ready to rehearse.</p>
          </div>
        </div>
      </section>

      <section className="content-section home-flow" aria-labelledby="home-flow-heading">
        <div className="home-flow-head">
          <h2 id="home-flow-heading" className="section-title" style={{ marginBottom: "var(--space-sm)" }}>
            How you move through the app
          </h2>
          <p className="lead" style={{ margin: 0, maxWidth: "40rem", marginInline: "auto" }}>
            A straight path from material to confidence—each step has a dedicated space in the product.
          </p>
        </div>
        <div className="home-flow-grid">
          {FLOW_STEPS.map((step, i) => {
            const StepIcon = step.Icon;
            return (
              <Link
                key={step.title}
                to={step.to}
                className="home-flow-step"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <p className="home-flow-index">
                  Step {i + 1} · {step.title}
                </p>
                <div className="home-flow-icon" aria-hidden>
                  <StepIcon />
                </div>
                <h3 className="home-flow-step-title">{step.title}</h3>
                <p className="home-flow-step-desc">{step.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="home-features-heading">
        <h2 id="home-features-heading" className="home-section-heading">
          Capabilities
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(17.5rem, 1fr))",
            gap: "var(--space-xl)",
          }}
        >
        <FeatureCard
          kicker="Study"
          title="Adaptive review"
          body="Scheduling that respects memory—review more of what slips and less of what sticks, with calibration-friendly feedback."
          detail="Useful when you are preparing over weeks, not cramming the night before."
          to="/study"
          icon={<IconFeatureLayers />}
        />
        <FeatureCard
          kicker="Build"
          title="AI-assisted authoring"
          body="Draft and refine questions with coaching in the loop, so you spend time on understanding—not on busywork."
          detail="Optional help stays on your device; you remain in control of what gets saved."
          to="/build"
          icon={<IconFeatureSpark />}
        />
        <FeatureCard
          kicker="Exam"
          title="Timed exam practice"
          body="Presets and pacing that mirror serious tests: less guessing, more repeatable routines before the real attempt."
          detail="Pair with Results to see where time and accuracy diverge."
          to="/exam"
          icon={<IconFeatureTimer />}
        />
        </div>
      </section>

      <section className="content-section home-outro">
        <p>
          Export or import JSON when you need a backup. One calm workspace for your material—without extra steps in
          the way.
        </p>
      </section>
    </PageShell>
  );
}

function FeatureCard({
  kicker,
  title,
  body,
  detail,
  to,
  icon,
}: {
  kicker: string;
  title: string;
  body: string;
  detail: string;
  to: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        height: "100%",
        marginBottom: 0,
      }}
    >
      <span className="home-flow-index" style={{ marginBottom: "var(--space-sm)" }}>
        {kicker}
      </span>
      <div className="home-feature-icon" aria-hidden>
        {icon}
      </div>
      <div className="section-title" style={{ marginBottom: "var(--space-sm)", fontSize: "var(--font-size-lg)" }}>
        {title}
      </div>
      <p className="lead" style={{ marginBottom: "var(--space-md)", flex: 1 }}>
        {body}
      </p>
      <p className="text-xs text-muted" style={{ margin: "0 0 var(--space-lg)", lineHeight: 1.5 }}>
        {detail}
      </p>
      <span className="text-sm font-medium text-accent" style={{ alignSelf: "flex-start" }}>
        Open {kicker.toLowerCase()} →
      </span>
    </Link>
  );
}

function strokeIcon() {
  return {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.65,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
}

function IconBuild() {
  return (
    <svg {...strokeIcon()}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  );
}

function IconStudy() {
  return (
    <svg {...strokeIcon()}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8M8 11h6" />
    </svg>
  );
}

function IconExam() {
  return (
    <svg {...strokeIcon()}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M9 4v16" />
      <path d="M14 15h.01M17 15h.01" />
    </svg>
  );
}

function IconResults() {
  return (
    <svg {...strokeIcon()}>
      <path d="M3 3v18h18" />
      <path d="M7 16V10M12 16V6M17 16v-5" />
    </svg>
  );
}

function IconFeatureLayers() {
  return (
    <svg {...strokeIcon()}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </svg>
  );
}

function IconFeatureSpark() {
  return (
    <svg {...strokeIcon()}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconFeatureTimer() {
  return (
    <svg {...strokeIcon()}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 1.5M9 3h6" />
    </svg>
  );
}
