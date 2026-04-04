import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
  className?: string;
}

export default function Input({
  label,
  error,
  help,
  className = "",
  id,
  ...props
}: InputProps) {
  const uid = useId();
  const inputId = id ?? `qf-in-${uid}`;
  const errId = `${inputId}-err`;
  const helpId = `${inputId}-help`;
  const describedBy = [error ? errId : null, help && !error ? helpId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="input-label"
          style={{
            display: "block",
            marginBottom: "var(--space-xs)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "500",
            color: "var(--text)",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? "error" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error && (
        <div
          id={errId}
          className="input-error"
          role="alert"
          style={{
            marginTop: "var(--space-xs)",
            fontSize: "var(--font-size-xs)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}
      {help && !error && (
        <div
          id={helpId}
          className="input-help"
          style={{
            marginTop: "var(--space-xs)",
            fontSize: "var(--font-size-xs)",
            color: "var(--muted)",
          }}
        >
          {help}
        </div>
      )}
    </div>
  );
}
