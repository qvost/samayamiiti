import { useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { EASE_APPLE, Ghost } from './ui.jsx';
import DustClock from './DustClock.jsx';

export default function Fullscreen({ clock, onClose }) {
  useEffect(() => {
    // Intercept 'f' and 'Escape' directly while fullscreen overlay is active
    const onKeyDown = (e) => {
      if (e.key === 'f' || e.key === 'F' || e.code === 'KeyF' || e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [onClose]);

  if (!clock) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.01, filter: 'blur(8px)' }}
      transition={{ duration: 0.45, ease: EASE_APPLE }}
      className="fixed inset-0 z-[60] bg-black"
    >
      <DustClock text={`${clock.hours}:${clock.minutes}:${clock.seconds}`} />
      <Ghost onClick={onClose} aria-label="Exit fullscreen" className="absolute top-8 right-8 sm:right-10">
        <X className="size-5" />
      </Ghost>
    </motion.div>
  );
}
