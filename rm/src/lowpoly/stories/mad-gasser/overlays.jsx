import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

const STROKE = (px, c = '#141414') => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};

// Roast words (pink, tilted, wobble) and dread words (red, jitter). Everything else yellow.
const ROAST = new Set(['you', "you'd", 'yours', 'scroll', 'mid-scroll', 'milk', 'expired', 'chat', 'talk', 'honestly', 'polish', 'nail', 'sniff']);
const DREAD = new Set(['gassing', 'numb', 'vanishes', 'window', 'nothing', 'man', 'sick', 'violently', 'caught', 'who', 'it', 'gasser', 'prowler', 'shotgun', 'hole', 'fear', 'cloth', 'stood']);
/** word-timed one-word pop with comedy/dread emphasis styling. */
export const EmCaption = ({words, y = 1310, size = 96, hold = 0.25}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const t = f / fps;
  let idx = -1;
  for (let i = 0; i < words.length; i++) { if (t >= words[i][1] - 0.04) idx = i; else break; }
  if (idx < 0) return null;
  const [w, s, e] = words[idx]; const next = words[idx + 1];
  if (t > e + hold && (!next || t < next[1] - 0.04)) return null;
  const lf = Math.round((t - s) * fps);
  const clean = w.replace(/[.,!?;:"]+$/g, '').replace(/^["]+/, '');
  const key = clean.toLowerCase();
  const roast = ROAST.has(key), dread = !roast && DREAD.has(key);
  const sc = spring({frame: lf, fps, config: {damping: roast ? 7 : 11, stiffness: 240, mass: 0.6}, from: roast ? 0.3 : 0.55, to: roast ? 1.12 : 1});
  const rot = roast ? -6 + Math.sin(lf * 0.9) * 3 : dread ? Math.sin(lf * 2.7) * 1.5 : 0;
  const jx = dread ? Math.sin(lf * 3.3) * 3 : 0;
  const color = roast ? '#ff5fc8' : dread ? '#ff3b3b' : '#ffd93b';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: y - size * 0.7, width: '100%', textAlign: 'center', fontFamily: roast ? 'Lilita One' : 'Fredoka', fontWeight: 700,
        fontSize: roast ? size * 1.08 : size, color, transform: `translateX(${jx}px) scale(${sc}) rotate(${rot}deg)`, ...STROKE(14), textShadow: dread ? '0 0 26px rgba(255,0,30,0.6), 0 8px 0 rgba(0,0,0,0.4)' : '0 8px 0 rgba(0,0,0,0.35)', letterSpacing: 1}}>{roast ? clean.toUpperCase() : clean}</div>
    </AbsoluteFill>
  );
};

/** Sarcastic freeze-frame sticker: tilted label slab that slaps in. */
export const Sticker = ({text, sub, x = 540, y = 760, rot = -5, bg = '#ff4fa8', fg = '#fff', delay = 0, size = 64}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  if (f < 0) return null;
  const s = spring({frame: f, fps, config: {damping: 9, stiffness: 260, mass: 0.7}, from: 2.2, to: 1});
  const o = interpolate(f, [0, 3], [0, 1], cl);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, opacity: o, textAlign: 'center',
    background: bg, color: fg, border: '7px solid #141414', borderRadius: 22, padding: '14px 30px 16px', boxShadow: '10px 12px 0 rgba(0,0,0,0.45)', maxWidth: 920}}>
    <div style={{fontFamily: 'Lilita One', fontSize: size, lineHeight: 1.0, letterSpacing: 2, ...STROKE(fg === '#fff' ? 8 : 0)}}>{text}</div>
    {sub && <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: size * 0.48, marginTop: 6, opacity: 0.95}}>{sub}</div>}
  </div>;
};

