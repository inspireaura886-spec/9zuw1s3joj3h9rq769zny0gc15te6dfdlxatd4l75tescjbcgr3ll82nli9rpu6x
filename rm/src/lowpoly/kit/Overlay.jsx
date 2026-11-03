import {pal} from '../../palette.js';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate, staticFile} from 'remotion';

// Fonts (OFL): Lilita One for headlines/tags, Fredoka for word captions. Files in public/fonts.
export const FontFaces = () => (
  <style>{`
  @font-face{font-family:'Lilita One';src:url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'Fredoka';src:url('${staticFile('fonts/Fredoka-Variable.ttf')}') format('truetype');font-weight:300 700;}
  @font-face{font-family:'DM Serif Display';font-style:italic;src:url('${staticFile('fonts/DMSerifDisplay-Italic.ttf')}') format('truetype');}
  `}</style>
);
const STROKE = (px, c) => ({WebkitTextStroke: `${px}px ${c || pal().ink}`, paintOrder: 'stroke fill'});
// HUMANE 2026-11-03: legacy colour NAMES kept for old stories, but every value comes from the active muted palette (src/palette.js).
// yellow/green -> palette accent, red/cyan -> palette alt, white -> warm off-white. Never neon yellow/red again.
const MAP = {yellow: 'active', green: 'active', red: 'alt', cyan: 'alt', white: 'text', ink: 'ink', chip: 'chip', chipText: 'chipText', accent: 'active', alt: 'alt', text: 'text'};
export const COLORS = new Proxy({}, {get: (_, k) => (MAP[k] ? pal()[MAP[k]] : undefined), has: (_, k) => k in MAP, ownKeys: () => Object.keys(MAP), getOwnPropertyDescriptor: (_, k) => (MAP[k] ? {enumerable: true, configurable: true, value: pal()[MAP[k]]} : undefined)});

/**
 * One-word pop caption (yellow, bold, lower-middle). words: [[text, startSec, endSec], ...] for the whole video,
 * offsetSec shifts if this component sits inside a <Sequence>. y = centre line in px (keep < 1450 for Shorts UI).
 */
export const WordCaption = ({words, offsetSec = 0, y = 1300, color, size = 96, hold = 0.25}) => {
  color = color || pal().active;
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps + offsetSec;
  let idx = -1;
  for (let i = 0; i < words.length; i++) { if (t >= words[i][1]) idx = i; else break; } // AYGRAMM 2026-10-23: hidden until its word plays
  if (idx < 0) return null;
  const [w, s, e] = words[idx]; const next = words[idx + 1];
  if (t > e + hold && (!next || t < next[1] - 0.04)) return null; // silence: hide
  const lf = Math.round((t - s) * fps);
  const sc = spring({frame: lf, fps, config: {damping: 11, stiffness: 220, mass: 0.6}, from: 0.55, to: 1});
  const clean = w.replace(/[.,!?;:"]+$/g, '').replace(/^["]+/, '');
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: y - size * 0.7, width: '100%', textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 700,
        fontSize: size, color, transform: `scale(${sc})`, ...STROKE(14), textShadow: '0 6px 18px rgba(0,0,0,0.45)', letterSpacing: 1}}>{clean}</div>
    </AbsoluteFill>
  );
};

/**
 * Headline card at the top: lines [{text, color}] pop in one after another (stagger frames).
 * y = top px (>= 230 keeps clear of the Shorts top bar).
 */
export const Headline = ({lines, y = 250, size = 84, stagger = 7, delay = 0}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: y, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
        {lines.map((l, i) => {
          const s = spring({frame: f - i * stagger, fps, config: {damping: 12, stiffness: 180}});
          return <div key={i} style={{fontFamily: 'Lilita One', fontSize: l.size || size, color: COLORS[l.color] || l.color || pal().text, lineHeight: 1.08,
            textAlign: 'center', maxWidth: 960, transform: `translateY(${(1 - s) * -30}px) scale(${0.85 + 0.15 * s})`, opacity: s,
            ...STROKE(12), textShadow: '0 6px 0 rgba(0,0,0,0.3)', letterSpacing: 1.5}}>{l.text}</div>;
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Date/place pill. variant 'yellow' | 'white' | 'red' (red is slightly rotated like a stamp). */
export const Pill = ({text, y = 230, variant = 'yellow', delay = 0, x = '50%', size = 40}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 13, stiffness: 200}});
  const P = pal(); // HUMANE: yellow -> muted accent chip with ink text, red -> deep palette chip with off-white text
  const bg = {yellow: P.active, white: P.text, red: P.chip, dark: '#141414'}[variant] || P.active;
  const fg = variant === 'red' || variant === 'dark' ? P.chipText : P.ink;
  const rot = variant === 'red' ? -3 : 0;
  return (
    <div style={{position: 'absolute', top: y, left: x, transform: `translateX(-50%) rotate(${rot}deg) scale(${s})`, opacity: s,
      background: bg, color: fg, fontFamily: 'Lilita One', fontSize: size, padding: '8px 26px', borderRadius: 18, border: `5px solid ${P.ink}`,
      whiteSpace: 'nowrap', letterSpacing: 2, boxShadow: '0 6px 0 rgba(0,0,0,0.35)'}}>{text}</div>
  );
};

/** Soft vignette + film grain for depth (cheap CSS). */
export const Finish = ({vignette = 0.55, grain = 0.06, seed = 0}) => {
  const f = useCurrentFrame();
  return (<AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`}} />
    <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${(f + seed) % 50}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`}} />
  </AbsoluteFill>);
};

/** Crossfade-from-black / dip helper for scene starts. */
export const Dip = ({inFrames = 8, outFrames = 0, total, color = '#000'}) => {
  const f = useCurrentFrame();
  let o = interpolate(f, [0, inFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (outFrames && total) o = Math.max(o, interpolate(f, [total - outFrames, total], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return o > 0 ? <AbsoluteFill style={{background: color, opacity: o}} /> : null;
};

/** End card: channel mark IA + handle, sources line. */
export const EndCard = ({question, sources = [], delay = 0}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  const s = spring({frame: f, fps, config: {damping: 14}});
  return (<AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: 1540, width: '100%', textAlign: 'center', opacity: s}}>
      <span style={{fontFamily: 'Lilita One', fontSize: 64, color: pal().text, ...STROKE(10), letterSpacing: 4}}>IA</span>
      <span style={{fontFamily: 'Fredoka', fontWeight: 600, fontSize: 40, color: COLORS.yellow, marginLeft: 18, ...STROKE(8)}}>@ia.unfolds</span>
    </div>
    {sources.length > 0 && <div style={{position: 'absolute', top: 1640, width: '100%', textAlign: 'center', opacity: s * 0.9, fontFamily: 'Fredoka', fontWeight: 500,
      fontSize: 26, color: '#e8eefc', ...STROKE(5)}}>SOURCES: {sources.join(' · ')}</div>}
  </AbsoluteFill>);
};
