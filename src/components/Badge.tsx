import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export default function Badge({
  children,
  variant = "default",
  className = ""
}: BadgeProps) {
  const baseClasses = "badge";
  const variantClasses = {
    default: "",
    success: "success",
    warning: "warning", 
    danger: "danger"
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      {children}
    </span>
  );
}
