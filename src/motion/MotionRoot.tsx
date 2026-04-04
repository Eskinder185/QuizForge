import React from "react";
import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Lazy-loads the DOM animation feature bundle (~smaller than full motion).
 * All animated surfaces use `m` from `framer-motion/m` under this tree.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
