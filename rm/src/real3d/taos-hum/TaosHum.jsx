// taos-hum: REAL3D Short, 47.5 s = 1425 f (voice 45.87 s, Qwen narrator_f seed 51). MYTH VS FACT format.
// Frame 0 = the REAL 1941 Ansel Adams Taos Pueblo photo (NARA 79-AA-Q02, public domain) + OSTI record card by 1 s.
// Plates = Blender Cycles on GitHub (blender/scenes/taos-hum): b02 house (NF 96, used twice), b04 field kit, b05 soil+gopher,
// b07 bedroom, b09 bedroom2. Remotion cards: congress/Air Force chips, frequency dial 33-80 Hz, PLOS 2026 card, Adams loop.
// No shake: eased pushes only. Scheme slate. Plate files in public/real3d/taos-hum/: b02.mp4 b04.mp4 b05.mp4 b07.mp4 b09.mp4.
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel, SCHEMES} from '../Real3DKit.jsx';
import {SAFE} from '../textfit.js';
import VO from './vo.json';

export const TAOS_FRAMES = 1425;
export const SCHEME = 'slate';
const P = 'real3d/taos-hum/';
const ez = Easing.bezier(0.33, 0, 0.2, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const S = SCHEMES[SCHEME];
const INK = S.text, ACC = S.active;
// cut map (frames, from cues.json): 0 Adams | 173 b02 | 269 docs | 407 b04 | 555 b05 (NO HUM f660) | 683 dial | 792 b07 |
// 985 PLOS ('But' twist) | 1171 b09 | 1257 b02 (2) | 1332 Adams loop | 1425 end
const plates = [
  {src: P + 'b02.mp4', from: 173, dur: 96, drift: 0.015},
  {src: P + 'b04.mp4', from: 407, dur: 148, drift: 0.012},
  {src: P + 'b05.mp4', from: 555, dur: 128, drift: 0.012, punches: [{at: 105, to: 1.035, dur: 20}]},
  {src: P + 'b07.mp4', from: 792, dur: 193, drift: 0.012},
  {src: P + 'b09.mp4', from: 1171, dur: 86, drift: 0.015},
  {src: P + 'b02.mp4', from: 1257, dur: 75, drift: 0.015, startFrom: 20},
];
const Scrim = ({inF, outF, h = 640}) => { const f = useCurrentFrame(); const o = Math.min(1, Math.max(0, (f - inF) / 6)) * (1 - Math.min(1, Math.max(0, (f - outF) / 8)));
  return <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: h, opacity: o, background: 'linear-gradient(rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0) 100%)'}} />; };
const Head = ({from, dur, lines, inF = 0}) => (<Sequence from={from} durationInFrames={dur}><Scrim inF={inF} outF={dur - 8} /><R3DHead scheme={SCHEME} lines={lines} inF={inF} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 1440}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={30} /></Sequence>);
const Fade = ({children}) => { const f = useCurrentFrame(); return <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], cl)}}>{children}</AbsoluteFill>; };
const Bottom = () => <div style={{position: 'absolute', left: 0, top: 1240, width: 1080, height: 680, background: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.75) 100%)'}} />;
const ChipIn = ({text, y, w, dur}) => { const f = useCurrentFrame();
  const t = interpolate(f, [0, 8], [0, 1], {easing: ez, ...cl}) * (1 - interpolate(f, [dur - 8, dur], [0, 1], cl));
  return (<div style={{position: 'absolute', left: (1080 - w) / 2, top: y, width: w, padding: '16px 0', textAlign: 'center', borderRadius: 12, background: S.chip, color: S.chipText, opacity: 0.92 * t, transform: `translateY(${(1 - t) * 14}px)`, fontFamily: 'Montserrat', fontWeight: 800, fontSize: 34, letterSpacing: 2, boxShadow: '0 6px 24px rgba(0,0,0,0.6)'}}>{text}</div>); };
const Chip = ({from, dur, text, y = 1090, w = 760}) => (<Sequence from={from} durationInFrames={dur}><ChipIn text={text} y={y} w={w} dur={dur} /></Sequence>);

