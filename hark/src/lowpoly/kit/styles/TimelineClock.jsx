// STYLE h (2026-10-30): split-screen timeline / clock countdown. Top half: analog clock + digital readout racing from `from` to
// `to` (or counting DOWN when to < from), ticking second hand, red alarm pulse in the last 15 %. Bottom half: a horizontal timeline
// that scrolls to each event; cards pop with a date + 2-4 word label; the marker line connects to the clock. 2D SVG, cheap.
// Times are minutes since midnight or 'HH:MM'. Use real, sourced times/dates only.
// <TimelineClock dur={105} from="21:00" to="23:58" events={[{date: '1890', label: 'FIRST FILM'}, {date: '16 SEP 1890', label: 'BOARDS TRAIN'}, {date: '1897', label: 'DECLARED MISSING'}]} />
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {cl, lerp, ramp, eio, ebackOut, pal} from './util.js';

const toMin = (v) => (typeof v === 'number' ? v : (([h, m]) => h * 60 + m)(v.split(':').map(Number)));
const pad = (n) => String(n).padStart(2, '0');

export const TimelineClock = ({dur = 105, from = '21:00', to = '23:58', events = [], palette = 'ia', label, countdown}) => {
  const f = useCurrentFrame(); const P = pal(palette);
  const a = toMin(from), b = toMin(to);
  const tt = eio(ramp(f, 4, dur * 0.85));
  const m = lerp(a, b, tt); const hh = Math.floor(((m % 1440) + 1440) % 1440 / 60), mm = Math.floor(((m % 60) + 60) % 60);
  const late = ramp(f, dur * 0.72, dur * 0.85); const pulse = late * (0.5 + 0.5 * Math.sin(f * 0.8));
  const cx = 540, cy = 500, R = 270;
  const hA = ((m / 60) % 12) / 12 * 360, mA = (m % 60) / 60 * 360, sA = (f * 12) % 360;
  const hand = (ang, len, w, col) => { const r = ang * Math.PI / 180; return <line x1={cx} y1={cy} x2={cx + Math.sin(r) * len} y2={cy - Math.cos(r) * len} stroke={col} strokeWidth={w} strokeLinecap="round" />; };
  // timeline
  const n = Math.max(1, events.length); const gap = 420; const cur = lerp(0, n - 1, eio(ramp(f, 8, dur * 0.85)));
  const scroll = 540 - cur * gap;
  const cd = countdown != null ? Math.max(0, Math.ceil(lerp(countdown, 0, tt))) : null;
  return <AbsoluteFill style={{background: P.bg}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <defs><radialGradient id="tc-face" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stopColor="#efe6d2" /><stop offset="1" stopColor="#b8a98a" /></radialGradient></defs>
      {/* split line */}
      <rect x={0} y={0} width={1080} height={960} fill="#0c1016" />
      <rect x={0} y={958} width={1080} height={6} fill={P.accent} opacity={0.9} />
      {/* clock */}
      <circle cx={cx} cy={cy} r={R + 40} fill={P.red} opacity={0.35 * pulse} />
      <circle cx={cx} cy={cy} r={R + 16} fill="#2a2016" />
      <circle cx={cx} cy={cy} r={R} fill="url(#tc-face)" />
      {Array.from({length: 60}, (_, i) => { const r = i * 6 * Math.PI / 180, big = i % 5 === 0; return <line key={i} x1={cx + Math.sin(r) * (R - (big ? 42 : 20))} y1={cy - Math.cos(r) * (R - (big ? 42 : 20))} x2={cx + Math.sin(r) * (R - 8)} y2={cy - Math.cos(r) * (R - 8)} stroke="#1a140e" strokeWidth={big ? 10 : 4} />; })}
      {hand(hA, R * 0.52, 18, '#1a140e')}{hand(mA, R * 0.78, 11, '#1a140e')}{hand(sA, R * 0.86, 4, P.red)}
      <circle cx={cx} cy={cy} r={16} fill={P.red} />
      <text x={cx} y={cy + R + 120} textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize={110} fill={late > 0 ? P.red : '#f2f2f2'} letterSpacing={6}>{cd != null ? `-${pad(Math.floor(cd / 60))}:${pad(cd % 60)}` : `${pad(hh)}:${pad(mm)}`}</text>
      {/* ghost date of the active event, big + faint, behind the timeline */}
      {events.length > 0 && <text x={540} y={1150} textAnchor="middle" fontFamily="Lilita One" fontSize={190} fill={P.accent} opacity={0.15}>{events[Math.round(cur)]?.date}</text>}
      {/* timeline */}
      <g transform={`translate(${scroll} 0)`}>
        <rect x={-200} y={1176} width={n * gap + 400} height={8} fill="#3a4250" />
        {events.map((e, i) => { const x = i * gap; const on = ebackOut(cl((cur - i + 0.35) / 0.35)); const act = Math.abs(cur - i) < 0.5;
          return <g key={i} transform={`translate(${x} 0)`}>
            <circle cx={0} cy={1180} r={act ? 26 : 16} fill={act ? P.accent : '#6a7280'} />
            <g transform={`translate(0 ${1160 + (1 - on) * 40}) scale(${Math.max(0.01, on)})`} opacity={cl(on)}>
              <rect x={-185} y={-150} width={370} height={128} rx={18} fill={act ? P.accent : '#e8e2d0'} stroke="#141414" strokeWidth={6} />
              <text x={0} y={-98} textAnchor="middle" fontFamily="monospace" fontWeight="700" fontSize={38} fill="#141414">{e.date}</text>
              <text x={0} y={-48} textAnchor="middle" fontFamily="Lilita One" fontSize={42} fill="#141414">{e.label}</text>
            </g>
            <line x1={0} y1={1196} x2={0} y2={1270} stroke={act ? P.accent : '#3a4250'} strokeWidth={4} strokeDasharray="10 10" />
          </g>; })}
      </g>
      {/* centre marker */}
      <polygon points="520,1300 560,1300 540,1272" fill={P.accent} />
      {label && <text x={540} y={1400} textAnchor="middle" fontFamily="Lilita One" fontSize={64} fill="#fff" stroke="#141414" strokeWidth={8} paintOrder="stroke" opacity={ramp(f, 4, 12)}>{label}</text>}
    </svg>
  </AbsoluteFill>;
};