/** Cartoon BONK / BANG starburst. */
export const Bonk = ({text = 'BONK!', x = 540, y = 900, delay = 0, color = '#ffd93b', fg = '#ff2f5a', size = 300, dur = 22}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  if (f < 0 || f > dur) return null;
  const s = spring({frame: f, fps, config: {damping: 8, stiffness: 300}, from: 0.2, to: 1});
  const o = interpolate(f, [dur - 6, dur], [1, 0], cl);
  const pts = Array.from({length: 24}, (_, i) => { const a = (i / 24) * Math.PI * 2; const r = i % 2 ? 0.62 : 1; return `${50 + Math.cos(a) * 48 * r},${50 + Math.sin(a) * 48 * r}`; }).join(' ');
  return <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${s}) rotate(${-8 + f * 0.6}deg)`, opacity: o}}>
    <svg viewBox="0 0 100 100" width={size} height={size}><polygon points={pts} fill={color} stroke="#141414" strokeWidth="3" strokeLinejoin="round" /></svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lilita One', fontSize: size * 0.24, color: fg, ...STROKE(7)}}>{text}</div>
  </div>;
};

/** White flash (camera shutter for freeze frames / gunshot). */
export const Flash = ({at = 0, len = 5, color = '#fff', max = 0.85}) => {
  const f = useCurrentFrame() - at; if (f < 0 || f > len) return null;
  return <AbsoluteFill style={{background: color, opacity: max * (1 - f / len)}} />;
};

/** Freeze-frame frame border: grey-ish filter is applied on the scene; this adds the "PAUSED" style corners + scanline tint. */
export const FreezeFX = ({at, label = 'FREEZE FRAME'}) => {
  const f = useCurrentFrame() - at; if (f < 0) return null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{border: '14px solid #ff4fa8', boxSizing: 'border-box', opacity: 0.9}} />
    <div style={{position: 'absolute', top: 1180, left: 60, fontFamily: 'Lilita One', fontSize: 36, color: '#fff', background: '#141414', padding: '4px 16px', borderRadius: 10, letterSpacing: 3}}>❚❚ {label}</div>
  </AbsoluteFill>;
};

/** Old newspaper slamming in with a spin. */
export const Newspaper = ({delay = 0, headline = ['"ANESTHETIC', 'PROWLER', 'ON LOOSE"'], date = 'MATTOON · SEPT 1944'}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig();
  if (f < 0) return null;
  const s = spring({frame: f, fps, config: {damping: 12, stiffness: 120}});
  const rot = (1 - s) * 540 - 4 + Math.sin(f * 0.05) * 1.5;
  return <div style={{position: 'absolute', left: 540, top: 840, width: 780, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${0.2 + 0.8 * s})`,
    background: '#f3ead2', border: '6px solid #141414', borderRadius: 6, padding: '20px 30px 26px', boxShadow: '14px 16px 0 rgba(0,0,0,0.45)'}}>
    <div style={{fontFamily: 'Lilita One', fontSize: 40, letterSpacing: 4, color: '#141414', textAlign: 'center', borderBottom: '4px solid #141414', paddingBottom: 6}}>THE DAILY JOURNAL-GAZETTE</div>
    <div style={{fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#444', textAlign: 'center', margin: '6px 0 8px'}}>{date}</div>
    {headline.map((h, i) => <div key={i} style={{fontFamily: 'Lilita One', fontSize: 94, lineHeight: 1.0, color: i === 1 ? '#c4223a' : '#141414', textAlign: 'center'}}>{h}</div>)}
    <div style={{display: 'flex', gap: 14, marginTop: 14}}>{[0, 1, 2].map((i) => <div key={i} style={{flex: 1}}>{[0, 1, 2, 3].map((j) => <div key={j} style={{height: 9, background: '#b8ad92', margin: '7px 0', width: `${70 + ((i * 4 + j) * 37) % 30}%`}} />)}</div>)}</div>
  </div>;
};

/** Rolling counter pill (reports so far). */
export const Counter = ({from = 1, to = 25, start = 0, end = 60, label = 'GASSINGS REPORTED', y = 1130, suffix = '+'}) => {
  const f = useCurrentFrame(); const v = Math.round(interpolate(f, [start, end], [from, to], cl));
  const pop = 1 + 0.08 * Math.max(0, Math.sin(f * 0.9)) * (f < end ? 1 : 0);
  return <div style={{position: 'absolute', top: y, left: 540, transform: `translateX(-50%) scale(${pop})`, background: '#141414', border: '5px solid #ff3b3b', borderRadius: 18, padding: '8px 26px', display: 'flex', alignItems: 'baseline', gap: 16}}>
    <span style={{fontFamily: 'Lilita One', fontSize: 72, color: '#ff3b3b'}}>{v}{f >= end ? suffix : ''}</span>
    <span style={{fontFamily: 'Lilita One', fontSize: 34, color: '#fff', letterSpacing: 2}}>{label}</span></div>;
};

/** Group-chat panic: bubbles pop in, typing dots. */
export const GroupChat = ({delay = 0}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig(); if (f < 0) return null;
  const msgs = [['MOM', 'did u smell that??', '#ffffff', 0], ['DAVE', 'GAS MAN ON 21ST ST', '#ffffff', 8], ['YOU', 'lol what', '#ff9ad5', 16], ['UNKNOWN', 'we need to talk.', '#ff3b3b', 30]];
  return <div style={{position: 'absolute', left: 120, top: 640, width: 840}}>
    {msgs.map(([who, txt, bg, d], i) => { const s = spring({frame: f - d, fps, config: {damping: 11, stiffness: 220}}); if (f < d) return null;
      const me = who === 'YOU';
      return <div key={i} style={{display: 'flex', justifyContent: me ? 'flex-end' : 'flex-start', margin: '10px 0', transform: `scale(${s})`, transformOrigin: me ? 'right' : 'left'}}>
        <div style={{background: bg, border: '5px solid #141414', borderRadius: 26, padding: '10px 24px', maxWidth: 640, boxShadow: '6px 7px 0 rgba(0,0,0,0.4)'}}>
          <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 24, color: who === 'UNKNOWN' ? '#fff' : '#7a3fd0'}}>{who}</div>
          <div style={{fontFamily: 'Fredoka', fontWeight: 700, fontSize: 44, color: who === 'UNKNOWN' ? '#fff' : '#141414'}}>{txt}</div></div></div>; })}
    {f > 22 && f < 30 && <div style={{background: '#fff', border: '5px solid #141414', borderRadius: 26, padding: '14px 26px', width: 120, fontSize: 40, letterSpacing: 6}}>{'•••'.slice(0, 1 + Math.floor(f / 3) % 3)}</div>}
  </div>;
};

