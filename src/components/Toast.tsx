import React, { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "warning" | "error";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "success",
  duration = 4000,
  onClose
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 150); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      background: "rgba(16, 185, 129, 0.1)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      color: "var(--success)"
    },
    warning: {
      background: "rgba(245, 158, 11, 0.1)",
      borderColor: "rgba(245, 158, 11, 0.3)",
      color: "var(--warn)"
    },
    error: {
      background: "rgba(244, 63, 94, 0.1)",
      borderColor: "rgba(244, 63, 94, 0.3)",
      color: "var(--danger)"
    }
  };

  return (
    <div
      className="toast"
      style={{
        position: "fixed",
        bottom: "var(--space-lg)",
        right: "var(--space-lg)",
        background: typeStyles[type].background,
        border: `1px solid ${typeStyles[type].borderColor}`,
        borderRadius: "var(--radius-md)",
        padding: "var(--space-md)",
        color: typeStyles[type].color,
        fontSize: "var(--font-size-sm)",
        fontWeight: "500",
        boxShadow: "var(--shadow-soft)",
        zIndex: 1001,
        maxWidth: "300px",
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        opacity: isVisible ? 1 : 0,
        transition: "all var(--transition-normal)",
        role: "alert",
        "aria-live": "polite"
      }}
    >
      {message}
    </div>
  );
}
