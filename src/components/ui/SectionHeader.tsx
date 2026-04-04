import React from "react";

export type SectionHeaderProps = {
  title: string;
  /** For aria-labelledby on parent section */
  headingId?: string;
  description?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
};

/**
 * Reusable block title + optional lead + actions (analytics, settings pages).
 */
export function SectionHeader({ title, headingId, description, right, className = "" }: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`.trim()}>
      <div className="section-header__text">
        <h2 className="results-section-title" id={headingId}>
          {title}
        </h2>
        {description ? <div className="results-section-lead">{description}</div> : null}
      </div>
      {right ? <div className="section-header__actions">{right}</div> : null}
    </div>
  );
}
