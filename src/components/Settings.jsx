import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Settings as Gear } from 'lucide-react';
import { digitalClock } from '../modules/digitalClock.js';
import { soundFx } from '../modules/audioSynthesizer.js';

const spring = { type: 'spring', stiffness: 500, damping: 34, mass: 0.8 };

/** iOS-style switch: the knob stretches slightly while pressed. */
function Switch({ on, onChange, label }) {
  const [down, setDown] = useState(false);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => setDown(false)}
      onPointerLeave={() => setDown(false)}
      className="relative h-[31px] w-[51px] shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        animate={{ backgroundColor: on ? '#f4b400' : 'rgba(255,255,255,0.14)' }}
        transition={{ duration: 0.25 }}
      />
      <motion.span
        layout
        transition={spring}
        className="absolute top-[2px] h-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        style={{ left: on ? 'auto' : 2, right: on ? 2 : 'auto' }}
        animate={{ width: down ? 34 : 27 }}
      />
    </button>
  );
}

function Item({ title, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-6 px-4 py-3">
      <div>
        <p className="text-[14px] font-medium">{title}</p>
        <p className="text-[12px] text-white/45">{hint}</p>
      </div>
      {children}
    </div>
  );
}

export default function Settings({ clock, nepali, onNepali }) {
  const [open, setOpen] = useState(false);
  const [chime, setChime] = useState(soundFx.hourlyChimeEnabled);
  const [tick, setTick] = useState(soundFx.tickSoundEnabled);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const is24 = clock?.is24Hour;
  const local = clock?.timeMode === 'local';

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        aria-label="Settings"
        aria-expanded={open}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        transition={spring}
        onClick={() => setOpen((o) => !o)}
        className="text-muted hover:text-foreground flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/[0.07]"
      >
        <motion.span animate={{ rotate: open ? 60 : 0 }} transition={spring} className="flex">
          <Gear className="size-4" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -6, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: -4, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            style={{ transformOrigin: 'top left' }}
            className="absolute top-11 left-0 z-50 w-[22rem] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] py-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl backdrop-saturate-150"
          >
            <Item title="24-hour time" hint={is24 ? '13:45' : '1:45 PM'}>
              <Switch label="24-hour time" on={!!is24} onChange={() => digitalClock.toggle24Hour()} />
            </Item>
            <div className="mx-4 h-px bg-white/10" />
            <Item title="Device time" hint={local ? 'Using your local timezone' : 'Nepal Time · UTC+5:45'}>
              <Switch label="Device time" on={local} onChange={() => digitalClock.toggleTimeMode()} />
            </Item>
            <div className="mx-4 h-px bg-white/10" />
            <Item title="Nepali numerals" hint={nepali ? '२०८३' : '2083'}>
              <Switch label="Nepali numerals" on={nepali} onChange={onNepali} />
            </Item>
            <div className="mx-4 h-px bg-white/10" />
            <Item title="Hourly chime" hint="A soft bowl on the hour">
              <Switch
                label="Hourly chime"
                on={chime}
                onChange={(v) => {
                  soundFx.hourlyChimeEnabled = v;
                  setChime(v);
                  if (v) soundFx.playTibetanBowl(280, 2.5);
                }}
              />
            </Item>
            <div className="mx-4 h-px bg-white/10" />
            <Item title="Tick sound" hint="Every second">
              <Switch
                label="Tick sound"
                on={tick}
                onChange={(v) => {
                  soundFx.tickSoundEnabled = v;
                  setTick(v);
                }}
              />
            </Item>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
