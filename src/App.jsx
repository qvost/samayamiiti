import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ClickSpark from './components/rb/ClickSpark.tsx';
import ClockView from './components/ClockView.jsx';
import CalendarView from './components/CalendarView.jsx';
import ConverterView from './components/ConverterView.jsx';
import WorldView from './components/WorldView.jsx';
import Fullscreen from './components/Fullscreen.jsx';
import { EASE_APPLE } from './components/ui.jsx';
import { useClock } from './hooks/useEngines.js';
import { digitalClock } from './modules/digitalClock.js';
import GrainField from './components/GrainField.jsx';
import Settings from './components/Settings.jsx';
import { generateCalendarGrid, getCurrentNepaliDate } from './modules/nepaliCalendar.js';

const TABS = [
  ['clock', 'Clock'],
  ['calendar', 'Calendar'],
  ['convert', 'Convert'],
  ['world', 'World'],
];

export default function App() {
  const clock = useClock();
  const [tab, setTabState] = useState(() => {
    const h = location.hash.slice(1);
    return TABS.some(([id]) => id === h) ? h : 'clock';
  });
  const setTab = (t) => {
    history.replaceState(null, '', `#${t}`);
    setTabState(t);
  };
  const [nepali, setNepali] = useState(false);
  const [fs, setFs] = useState(false);

  // today's tithi, recomputed when the day changes
  const dayKey = clock ? clock.dateGregorian : '';
  const tithi = useMemo(() => {
    const t = getCurrentNepaliDate();
    return generateCalendarGrid(t.year, t.month).grid.find((c) => c.isToday)?.tithi;
  }, [dayKey]);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setFs(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement || fs) {
      exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setFs(true);
    }
  }, [fs, exitFullscreen]);

  useEffect(() => {
    const onKey = (e) => {
      const isF = e.key === 'f' || e.key === 'F' || e.code === 'KeyF';
      const isEsc = e.key === 'Escape' || e.code === 'Escape';
      if (!isF && !isEsc) return;

      const tag = document.activeElement?.tagName;
      const isInput = !fs && (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT');
      if (isInput) return;

      e.preventDefault();
      e.stopPropagation();

      if (isF) {
        toggleFullscreen();
      } else if (isEsc) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', onKey, true);
    const onFs = () => {
      setFs(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFs);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [fs, toggleFullscreen, exitFullscreen]);

  const toggleNepali = () => {
    digitalClock.useNepaliDigits = !nepali;
    setNepali(!nepali);
    digitalClock.tick();
  };

  return (
    <ClickSpark sparkColor="#f4b400" sparkSize={8} sparkRadius={18} sparkCount={8} duration={400}>
      <div className="relative min-h-screen">
        <GrainField />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-6 sm:px-10">
          <header className="glass-header sticky top-0 z-40 -mx-6 flex items-center justify-between bg-black/60 px-6 py-5 text-[13px] sm:-mx-10 sm:px-10">
            <div className="flex items-center gap-3">
              <Settings clock={clock} nepali={nepali} onNepali={toggleNepali} />
            </div>
            <nav className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.03] p-1 backdrop-blur-xl">
              {TABS.map(([id, label]) => {
                const on = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`pressable relative cursor-pointer rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${on ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
                  >
                    {on && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{ duration: 0.45, ease: EASE_APPLE }}
                        className="absolute inset-0 rounded-full bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="mx-auto w-full max-w-3xl flex-1 pt-12 pb-32 sm:pt-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 14, scale: 0.995, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, scale: 0.997, filter: 'blur(6px)' }}
                transition={{ duration: 0.38, ease: EASE_APPLE }}
                style={{ willChange: 'transform, opacity, filter' }}
              >
                {tab === 'clock' && (
                  <ClockView clock={clock} nepali={nepali} tithi={tithi} onFullscreen={toggleFullscreen} />
                )}
                {tab === 'calendar' && <CalendarView nepali={nepali} />}
                {tab === 'convert' && <ConverterView />}
                {tab === 'world' && <WorldView clock={clock} />}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="text-faint pb-8 text-[11px]">
            Samayamiiti · Nepal time <span className="tabular">UTC+5:45</span> · press <kbd className="text-muted">F</kbd> for fullscreen
          </footer>
        </div>
        <AnimatePresence>
          {fs && <Fullscreen clock={clock} onClose={exitFullscreen} />}
        </AnimatePresence>
      </div>
    </ClickSpark>
  );
}
