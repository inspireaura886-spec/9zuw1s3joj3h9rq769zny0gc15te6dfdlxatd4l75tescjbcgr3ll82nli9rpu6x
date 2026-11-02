// REAL3D Remotion layer: Blender plates (rendered on GitHub by gh_blender.sh) as video layers + captions, titles,
// punch-ins, grade, film grain and the IA mark. The plate is the picture; this file only finishes it.
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = Easing.bezier(0.33, 0, 0.2, 1);

/** One Blender plate. punches = [{at, dur=8, to=1.07}] scale jumps that ease back (104-112 % on spoken words).
 *  drift = slow extra push over the plate (Blender already moves the camera; keep 0-0.03). */
export const Plate = ({src, punches = [], drift = 0, startFrom = 0, flashAt = [], style = {}}) => {
  const f = useCurrentFrame();
  let s = 1 + drift * f / 300;
  for (const p of punches) {
    const k = f - p.at; const d = p.dur || 10;
    if (k >= 0 && k < d * 3) s *= 1 + ((p.to || 1.07) - 1) * (k < 2 ? k / 2 : Math.exp(-(k - 2) / d));
  }
  return (<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${s})`, ...style}}><OffthreadVideo src={staticFile(src)} startFrom={startFrom} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
    {flashAt.map((a, i) => { const k = f - a; return k >= 0 && k < 6 ? <AbsoluteFill key={i} style={{background: '#ff2a1a', opacity: 0.35 * (1 - k / 6), mixBlendMode: 'screen'}} /> : null; })}
  </AbsoluteFill>);
};

/** Cut list: plates = [{src, from, dur, punches}] in composition frames. dip = frames of black dip at each cut. */
export const PlateTrack = ({plates, dip = 2}) => (<>
  {plates.map((p, i) => (<Sequence key={i} from={p.from} durationInFrames={p.dur}>
    <Plate {...p} />
    {i > 0 && dip > 0 && <Dip n={dip} />}
  </Sequence>))}
</>);

const Dip = ({n = 2}) => { const f = useCurrentFrame(); return f < n ? <AbsoluteFill style={{background: '#000', opacity: 1 - f / n}} /> : null; };

/** Cinematic finish over the plates: soft-light teal/amber split, gentle vignette, animated film grain, gate flicker. */
export const Real3DFinish = ({grain = 0.07, vignette = 0.35, tone = 0.16, seed = 0, flicker = 0.025}) => {
  const f = useCurrentFrame();
  const fl = flicker * (((f * 9301 + 49297 + seed) % 233280) / 233280);
  return (<AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: `linear-gradient(180deg, rgba(30,60,110,${tone}), rgba(10,20,40,${tone * 0.5}) 55%, rgba(140,80,30,${tone * 0.6}))`, mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 50%, rgba(0,0,0,${vignette}) 100%)`}} />
    <AbsoluteFill style={{background: '#000', opacity: fl}} />
    <AbsoluteFill style={{opacity: grain, mixBlendMode: 'overlay', backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' seed='${(f + seed) % 64}'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`, backgroundSize: '360px 360px'}} />
  </AbsoluteFill>);
};

/** Hook headline: white condensed caps, one red italic accent line; each line lands on its frame. */
export const R3DTitle = ({lines = [], y = 250, size = 92, out = 999999, sub}) => {
  const f = useCurrentFrame();
  const o = 1 - clamp01((f - out) / 8);
  if (o <= 0) return null;
  return (<div style={{position: 'absolute', top: y, left: 0, width: '100%', textAlign: 'center', opacity: o}}>
    {lines.map((l, i) => { const t = clamp01((f - (l.at || 0)) / 5); if (t <= 0) return null;
      return <div key={i} style={{fontFamily: l.red ? 'DM Serif Display' : 'Lilita One', fontStyle: l.red ? 'italic' : 'normal', fontSize: (l.size || size) * (l.red ? 1.1 : 1),
        letterSpacing: l.red ? 1 : 4, lineHeight: 1.04, color: l.red ? '#ff3b2f' : '#f4f1ea', transform: `translateY(${(1 - ease(t)) * 22}px) scale(${1 + (1 - t) * 0.1})`, opacity: t,
        textShadow: '0 0 28px rgba(0,0,0,0.95), 0 4px 0 rgba(0,0,0,0.6)'}}>{l.text}</div>; })}
    {sub && <div style={{marginTop: 14, fontFamily: 'Special Elite', fontSize: 38, letterSpacing: 3, color: '#ddd6c6', textShadow: '0 0 14px #000', opacity: clamp01((f - (sub.at || 0)) / 6)}}>{sub.text}</div>}
  </div>);
};

/** Small lower-third style tag (place/date/source) with a typewriter reveal. */
export const R3DTag = ({text, at = 0, y = 1480, size = 34}) => {
  const f = useCurrentFrame() - at; if (f < 0) return null;
  return <div style={{position: 'absolute', top: y, left: 0, width: '100%', textAlign: 'center', fontFamily: 'Special Elite', fontSize: size, letterSpacing: 3, color: '#e9e3d4',
    textShadow: '0 0 12px #000, 0 2px 0 #000'}}>{text.slice(0, Math.floor(f * 1.4))}</div>;
};

/** IA mark: quiet channel bug, inside the safe zone, clear of the right icon rail. */
export const IAMark = ({y = 1540, opacity = 0.55}) => <div style={{position: 'absolute', top: y, left: 0, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 30, letterSpacing: 5, color: `rgba(244,241,234,${opacity})`, textShadow: '0 0 10px rgba(0,0,0,0.8)'}}>IA · @ia.unfolds</div>;

export const R3DFonts = () => (<style>{`
  @font-face{font-family:'Lilita One';src:url('${staticFile('fonts/LilitaOne-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'DM Serif Display';font-style:italic;src:url('${staticFile('fonts/DMSerifDisplay-Italic.ttf')}') format('truetype');}
  @font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}
  @font-face{font-family:'Fredoka';src:url('${staticFile('fonts/Fredoka-Variable.ttf')}') format('truetype');font-weight:300 700;}
`}</style>);
