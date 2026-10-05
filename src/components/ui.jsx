import clsx from 'clsx';
import { motion } from 'motion/react';

export const cn = (...a) => clsx(a);

export const EASE_APPLE = [0.32, 0.72, 0, 1];

/** Small muted text button that brightens on hover, with a soft press. */
export function Ghost({ active, className, ...p }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.25, ease: EASE_APPLE }}
      {...p}
      className={cn(
        'pressable cursor-pointer rounded-full px-1 text-[13px]',
        active ? 'text-foreground' : 'text-muted hover:text-foreground',
        className
      )}
    />
  );
}

/** Hairline row: label ... value */
export function Row({ label, value, className }) {
  return (
    <li className={cn('flex items-baseline justify-between gap-6 border-b border-line py-3.5 text-sm last:border-0', className)}>
      <span className="text-muted">{label}</span>
      <span className="tabular text-foreground font-medium">{value}</span>
    </li>
  );
}

export function Eyebrow({ children }) {
  return <p className="text-faint mb-4 text-[11px] uppercase tracking-[0.18em]">{children}</p>;
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-faint mb-1 block text-[11px] uppercase tracking-[0.14em]">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full border-b border-line bg-transparent py-1.5 text-sm outline-none transition-colors focus:border-accent';
