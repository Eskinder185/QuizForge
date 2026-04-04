import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import * as m from "framer-motion/m";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
import { routeEnter, routeExit } from "../motion/prefs";

/**
 * App chrome + keyed outlet for route-level enter/exit (minimal cross-fade + nudge).
 */
export default function AppShell() {
  const location = useLocation();
  const reduce = useReducedMotion();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="container page-content app-shell__main">
        <AnimatePresence mode="wait">
          <m.div
            key={location.pathname}
            className="qf-route-stage"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduce
                ? { opacity: 1, y: 0, transition: { duration: 0 } }
                : { opacity: 0, y: -6, transition: routeExit }
            }
            transition={reduce ? { duration: 0 } : routeEnter}
          >
            <Outlet />
          </m.div>
        </AnimatePresence>
      </main>
      <SiteFooter />
    </div>
  );
}
