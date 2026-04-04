import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/theme.css";
import "./index.css";

document.documentElement.classList.remove("hc", "bg-off");
try {
  localStorage.removeItem("qf_hc");
  localStorage.removeItem("qf_bg");
} catch {
  /* ignore */
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
