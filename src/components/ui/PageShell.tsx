import React from "react";
import { StaggerChildren } from "../../motion/StaggerChildren";

export type PageShellVariant = "default" | "landing" | "document" | "workspace";

const variantClass: Record<PageShellVariant, string> = {
  default: "page-stack",
  landing: "page-stack page-stack--landing",
  document: "page-stack page-stack--document",
  workspace: "page-stack page-stack--workspace",
};

export type PageShellProps = {
  variant?: PageShellVariant;
  /** Staggered fade-up for direct children (e.g. Home bands) */
  staggerChildren?: boolean;
  children: React.ReactNode;
  className?: string;
};

/**
 * Consistent vertical rhythm for every route. Route enter/exit is handled in AppShell (Framer Motion).
 */
export function PageShell({ variant = "default", staggerChildren, children, className = "" }: PageShellProps) {
  const cls = `${variantClass[variant]} ${className}`.trim();
  if (staggerChildren) {
    return <StaggerChildren className={cls}>{children}</StaggerChildren>;
  }
  return <div className={cls}>{children}</div>;
}