const Back = ({scale = 2.4, dim = 0.42}) => (<AbsoluteFill style={{background: '#0c0d10', overflow: 'hidden'}}>
  <AbsoluteFill style={{transform: `scale(${scale})`, filter: `blur(28px) brightness(${dim})`}}><Img src={staticFile(P + 'taos1941.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill></AbsoluteFill>);

// Real 1941 Adams photo as a lit sheet; one eased push. OSTI record card slides in by 1.0 s.
const Adams = ({dur, s0 = 1.0, s1 = 1.1, card = true, fadeIn = 0}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [s0, s1], {easing: ez, ...cl});
  const a = fadeIn ? interpolate(f, [0, fadeIn], [0, 1], cl) : 1;
  const c = interpolate(f, [14, 30], [0, 1], {easing: ez, ...cl});
  return (<AbsoluteFill style={{opacity: a}}>
    <Back />
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: '50% 45%'}}>
      <div style={{position: 'absolute', left: 50, top: 560, width: 980, height: 777, boxShadow: '0 24px 70px rgba(0,0,0,0.85)', overflow: 'hidden', background: '#222'}}>
        <Img src={staticFile(P + 'taos1941.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.06) brightness(0.9) sepia(0.12)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)'}} />
      </div>
    </AbsoluteFill>
    {card && <div style={{position: 'absolute', left: SAFE.left + 30, top: 1010 + (1 - c) * 60, width: SAFE.width - 60, opacity: c, background: 'rgba(238,232,216,0.96)', color: '#1d1c19', borderRadius: 6, padding: '18px 24px', boxShadow: '0 12px 40px rgba(0,0,0,0.7)'}}>
      <div style={{fontFamily: 'Special Elite', fontSize: 22, letterSpacing: 3, color: '#6b3a2a'}}>OSTI RECORD · 1994</div>
      <div style={{fontFamily: 'DM Serif Display', fontSize: 34, lineHeight: 1.12, marginTop: 6}}>A perceived low-frequency sound in Taos, New Mexico</div>
    </div>}
    <Bottom />
  </AbsoluteFill>); };

const Docs = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.05], {easing: ez, ...cl});
  const rows = [['REQUESTED BY', "NEW MEXICO'S CONGRESSMEN", 20, 560], ['JOINED IN', 'AIR FORCE PHILLIPS LAB', 66, 760]];
  return (<AbsoluteFill><Back scale={2.2} dim={0.5} />
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      {rows.map(([k, v, at, top], i) => { const t = interpolate(f, [at, at + 12], [0, 1], {easing: ez, ...cl});
        return (<div key={i} style={{position: 'absolute', left: SAFE.left, top: top + 110, width: SAFE.width, opacity: t, transform: `translateX(${(1 - t) * (i ? 120 : -120)}px)`, background: 'rgba(238,232,216,0.95)', color: '#1d1c19', borderRadius: 6, padding: '22px 28px', boxShadow: '0 14px 44px rgba(0,0,0,0.7)'}}>
          <div style={{fontFamily: 'Special Elite', fontSize: 26, letterSpacing: 4, color: '#6b3a2a'}}>{k}</div>
          <div style={{fontFamily: 'DM Serif Display', fontSize: 50, lineHeight: 1.08, marginTop: 6}}>{v}</div></div>); })}
    </AbsoluteFill><Bottom /></AbsoluteFill>); };

// Frequency dial 30-80 Hz, needle sweeps 33 -> 80 between local 51 and 77.
const Dial = ({dur}) => { const f = useCurrentFrame();
  const hz = interpolate(f, [51, 77], [33, 80], {easing: ez, ...cl});
  const x = (h) => SAFE.left + 30 + ((h - 30) / 50) * (SAFE.width - 60);
  const o = interpolate(f, [40, 52], [0, 1], cl);
  const pulse = 0.5 + 0.5 * Math.sin(f * 0.5);
  return (<AbsoluteFill><Back scale={2.2} dim={0.4} />
    <div style={{position: 'absolute', left: SAFE.left, top: 520, width: SAFE.width, textAlign: 'center', fontFamily: 'Special Elite', fontSize: 28, letterSpacing: 5, color: ACC, opacity: o}}>WHAT HEARERS MATCHED IT TO</div>
    <div style={{position: 'absolute', left: SAFE.left, top: 580, width: SAFE.width, textAlign: 'center', fontFamily: 'DM Serif Display', fontSize: 190, lineHeight: 1, color: INK, opacity: o, textShadow: '0 6px 30px rgba(0,0,0,0.8)'}}>{Math.round(hz)}<span style={{fontSize: 80}}> Hz</span></div>
    <div style={{position: 'absolute', left: SAFE.left + 30, top: 900, width: SAFE.width - 60, height: 6, background: 'rgba(238,232,216,0.35)', opacity: o}} />
    {[30, 40, 50, 60, 70, 80].map((h) => (<div key={h} style={{position: 'absolute', left: x(h) - 1, top: 880, width: 3, height: 46, background: 'rgba(238,232,216,0.6)', opacity: o}}><div style={{position: 'absolute', top: 58, left: -20, width: 44, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 24, color: INK}}>{h}</div></div>))}
    <div style={{position: 'absolute', left: x(33), top: 862, width: x(hz) - x(33), height: 12, background: ACC, opacity: 0.55 * o, borderRadius: 6}} />
    <div style={{position: 'absolute', left: x(hz) - 4, top: 840, width: 8, height: 110, background: ACC, borderRadius: 4, opacity: o, boxShadow: `0 0 ${14 + 18 * pulse}px ${ACC}`}} />
    <Bottom /></AbsoluteFill>); };

