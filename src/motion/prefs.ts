import type { Transition } from "framer-motion";

/** Matches design tokens — fast settle, no bounce */
export const easePremium: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const routeEnter: Transition = {
  duration: 0.32,
  ease: easePremium,
};

export const routeExit: Transition = {
  duration: 0.18,
  ease: easePremium,
};

export const staggerItem: Transition = {
  duration: 0.26,
  ease: easePremium,
};
