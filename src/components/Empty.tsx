import React from "react";
import { Link } from "react-router-dom";

export type AppFlowStep = "build" | "study" | "exam" | "results";

const FLOW_LABELS = ["Build", "Study", "Exam", "Results"] as const;
const STEP_INDEX: Record<AppFlowStep, number> = {
  build: 0,
  study: 1,
  exam: 2,
  results: 3,
};

function EmptyGlyph() {
  return (
    <svg className="empty-state__glyph" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="10" y="12" width="28" height="7" rx="2" fill="currentColor" opacity="0.22" />
      <rect x="10" y="23" width="18" height="7" rx="2" fill="currentColor" opacity="0.14" />
      <rect x="10" y="34" width="22" height="7" rx="2" fill="currentColor" opacity="0.1" />
    </svg>
  );
}

function FlowHint({ step }: { step: AppFlowStep }) {
  const current = STEP_INDEX[step];
  return (
    <div className="empty-flow-hint" role="navigation" aria-label="Typical flow through QuizForge">
      <span className="empty-flow-hint-label">Flow</span>
      {FLOW_LABELS.map((label, i) => (
        <React.Fragment key={label}>
          {i > 0 && <span className="empty-flow-sep" aria-hidden>·</span>}
          <span
            className="empty-flow-step"
            data-current={i === current ? "true" : undefined}
            {...(i === current ? { "aria-current": "step" as const } : {})}
          >
            {label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export type EmptyProps = {
  title: string;
  body: string;
  /** Extra line (e.g. reassurance or “what happens next”) */
  hint?: string;
  /** Highlights this screen in the Build → Study → Exam → Results journey */
  flowStep?: AppFlowStep;
  /** Primary navigation CTA (link) */
  cta?: string;
  to?: string;
  /** Use when the best next step is an in-page action */
  primaryAction?: { label: string; onClick: () => void };
  /** Second link (e.g. Study + Exam) */
  secondaryCta?: string;
  secondaryTo?: string;
  children?: React.ReactNode;
};

/**
 * Shared empty state: explains why the screen is empty, what to do next, and optional flow context.
 */
export default function Empty({
  title,
  body,
  hint,
  flowStep,
  cta,
  to,
  primaryAction,
  secondaryCta,
  secondaryTo,
  children,
}: EmptyProps) {
  const hasLinkPrimary = Boolean(cta && to);
  const linkVariant = primaryAction ? "secondary" : "primary";

  return (
    <div className="empty-state">
      {flowStep && <FlowHint step={flowStep} />}
      <EmptyGlyph />
      <h2 className="section-title">{title}</h2>
      <p className="lead" style={{ marginBottom: hint ? "var(--space-sm)" : "var(--space-md)" }}>
        {body}
      </p>
      {hint ? <p className="empty-state-hint">{hint}</p> : null}

      {(primaryAction || hasLinkPrimary || (secondaryCta && secondaryTo)) && (
        <div className="empty-state-actions">
          {primaryAction && (
            <button type="button" className="btn primary" onClick={primaryAction.onClick}>
              {primaryAction.label}
            </button>
          )}
          {hasLinkPrimary && (
            <Link to={to!} className={`btn ${linkVariant}`}>
              {cta}
            </Link>
          )}
          {secondaryCta && secondaryTo && (
            <Link to={secondaryTo} className="btn secondary">
              {secondaryCta}
            </Link>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
