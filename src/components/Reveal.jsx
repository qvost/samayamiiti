import { motion } from 'motion/react';

export const EASE_APPLE = [0.32, 0.72, 0, 1];

/** Soft Apple-style rise: fade + slight lift + de-blur. */
export default function Reveal({ children, delay = 0, y = 16, className, once = true }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, delay, ease: EASE_APPLE }}
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({ children, className, gap = 0.06 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: EASE_APPLE },
  },
};
