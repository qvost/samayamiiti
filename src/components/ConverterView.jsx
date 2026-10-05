import { useState } from 'react';
import { motion } from 'motion/react';
import { convertAdToBs, convertBsToAd } from '../modules/dateConverter.js';
import { NEPALI_MONTHS } from '../modules/nepaliCalendar.js';
import { EASE_APPLE, Eyebrow, Field, inputCls } from './ui.jsx';

const AD_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "1 year, 2 months, 3 days" style breakdown of an absolute day count. */
function span(days) {
  const n = Math.abs(days);
  const y = Math.floor(n / 365.25);
  const m = Math.floor((n - y * 365.25) / 30.44);
  const d = Math.round(n - y * 365.25 - m * 30.44);
  const parts = [];
  if (y) parts.push(`${y} year${y > 1 ? 's' : ''}`);
  if (m) parts.push(`${m} month${m > 1 ? 's' : ''}`);
  if (d || !parts.length) parts.push(`${d} day${d !== 1 ? 's' : ''}`);
  return parts.join(', ');
}

function initial() {
  const t = new Date();
  const ad = { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
  const r = convertAdToBs(ad.y, ad.m, ad.d);
  return {
    ad,
    bs: { y: r.bsDate.year, m: r.bsDate.month, d: r.bsDate.day },
    from: 'ad',
    res: r
  };
}

export default function ConverterView() {
  const [s, setS] = useState(initial);

  // Edit one side → convert live and fill in the other side.
  const edit = (side, patch) => {
    const mine = { ...s[side], ...patch };
    const res = side === 'bs' ? convertBsToAd(mine.y, mine.m, mine.d) : convertAdToBs(mine.y, mine.m, mine.d);
    if (!res.success) return setS({ ...s, [side]: mine, from: side, res });
    const other = side === 'bs'
      ? { ad: { y: res.adDate.year, m: res.adDate.month, d: res.adDate.day } }
      : { bs: { y: res.bsDate.year, m: res.bsDate.month, d: res.bsDate.day } };
    setS({ ...s, [side]: mine, ...other, from: side, res });
  };

  const num = (side, key) => (e) => edit(side, { [key]: +e.target.value });
  const { res, from } = s;
  const target = from === 'bs' ? 'ad' : 'bs';

  const Info = ({ side }) => {
    if (!res.success) return side === from ? <p className="text-danger mt-8 text-sm">{res.error}</p> : null;
    if (side !== target) return null;
    const days = res.diffDays;
    return (
      <div className="mt-10">
        <p className="text-xl font-semibold tracking-tight">
          {side === 'ad' ? res.adDate.formatted : `${res.bsDate.formattedNp} वि.सं.`}
        </p>
        <p className="text-muted mt-1 text-sm">
          {res.adDate.dayNameNp} · {res.tithi.fullName}
        </p>
        <ul className="mt-6">
          {[
            ['When', res.diffText],
            ...(Math.abs(days) > 0 ? [['Span', span(days)], ['Weeks', `${(Math.abs(days) / 7).toFixed(1)}`]] : []),
            ['Tithi', `${res.tithi.nameEn} · ${res.tithi.paksha}`],
            ['Nakshatra', res.tithi.nakshatra]
          ].map(([k, v]) => (
            <li key={k} className="border-line flex justify-between gap-6 border-b py-3 text-sm last:border-0">
              <span className="text-muted">{k}</span>
              <span className={`tabular font-medium ${k === 'When' ? 'text-accent' : ''}`}>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="grid gap-20 sm:grid-cols-2 sm:gap-12"
    >
      <motion.section variants={{ hidden: { opacity: 0, y: 14, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: EASE_APPLE } } }}>
        <Eyebrow>Bikram Sambat</Eyebrow>
        <div className="space-y-5">
          <Field label="Year">
            <input type="number" className={inputCls} value={s.bs.y} onChange={num('bs', 'y')} />
          </Field>
          <Field label="Month">
            <select className={inputCls} value={s.bs.m} onChange={num('bs', 'm')}>
              {NEPALI_MONTHS.map((m, i) => <option key={i} value={i}>{m.nameNp} · {m.nameEn}</option>)}
            </select>
          </Field>
          <Field label="Day">
            <input type="number" min={1} max={32} className={inputCls} value={s.bs.d} onChange={num('bs', 'd')} />
          </Field>
        </div>
        <Info side="bs" />
      </motion.section>

      <motion.section variants={{ hidden: { opacity: 0, y: 14, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: EASE_APPLE } } }}>
        <Eyebrow>Gregorian</Eyebrow>
        <div className="space-y-5">
          <Field label="Year">
            <input type="number" className={inputCls} value={s.ad.y} onChange={num('ad', 'y')} />
          </Field>
          <Field label="Month">
            <select className={inputCls} value={s.ad.m} onChange={num('ad', 'm')}>
              {AD_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </Field>
          <Field label="Day">
            <input type="number" min={1} max={31} className={inputCls} value={s.ad.d} onChange={num('ad', 'd')} />
          </Field>
        </div>
        <Info side="ad" />
      </motion.section>
    </motion.div>
  );
}
