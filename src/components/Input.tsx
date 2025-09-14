import React from "react";

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
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label" style={{ 
          display: "block", 
          marginBottom: "var(--space-xs)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "500",
          color: "var(--text)"
        }}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? "error" : ""}`}
        {...props}
      />
      {error && (
        <div className="input-error" style={{
          marginTop: "var(--space-xs)",
          fontSize: "var(--font-size-xs)",
          color: "var(--danger)"
        }}>
          {error}
        </div>
      )}
      {help && !error && (
        <div className="input-help" style={{
          marginTop: "var(--space-xs)",
          fontSize: "var(--font-size-xs)",
          color: "var(--muted)"
        }}>
          {help}
        </div>
      )}
    </div>
  );
}