// PLOS One 2026 card: 28 dots (one per hearer); chip 'TINNITUS: FOR MANY, NOT ALL' on 'many' (local ~140).
const Plos = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.05], {easing: ez, ...cl});
  const t0 = interpolate(f, [8, 20], [0, 1], {easing: ez, ...cl});
  const many = interpolate(f, [138, 150], [0, 1], {easing: ez, ...cl});
  return (<AbsoluteFill><Back scale={2.2} dim={0.38} />
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <div style={{position: 'absolute', left: SAFE.left, top: 520, width: SAFE.width, fontFamily: 'Special Elite', fontSize: 28, letterSpacing: 4, color: ACC, opacity: t0}}>PLOS ONE · 2026</div>
      <div style={{position: 'absolute', left: SAFE.left, top: 570, width: SAFE.width, fontFamily: 'DM Serif Display', fontSize: 110, lineHeight: 1, color: INK, opacity: t0}}>28 hearers</div>
      <div style={{position: 'absolute', left: SAFE.left, top: 730, width: SAFE.width, display: 'flex', flexWrap: 'wrap', gap: 26, justifyContent: 'center'}}>
        {Array.from({length: 28}).map((_, i) => { const a = interpolate(f, [60 + i * 1.2, 70 + i * 1.2], [0, 1], {easing: ez, ...cl});
          return <div key={i} style={{width: 78, height: 78, borderRadius: 39, background: INK, opacity: 0.85 * a, transform: `scale(${0.6 + 0.4 * a})`}} />; })}
      </div>
      <div style={{position: 'absolute', left: SAFE.left + 20, top: 1070, width: SAFE.width - 40, textAlign: 'center', opacity: many, transform: `translateY(${(1 - many) * 12}px)`, border: `4px solid ${ACC}`, borderRadius: 10, padding: '14px 0', background: 'rgba(10,10,12,0.6)', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 34, whiteSpace: 'nowrap', letterSpacing: 1, color: INK}}>TINNITUS: FOR MANY, NOT ALL</div>
    </AbsoluteFill><Bottom /></AbsoluteFill>); };

const Cap = () => { const f = useCurrentFrame(); const y = (f < 173 || f >= 1332) ? 1300 : 1280;
  return <R3DCaption words={VO.words} scheme={SCHEME} y={y} backing />; };

export const TaosHum = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <Sequence from={0} durationInFrames={173}><Adams dur={173} s0={1.0} s1={1.1} /></Sequence>
    <PlateTrack plates={plates} dip={0} />
    <Sequence from={269} durationInFrames={138}><Fade><Docs dur={138} /></Fade></Sequence>
    <Sequence from={683} durationInFrames={109}><Fade><Dial dur={109} /></Fade></Sequence>
    <Sequence from={985} durationInFrames={186}><Fade><Plos dur={186} /></Fade></Sequence>
    <Sequence from={1332} durationInFrames={93}><Adams dur={93} s0={1.0} s1={1.0} card={false} fadeIn={10} /></Sequence>
    <Real3DFinish seed={51} />
    <Head from={0} dur={167} inF={-12} lines={['Labs hunted a sound', 'in Taos']} />
    <Head from={177} dur={88} lines={['A hum most people', 'cannot hear']} />
    <Head from={273} dur={130} lines={['Congress asked.', 'The Air Force joined']} />
    <Head from={411} dur={140} lines={['Mics, seismic sensors,', 'magnetometers']} />
    <Head from={559} dur={120} lines={['Lightning. The grid.', 'A gopher. No hum']} />
    <Head from={687} dur={101} lines={['Hearers matched', 'it to 33-80 Hz']} />
    <Head from={796} dur={185} lines={['1993: the ear expert', 'ruled out tinnitus']} />
    <Head from={989} dur={178} lines={['But in 2026,', 'tinnitus, for many']} />
    <Head from={1175} dur={78} lines={['No sound from', 'their ears, either']} />
    <Head from={1261} dur={67} lines={["Couldn't rule out", 'a real hum']} />
    <Sequence from={1332} durationInFrames={93}><Scrim inF={-6} outF={87} /><R3DHead scheme={SCHEME} lines={['Labs hunted a sound', 'in Taos']} inF={-12} /></Sequence>
    <Tag from={4} dur={160} text="ANSEL ADAMS · NARA · 1941" />
    <Tag from={177} dur={88} text="TAOS · NEW MEXICO" />
    <Tag from={273} dur={130} text="1993 FIELD TEAM" />
    <Tag from={411} dur={140} text="FIELD INSTRUMENTS" />
    <Tag from={559} dur={120} text="SEISMIC TRACE: FLAT" />
    <Tag from={796} dur={185} text="LA TIMES · 1993" />
    <Tag from={989} dur={178} text="PLOS ONE · 2026" />
    <Tag from={1175} dur={78} text="PLOS ONE · 2026" />
    <Tag from={1261} dur={67} text="STILL UNEXPLAINED" />
    <Chip from={875} dur={110} text="1993: NOT TINNITUS" y={1090} w={600} />
    <Chip from={660} dur={23} text="NO HUM." y={1090} w={380} />
    <Cap />
    <IAMark />
    <Sequence from={173} durationInFrames={96}><R3DLabel /></Sequence>
    <Sequence from={407} durationInFrames={276}><R3DLabel /></Sequence>
    <Sequence from={792} durationInFrames={193}><R3DLabel /></Sequence>
    <Sequence from={1171} durationInFrames={161}><R3DLabel /></Sequence>
  </AbsoluteFill>
);
