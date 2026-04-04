import React from "react";

export type ToolbarProps = {
  children: React.ReactNode;
  className?: string;
  /** Visually merge with content above (no top border) */
  flushTop?: boolean;
};

/**
 * Filter / action row shared across Study, Library, etc.
 */
export function Toolbar({ children, className = "", flushTop }: ToolbarProps) {
  const flush = flushTop ? " toolbar-row--flush-top" : "";
  return <div className={`toolbar-row${flush} ${className}`.trim()}>{children}</div>;
}
