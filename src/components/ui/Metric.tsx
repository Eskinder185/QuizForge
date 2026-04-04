import React from "react";

export type MetricProps = {
  kicker: string;
  value: React.ReactNode;
  hint: string;
  valueClassName?: string;
};

/**
 * Single analytics stat — uses results-* typography tokens.
 */
export function Metric({ kicker, value, hint, valueClassName = "results-stat-value" }: MetricProps) {
  return (
    <div className="results-stat-card qf-metric">
      <p className="results-stat-kicker">{kicker}</p>
      <p className={valueClassName}>{value}</p>
      <p className="results-stat-hint">{hint}</p>
    </div>
  );
}
