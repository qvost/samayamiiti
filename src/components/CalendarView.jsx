import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import {
  generateCalendarGrid,
  getCurrentNepaliDate,
  NEPALI_MONTHS,
  DAYS_OF_WEEK,
  toNepaliNumeral
} from '../modules/nepaliCalendar.js';
import { calculateSunTimes } from '../modules/astronomy.js';
import { eventsStore } from '../modules/eventsStore.js';
import { useEvents } from '../hooks/useEngines.js';
import BlurText from './rb/BlurText.tsx';
import SpotlightCard from './rb/SpotlightCard.tsx';
import { cn, EASE_APPLE, Eyebrow, Ghost, inputCls } from './ui.jsx';

export default function CalendarView({ nepali }) {
  const now = getCurrentNepaliDate();
  const [view, setView] = useState({ year: now.year, month: now.month });
  const [selected, setSelected] = useState(null);
  useEvents(); // re-render when notes change

  const cal = useMemo(() => generateCalendarGrid(view.year, view.month), [view]);
  const num = (n) => (nepali ? toNepaliNumeral(n) : n);

  const step = (d) =>
    setView(({ year, month }) => {
      const m = month + d;
      if (m < 0) return { year: year - 1, month: 11 };
      if (m > 11) return { year: year + 1, month: 0 };
      return { year, month: m };
    });

  const festivals = cal.grid.filter((c) => c.isCurrentMonth && c.festivals?.length);

  const open = (cell) => setSelected(cell);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div className="min-h-20">
          <BlurText
            key={`${view.year}-${view.month}`}
            text={`${cal.monthNameNp} ${num(cal.bsYear)}`}
            delay={70}
            className="text-4xl font-semibold tracking-tight sm:text-5xl"
          />
          <p className="text-muted mt-2 text-sm">
            {cal.monthNameEn} {cal.bsYear} · {cal.adRange} · <span className="text-faint">{cal.season}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 pb-1">
          <Ghost onClick={() => step(-1)} aria-label="Previous month"><ChevronLeft className="size-4" /></Ghost>
          <Ghost onClick={() => setView({ year: now.year, month: now.month })}>Today</Ghost>
          <Ghost onClick={() => step(1)} aria-label="Next month"><ChevronRight className="size-4" /></Ghost>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        <select
          value={view.year}
          onChange={(e) => setView((v) => ({ ...v, year: +e.target.value }))}
          className="text-muted hover:text-foreground cursor-pointer text-[13px] outline-none"
          aria-label="Year"
        >
          {Array.from({ length: 91 }, (_, i) => 2090 - i).map((y) => (
            <option key={y} value={y}>{num(y)}</option>
          ))}
        </select>
        <select
          value={view.month}
          onChange={(e) => setView((v) => ({ ...v, month: +e.target.value }))}
          className="text-muted hover:text-foreground cursor-pointer text-[13px] outline-none"
          aria-label="Month"
        >
          {NEPALI_MONTHS.map((m, i) => (
            <option key={i} value={i}>{m.nameNp} · {m.nameEn}</option>
          ))}
        </select>
      </div>

      <div className="mt-10 grid grid-cols-7">
        {DAYS_OF_WEEK.map((d, i) => (
          <div key={i} className={cn('text-faint pb-3 text-center text-[11px] uppercase tracking-[0.14em]', i === 6 && 'text-danger/70')}>
            {d.shortEn}
          </div>
        ))}
      </div>
      <motion.div
        key={`${view.year}-${view.month}`}
        initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.4, ease: EASE_APPLE }}
        className="border-line grid grid-cols-7 border-t border-l"
      >
        {cal.grid.map((c, i) => {
          const hasNote = eventsStore.hasEvents(c.bsYear, c.bsMonth, c.bsDate);
          const red = c.isSaturday || c.isHoliday;
          return (
            <button
              key={i}
              type="button"
              onClick={() => open(c)}
              className={cn(
                'cell-anim border-line group relative flex aspect-square cursor-pointer flex-col justify-between border-r border-b p-1.5 text-left hover:bg-white/[0.04] sm:p-2.5',
                !c.isCurrentMonth && 'opacity-25',
                c.isToday && 'bg-accent/10'
              )}
            >
              <span className={cn('tabular text-base font-medium sm:text-lg', red && 'text-danger', c.isToday && 'text-accent')}>
                {num(c.bsDate)}
              </span>
              <span className="flex items-end justify-between">
                <span className="text-faint tabular text-[10px]">{c.adDay}</span>
                <span className="flex items-center gap-1">
                  {hasNote && <span className="bg-foreground size-1 rounded-full" />}
                  {c.festivals?.length > 0 && <span className="bg-accent size-1.5 rounded-full" />}
                </span>
              </span>
              {c.isToday && <span className="bg-accent absolute top-0 left-0 h-px w-full" />}
            </button>
          );
        })}
      </motion.div>

      <div className="mt-20">
        <Eyebrow>Festivals · {festivals.length}</Eyebrow>
        {festivals.length === 0 ? (
          <p className="text-faint text-sm">Nothing this month.</p>
        ) : (
          <ul className="dim-list">
            {festivals.map((c) =>
              c.festivals.map((f, j) => (
                <li key={`${c.bsDate}-${j}`} className="border-line border-b last:border-0">
                  <button type="button" onClick={() => open(c)} className="flex w-full cursor-pointer items-baseline gap-6 py-3.5 text-left text-sm">
                    <span className="text-faint tabular w-10 shrink-0">{num(c.bsDate)}</span>
                    <span className="min-w-0 flex-1 truncate font-medium">{f.name}</span>
                    <span className="text-muted hidden truncate sm:block">{f.nameEn}</span>
                    {f.isHoliday && <span className="text-danger shrink-0 text-xs">Holiday</span>}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {selected && <DayDialog cell={selected} nepali={nepali} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function DayDialog({ cell, nepali, onClose }) {  const [text, setText] = useState('');
  const notes = useEvents().filter(
    (e) => e.bsYear === cell.bsYear && e.bsMonth === cell.bsMonth && e.bsDay === cell.bsDate
  );
  const sun = calculateSunTimes(cell.adDate);
  const num = (n) => (nepali ? toNepaliNumeral(n) : n);

  const add = () => {
    if (!text.trim()) return;
    eventsStore.addEvent(cell.bsYear, cell.bsMonth, cell.bsDate, text);
    setText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: EASE_APPLE }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 0.96, y: 10, filter: 'blur(8px)' }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        style={{ willChange: 'transform, opacity, filter' }}
        className="w-full max-w-md"
      >
      <SpotlightCard className="!bg-[#0e0e0e] !border-line w-full max-w-md !rounded-2xl !p-7" spotlightColor="rgba(244, 180, 0, 0.12)">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              {num(cell.bsDate)} {NEPALI_MONTHS[cell.bsMonth].nameNp} {num(cell.bsYear)}
            </p>
            <p className="text-muted mt-1 text-sm">
              {cell.adDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ·{' '}
              {DAYS_OF_WEEK[cell.dayOfWeek].nameEn}
            </p>
          </div>
          <Ghost onClick={onClose} aria-label="Close"><X className="size-4" /></Ghost>
        </div>

        <ul className="mt-6 text-sm">
          {[
            ['Tithi', `${cell.tithi.name} · ${cell.tithi.paksha}`],
            ['Nakshatra', cell.tithi.nakshatra],
            ['Sunrise / Sunset', `${sun.sunrise} / ${sun.sunset}`]
          ].map(([k, v]) => (
            <li key={k} className="border-line flex justify-between gap-4 border-b py-2.5 last:border-0">
              <span className="text-muted">{k}</span>
              <span className="text-right font-medium">{v}</span>
            </li>
          ))}
        </ul>

        {cell.festivals?.map((f, i) => (
          <p key={i} className="text-accent mt-4 text-sm">
            {f.name} <span className="text-muted">· {f.nameEn}</span>
          </p>
        ))}
        {!cell.festivals?.length && cell.isSaturday && <p className="text-danger mt-4 text-sm">शनिबार · Weekend</p>}

        <div className="mt-8">
          <Eyebrow>Notes</Eyebrow>
          <input
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Add a note, press enter…"
            className={cn(inputCls, 'placeholder:text-faint')}
          />
          <ul className="mt-2">
            {notes.map((n) => (
              <li key={n.id} className="border-line group flex items-center justify-between border-b py-2.5 text-sm last:border-0">
                <span>{n.title}</span>
                <Ghost onClick={() => eventsStore.deleteEvent(n.id)} aria-label="Delete note" className="opacity-0 group-hover:opacity-100">
                  <Trash2 className="size-3.5" />
                </Ghost>
              </li>
            ))}
          </ul>
        </div>
      </SpotlightCard>
      </motion.div>
    </motion.div>
  );
}
