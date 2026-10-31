import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, staticFile} from 'remotion';

export const UIFonts = () => (
  <style>{`
  @font-face{font-family:'Lilita One';src:url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'Fredoka';src:url('${staticFile('fonts/Fredoka-Variable.ttf')}') format('truetype');font-weight:300 700;}
  `}</style>
);
const STK = (px, c = '#120d0a') => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});
export const C = {gold: '#ffcf3a', white: '#ffffff', red: '#ff4a3d', mint: '#7dffb0', ink: '#120d0a', cream: '#fff4dc', sky: '#7fe3ff', pink: '#ff7ac8'};

/** Group words into 1-3 word chunks (break on punctuation, never across segments). */
export const chunkWords = (words) => {
  const out = []; let cur = [];
  const flush = () => { if (cur.length) out.push(cur); cur = []; };
  words.forEach((w, i) => {
    if (cur.length && cur[0][3] !== w[3]) flush();
    cur.push(w);
    const punct = /[.,!?:;]$/.test(w[0]); const long = cur.reduce((a, x) => a + x[0].length, 0) > 13;
    if (punct || cur.length >= 3 || long) flush();
  });
  flush(); return out;
};

/** Word-timed captions: 1-3 words, heavy, active word highlighted. y = centre (px). */
export const Captions = ({chunks, y = 1290, hideRanges = []}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  if (hideRanges.some(([a, b]) => t >= a && t < b)) return null;
  let ci = -1;
  for (let i = 0; i < chunks.length; i++) { if (t >= chunks[i][0][1] - 0.05) ci = i; else break; }
  if (ci < 0) return null;
  const ch = chunks[ci]; const next = chunks[ci + 1];
  const end = ch[ch.length - 1][2];
  if (t > end + 0.35 && (!next || t < next[0][1] - 0.05)) return null;
  const lf = Math.round((t - (ch[0][1] - 0.05)) * fps);
  const sc = spring({frame: lf, fps, config: {damping: 12, stiffness: 260, mass: 0.5}, from: 0.7, to: 1});
  const chars = ch.reduce((a, w) => a + w[0].length + 1, 0);
  const size = Math.min(98, Math.floor(820 / Math.max(6, chars * 0.64)));
  let act = 0; ch.forEach((w, i) => { if (t >= w[1] - 0.03) act = i; });
  const clean = (s) => s.replace(/[.,!?;:"]+$/g, '').replace(/^["']+/, '').toUpperCase();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: y - size * 0.75, left: 60, width: 900, textAlign: 'center', transform: `scale(${sc}) rotate(${(ci % 2 ? 1 : -1) * 1.2}deg)`, lineHeight: 1.05}}>
        {ch.map((w, i) => {
          const on = i === act; const pop = on ? spring({frame: Math.round((t - w[1]) * fps), fps, config: {damping: 10, stiffness: 300}, from: 1.12, to: 1}) : 1;
          return <span key={i} style={{display: 'inline-block', marginLeft: i ? Math.round(size * 0.42) + 18 : 0, transformOrigin: '50% 60%', fontFamily: 'Fredoka', fontWeight: 700, fontSize: size, color: on ? C.gold : C.white,
            transform: `scale(${pop}) translateY(${on ? -4 : 0}px)`, ...STK(14), textShadow: '0 9px 0 rgba(0,0,0,0.45)', letterSpacing: 1}}>{clean(w[0])}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Title box (frame 0 hook): chunky card, 2 lines. */
export const TitleBox = ({lines, y = 300, out = 999}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const o = interpolate(f, [out - 6, out], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  const wob = Math.sin(f * 0.25) * 1.2;
  return <AbsoluteFill style={{pointerEvents: 'none', opacity: o}}>
    <div style={{position: 'absolute', top: y, left: 90, width: 900, transform: `rotate(${-2.5 + wob * 0.3}deg)`, background: C.gold, border: `9px solid ${C.ink}`, borderRadius: 26,
      boxShadow: '0 14px 0 rgba(0,0,0,0.45)', padding: '18px 10px 22px', textAlign: 'center'}}>
      {lines.map((l, i) => <div key={i} style={{fontFamily: 'Lilita One', fontSize: l.size || 96, lineHeight: 1.02, color: l.color || C.ink, letterSpacing: 2,
        ...(l.color && l.color !== C.ink ? STK(10) : {})}}>{l.text}</div>)}
    </div>
  </AbsoluteFill>;
};

/** Speaker label + quote bubble for ME / character lines. */
export const SpeakerCard = ({who, text, color = C.mint, y = 270, delay = 0, tail = 'left'}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 11, stiffness: 220}});
  if (f < 0) return null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: y, left: 80, width: 860, transform: `scale(${0.6 + 0.4 * s}) rotate(${tail === 'left' ? -1.5 : 1.5}deg)`, opacity: s, transformOrigin: tail === 'left' ? '10% 50%' : '90% 50%'}}>
      <div style={{display: 'inline-block', fontFamily: 'Lilita One', fontSize: 50, background: C.ink, color, padding: '6px 22px', borderRadius: 14, letterSpacing: 3, marginLeft: tail === 'left' ? 10 : 'auto', float: tail === 'left' ? 'none' : 'right'}}>{who}</div>
      <div style={{clear: 'both', marginTop: 8, background: '#ffffff', border: `8px solid ${C.ink}`, borderRadius: 30, padding: '16px 26px', fontFamily: 'Lilita One', fontSize: 70, lineHeight: 1.05, color: C.ink, textAlign: 'center', boxShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>{text}</div>
    </div>
  </AbsoluteFill>;
};

/** Fact pill / tag. variant gold | white | red (stamp) | ink. x is the CENTRE in px. */
export const Tag = ({text, x = 540, y = 260, variant = 'gold', delay = 0, size = 52, rot}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  if (f < 0) return null;
  const s = spring({frame: f, fps, config: {damping: 10, stiffness: 240}});
  const bg = {gold: C.gold, white: '#ffffff', red: '#d6302a', ink: C.ink, mint: C.mint, pink: C.pink}[variant];
  const fg = variant === 'red' || variant === 'ink' ? '#fff' : C.ink;
  const r = rot !== undefined ? rot : variant === 'red' ? -6 : -2;
  return <div style={{position: 'absolute', top: y, left: x, transform: `translateX(-50%) rotate(${r}deg) scale(${variant === 'red' ? 2.2 - 1.2 * s : s})`, opacity: Math.min(1, s * 1.5),
    background: bg, color: fg, fontFamily: 'Lilita One', fontSize: size, padding: '8px 28px', borderRadius: 16, border: `6px solid ${C.ink}`, whiteSpace: 'nowrap', letterSpacing: 2, boxShadow: '0 8px 0 rgba(0,0,0,0.4)'}}>{text}</div>;
};

/** Big stamp (BANNED / DISQUALIFIED) slamming in. */
export const Stamp = ({text, delay = 0, y = 640, color = '#e0261f'}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  if (f < 0) return null;
  const s = spring({frame: f, fps, config: {damping: 9, stiffness: 300}});
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: y, left: 0, width: 1080, textAlign: 'center', transform: `rotate(-10deg) scale(${2.6 - 1.6 * s})`, opacity: Math.min(1, s * 2)}}>
      <span style={{display: 'inline-block', fontFamily: 'Lilita One', fontSize: 150, color, border: `14px solid ${color}`, borderRadius: 26, padding: '0 40px', background: 'rgba(255,248,230,0.82)', letterSpacing: 8}}>{text}</span>
    </div>
  </AbsoluteFill>;
};

/** Heat haze + sun glare + warm vignette + grain. */
export const Grade = ({heat = 1, vignette = 0.5, grain = 0.05, warm = 1}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {warm > 0 && <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 40% at 80% 8%, rgba(255,214,120,${0.35 * warm}) 0%, rgba(255,160,60,0) 70%)`, mixBlendMode: 'screen'}} />}
    {heat > 0 && [0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: -50, width: 1180, top: 600 + ((i * 260 - f * 2.2) % 780 + 780) % 780, height: 90,
      background: 'linear-gradient(180deg, rgba(255,240,200,0) 0%, rgba(255,236,190,0.10) 50%, rgba(255,240,200,0) 100%)', transform: `skewY(${Math.sin(f * 0.1 + i) * 1.5}deg)`, opacity: heat}} />)}
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 58%, rgba(40,16,0,${vignette}) 100%)`}} />
    <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${f % 40}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`}} />
  </AbsoluteFill>;
};

/** Small floating world label that sticks to screen pos (x,y px). */
export const Float = ({text, x, y, color = C.cream, size = 42, delay = 0, bg = 'rgba(18,13,10,0.78)'}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig(); if (f < 0) return null;
  const s = spring({frame: f, fps, config: {damping: 12, stiffness: 220}});
  return <div style={{position: 'absolute', left: x, top: y + Math.sin((f + delay) * 0.12) * 6, transform: `translateX(-50%) scale(${s})`, fontFamily: 'Lilita One', fontSize: size, color, background: bg, padding: '4px 18px', borderRadius: 12, whiteSpace: 'nowrap', letterSpacing: 2}}>{text}</div>;
};

/** Counter like 14/32 */
export const Counter = ({from = 32, to = 14, total = 32, delay = 0, dur = 24, y = 300}) => {
  const f = useCurrentFrame() - delay; if (f < 0) return null;
  const v = Math.round(interpolate(f, [0, dur], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return <div style={{position: 'absolute', top: y, width: 1080, textAlign: 'center'}}>
    <span style={{fontFamily: 'Lilita One', fontSize: 200, color: v <= to ? C.gold : C.white, ...STK(16), textShadow: '0 12px 0 rgba(0,0,0,0.4)'}}>{v}</span>
    <span style={{fontFamily: 'Lilita One', fontSize: 110, color: C.white, ...STK(12)}}> / {total}</span>
    <div style={{fontFamily: 'Lilita One', fontSize: 54, color: C.cream, ...STK(9), marginTop: -10, letterSpacing: 4}}>FINISHED</div>
  </div>;
};
