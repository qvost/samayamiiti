import { useEffect, useRef } from 'react';

const FAMILY = '"Geist Mono Variable", ui-monospace, monospace';
const PER_SLOT = 760; // particles per glyph
const targetCache = new Map();

/** Sample a glyph's filled pixels into a shuffled list of points (relative to glyph centre). */
function glyphPoints(ch, px) {
  const key = `${ch}|${px}`;
  if (targetCache.has(key)) return targetCache.get(key);
  const w = Math.ceil(px * 0.7);
  const h = Math.ceil(px * 1.2);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff';
  g.font = `700 ${px}px ${FAMILY}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(ch, w / 2, h / 2);
  const data = g.getImageData(0, 0, w, h).data;
  const step = Math.max(2, Math.round(px / 70));
  const pts = [];
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step)
      if (data[(y * w + x) * 4 + 3] > 128) pts.push([x - w / 2, y - h / 2, step]);
  for (let i = pts.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  targetCache.set(key, pts);
  return pts;
}

/**
 * The time as a cloud of dust. Every glyph is sampled into points; the points
 * drift away from the cursor and settle back, and scatter-and-reform when a digit changes.
 */
export default function DustClock({ text }) {
  const canvasRef = useRef(null);
  const textRef = useRef(text);
  const apiRef = useRef(null);

  useEffect(() => {
    textRef.current = text;
    apiRef.current?.setText(text);
  }, [text]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mouse = { x: -9999, y: -9999 };
    let slots = [];
    let px = 100;
    let W = 0;
    let H = 0;
    let raf = 0;
    let alive = true;

    const layout = (chars) => {
      // glyph cell widths: colon slots are narrower so the time reads tightly
      const widths = chars.map((c) => (c === ':' ? 0.34 : 0.6) * px);
      const total = widths.reduce((a, b) => a + b, 0);
      let x = (W - total) / 2;
      return widths.map((w) => {
        const cx = x + w / 2;
        x += w;
        return cx;
      });
    };

    const homeFor = (slot, ch, burst) => {
      const pts = glyphPoints(ch, px);
      slot.ch = ch;
      slot.parts.forEach((p, i) => {
        const t = pts[i % pts.length];
        p.hx = slot.cx + t[0] + (Math.random() - 0.5) * t[2];
        p.hy = H / 2 + t[1] + (Math.random() - 0.5) * t[2];
        p.s = t[2] * (0.55 + Math.random() * 0.35);
        if (burst) {
          p.vx += (Math.random() - 0.5) * 14;
          p.vy += (Math.random() - 0.5) * 14;
        }
      });
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const chars = [...textRef.current];
      px = Math.min(H * 0.34, (W * 0.58) / (chars.length * 0.56));
      const xs = layout(chars);
      slots = chars.map((ch, i) => ({
        ch,
        cx: xs[i],
        parts: Array.from({ length: PER_SLOT }, () => ({
          x: W / 2 + (Math.random() - 0.5) * W * 0.6,
          y: H / 2 + (Math.random() - 0.5) * H * 0.6,
          vx: 0,
          vy: 0,
          hx: 0,
          hy: 0,
          s: 2
        }))
      }));
      slots.forEach((s) => homeFor(s, s.ch, false));
    };

    apiRef.current = {
      setText(next) {
        const chars = [...next];
        if (chars.length !== slots.length) return build();
        chars.forEach((ch, i) => ch !== slots[i].ch && homeFor(slots[i], ch, true));
      }
    };

    const R = () => Math.max(110, px * 0.7);
    const frame = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, W, H);
      const r = R();
      const r2 = r * r;
      const t = performance.now() * 0.001;
      for (const slot of slots) {
        ctx.fillStyle = slot.ch === ':' ? '#f4b400' : '#ededed';
        for (const p of slot.parts) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / r) ** 2 * 3.2;
            p.vx += (dx / d) * f + (Math.random() - 0.5) * 0.9; // dusty scatter
            p.vy += (dy / d) * f + (Math.random() - 0.5) * 0.9;
          }
          // spring home + faint idle drift so the cloud breathes
          p.vx += (p.hx - p.x) * 0.045 + Math.sin(t * 1.3 + p.hy * 0.02) * 0.02;
          p.vy += (p.hy - p.y) * 0.045 + Math.cos(t * 1.1 + p.hx * 0.02) * 0.02;
          p.vx *= 0.9;
          p.vy *= 0.9;
          p.x += p.vx;
          p.y += p.vy;
          ctx.fillRect(p.x, p.y, p.s, p.s);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
      const b = canvas.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    document.fonts.load(`700 100px ${FAMILY}`).finally(() => {
      if (!alive) return;
      targetCache.clear();
      build();
      raf = requestAnimationFrame(frame);
    });
    const ro = new ResizeObserver(() => slots.length && build());
    ro.observe(canvas);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      apiRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" aria-label={text} role="img" />;
}
