import React from "react";
import { useReducedMotion } from "framer-motion";
import * as m from "framer-motion/m";
import { easePremium } from "../motion/prefs";

export default function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const reduce = useReducedMotion();
  return (
    <div className="segmented-strip">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <m.button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={"btn " + (active ? "primary" : "ghost")}
            whileTap={reduce ? undefined : { scale: 0.985 }}
            transition={{ duration: 0.09, ease: easePremium }}
          >
            {o.label}
          </m.button>
        );
      })}
    </div>
  );
}
