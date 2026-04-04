import React from "react";
import { useReducedMotion } from "framer-motion";
import * as m from "framer-motion/m";
import { staggerItem } from "./prefs";

export type StaggerChildrenProps = {
  className?: string;
  children: React.ReactNode;
  /** Delay before first child (seconds); keep small */
  delayChildren?: number;
  stagger?: number;
};

function childKey(child: React.ReactNode, index: number): React.Key {
  if (React.isValidElement(child) && child.key != null && child.key !== ".") {
    return child.key;
  }
  return index;
}

/**
 * Staggers direct children with a short fade + lift. Respects reduced motion.
 * Use for page bands (Home) or analytics sections (Results).
 */
export function StaggerChildren({
  className = "",
  children,
  delayChildren = 0.02,
  stagger = 0.04,
}: StaggerChildrenProps) {
  const reduce = useReducedMotion();
  const items = React.Children.toArray(children);

  const staggerSec = reduce ? 0 : stagger;
  const delaySec = reduce ? 0 : delayChildren;

  return (
    <m.div
      className={className}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerSec,
            delayChildren: delaySec,
          },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      {items.map((child, i) => (
        <m.div
          key={childKey(child, i)}
          className="motion-stagger-item"
          style={{ width: "100%", minWidth: 0 }}
          variants={{
            hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
            visible: {
              opacity: 1,
              y: 0,
              transition: staggerItem,
            },
          }}
        >
          {child}
        </m.div>
      ))}
    </m.div>
  );
}