/** Wanted poster with silhouette and "NEVER CAUGHT" stamp. */
export const Wanted = ({delay = 0}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig(); if (f < 0) return null;
  const s = spring({frame: f, fps, config: {damping: 13, stiffness: 140}}); const st = spring({frame: f - 14, fps, config: {damping: 8, stiffness: 300}, from: 2.5, to: 1});
  return <div style={{position: 'absolute', left: 540, top: 860, transform: `translate(-50%,-50%) rotate(${3 + Math.sin(f * 0.06) * 1.5}deg) scale(${s})`, width: 520, background: '#f2dfae', border: '6px solid #141414', padding: '18px 24px 22px', textAlign: 'center', boxShadow: '12px 14px 0 rgba(0,0,0,0.45)'}}>
    <div style={{fontFamily: 'Lilita One', fontSize: 92, color: '#7a2a12', letterSpacing: 6, lineHeight: 1}}>WANTED</div>
    <div style={{height: 300, margin: '10px auto', width: 300, background: '#d9c48e', border: '4px solid #7a2a12', position: 'relative', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 95, top: 40, width: 110, height: 110, background: '#141414'}} />
      <div style={{position: 'absolute', left: 82, top: 30, width: 136, height: 26, background: '#141414'}} />
      <div style={{position: 'absolute', left: 60, top: 160, width: 180, height: 160, background: '#141414'}} />
      <div style={{position: 'absolute', left: 116, top: 88, width: 22, height: 10, background: '#ff3045', boxShadow: '0 0 14px #ff3045'}} />
      <div style={{position: 'absolute', left: 162, top: 88, width: 22, height: 10, background: '#ff3045', boxShadow: '0 0 14px #ff3045'}} />
    </div>
    <div style={{fontFamily: 'Lilita One', fontSize: 40, color: '#141414'}}>THE MAD GASSER</div>
    {f > 14 && <div style={{position: 'absolute', left: '50%', top: '52%', transform: `translate(-50%,-50%) rotate(-14deg) scale(${st})`, border: '8px solid #d6302a', color: '#d6302a', fontFamily: 'Lilita One', fontSize: 76, padding: '4px 22px', borderRadius: 14, background: 'rgba(242,223,174,0.75)', whiteSpace: 'nowrap'}}>NEVER CAUGHT</div>}
  </div>;
};

/** Floating stink / numb squiggle labels (DOM, fixed position). */
export const Wobble = ({text, x, y, color = '#b6ff7a', delay = 0, size = 54, rot = 0}) => {
  const f = useCurrentFrame() - delay; const {fps} = useVideoConfig(); if (f < 0) return null;
  const s = spring({frame: f, fps, config: {damping: 10, stiffness: 200}});
  return <div style={{position: 'absolute', left: x, top: y + Math.sin(f * 0.2) * 8, transform: `translate(-50%,-50%) rotate(${rot + Math.sin(f * 0.15) * 4}deg) scale(${s})`, fontFamily: 'Lilita One', fontSize: size, color, ...STROKE(9), letterSpacing: 2, whiteSpace: 'nowrap'}}>{text}</div>;
};
