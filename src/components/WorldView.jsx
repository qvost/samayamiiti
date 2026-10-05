import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { EASE_APPLE, Eyebrow } from './ui.jsx';

export default function WorldView({ clock }) {
  if (!clock) return null;
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045 } } }}
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_APPLE } } }}>
        <Eyebrow>World · relative to Kathmandu</Eyebrow>
      </motion.div>
      <ul className="dim-list">
        {clock.worldClocks.map((c) => (
          <motion.li
            key={c.id}
            variants={{ hidden: { opacity: 0, y: 12, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.45, ease: EASE_APPLE } } }}
            className="border-line flex items-baseline gap-6 border-b py-4 text-sm last:border-0"
          >
            <span className="min-w-0 flex-1">
              <span className="font-medium">{c.name}</span>
              <span className="text-faint ml-3">{c.country}</span>
            </span>
            <span className="text-faint hidden tabular sm:block">{c.dateStr}</span>
            <span className="text-muted w-36 whitespace-nowrap text-right tabular">{c.diff}</span>
            <span className="tabular w-32 text-right text-lg font-semibold tracking-tight">
              {c.hours}:{c.minutes}
              <span className="text-faint text-xs">:{c.seconds}</span>
              <span className="text-muted ml-1.5 text-xs">{c.ampm}</span>
            </span>
            {c.isDay ? <Sun className="text-accent size-3.5" /> : <Moon className="text-faint size-3.5" />}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
