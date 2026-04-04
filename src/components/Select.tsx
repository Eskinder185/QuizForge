import React, { useId } from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  help?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export default function Select({
  label,
  error,
  help,
  options,
  placeholder,
  className = "",
  id,
  ...props
}: SelectProps) {
  const uid = useId();
  const selectId = id ?? `qf-sel-${uid}`;
  const errId = `${selectId}-err`;
  const helpId = `${selectId}-help`;
  const describedBy = [error ? errId : null, help && !error ? helpId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`select-group ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="select-label"
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
      <select
        id={selectId}
        className={`input ${error ? "error" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div
          id={errId}
          className="select-error"
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
          className="select-help"
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
