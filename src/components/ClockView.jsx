import { motion } from 'motion/react';
import { toNepaliNumeral, getCurrentNepaliDate, NEPALI_MONTHS, DAYS_OF_WEEK } from '../modules/nepaliCalendar.js';
import BlurText from './rb/BlurText.tsx';
import ShinyText from './rb/ShinyText.tsx';
import FadeContent from './rb/FadeContent.tsx';
import { EASE_APPLE, Eyebrow, Ghost, Row } from './ui.jsx';
import { Maximize2 } from 'lucide-react';

export function bsDateString(nepali) {
  const t = getCurrentNepaliDate();
  const d = nepali ? toNepaliNumeral(t.date) : t.date;
  const y = nepali ? toNepaliNumeral(t.year) : t.year;
  return `${y} ${NEPALI_MONTHS[t.month].nameNp} ${d}, ${DAYS_OF_WEEK[t.day].nameNp}`;
}

export default function ClockView({ clock, nepali, tithi, onFullscreen }) {
  if (!clock) return null;
  const st = clock.sunTimes;
  const mp = clock.moonPhase;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      <motion.div
        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_APPLE } } }}
        className="flex items-center justify-between"
      >
        <ShinyText text={clock.tzLabel} speed={4} color="#6b6b6b" shineColor="#f4b400" className="text-[13px]" />
        <Ghost onClick={onFullscreen} aria-label="Fullscreen clock" title="Fullscreen (F)">
          <Maximize2 className="size-3.5" />
        </Ghost>
      </motion.div>


      <motion.div
        variants={{ hidden: { opacity: 0, y: 18, filter: 'blur(8px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE_APPLE } } }}
        className="tabular mt-16 flex items-baseline font-semibold leading-none tracking-tighter text-[clamp(4rem,17vw,9rem)]"
      >
        <span>{clock.hours}</span>
        <span className="pulse-dot text-accent mx-[0.04em]">:</span>
        <span>{clock.minutes}</span>
        <span className="text-faint ml-[0.12em] text-[0.34em] tracking-normal">{clock.seconds}</span>
        {!clock.is24Hour && <span className="text-muted ml-3 text-base font-medium tracking-normal">{clock.ampm}</span>}
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }}>
        <div className="bg-line mt-8 h-px w-full overflow-hidden">
          <div className="bg-accent h-px" style={{ width: `${clock.secondProgress}%`, transition: 'width 0.9s cubic-bezier(0.32,0.72,0,1)' }} />
        </div>
      </motion.div>

      <motion.div
        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_APPLE } } }}
        className="mt-10 min-h-16"
      >
        <BlurText
          key={bsDateString(nepali)}
          text={bsDateString(nepali)}
          delay={45}
          stepDuration={0.4}
          className="text-2xl font-semibold tracking-tight"
        />
        <p className="text-muted mt-2 text-sm">
          {clock.dateGregorian}
          {tithi && <span className="text-faint"> · {tithi.fullName} · {tithi.nakshatra}</span>}
        </p>
      </motion.div>

      <FadeContent blur duration={700} className="mt-20">
        <Eyebrow>Sun · {st ? `${st.nextEvent} ${st.timeRemaining}` : ''}</Eyebrow>
        {st && (
          <div className="relative mb-6">
            <div className="bg-line h-px w-full" />
            <motion.span
              className="bg-accent absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_12px_rgba(244,180,0,0.6)]"
              animate={{ left: `${Math.min(100, Math.max(0, st.daylightProgress))}%` }}
              transition={{ duration: 0.8, ease: EASE_APPLE }}
            />
          </div>
        )}
        <ul className="dim-list">
          <Row label="Sunrise" value={st?.sunrise} />
          <Row label="Sunset" value={st?.sunset} />
          <Row label="Day length" value={st?.dayLength} />
          <Row label="Solar noon" value={st?.solarNoon} />
          <Row label="Dawn" value={st?.dawn} />
          <Row label="Dusk" value={st?.dusk} />
        </ul>

        <div className="mt-14">
          <Eyebrow>Moon</Eyebrow>
          <ul className="dim-list">
            <Row label="Phase" value={`${mp?.phaseName} · ${mp?.phaseNameNepali}`} />
            <Row label="Illumination" value={`${mp?.illumination}%`} />
            <Row label="Age" value={`${mp?.ageDays} days`} />
          </ul>
        </div>
      </FadeContent>
    </motion.div>
  );
}
