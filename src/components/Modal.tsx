import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = ""
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "var(--space-md)"
      }}
    >
      <div
        className={`modal ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-medium)",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto"
        }}
      >
        {title && (
          <div className="modal-header" style={{
            padding: "var(--space-lg)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "var(--font-size-lg)",
              fontWeight: "600",
              color: "var(--text)"
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "var(--font-size-lg)",
                padding: "var(--space-xs)"
              }}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}
        <div className="modal-content" style={{
          padding: title ? "var(--space-lg)" : "var(--space-xl)"
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

