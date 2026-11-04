// ricky-mccormick-notes v2: REAL3D Short, 45-55 s LENGTH rule (user 2026-11-04 20:10). 53.0 s = 1590 f, voice 51.65 s
// (140 words, Qwen narrator_f seed 51). v1 (31.0 s, 930 f) is in scary-reels/cases/ricky-mccormick-notes/v30_backup/.
// Frame 0 = the REAL FBI scan of note 1 (public domain, US gov, via Wikimedia Commons) + claim headline by 1.5 s.
// Plates = Blender Cycles on GitHub (blender/scenes/ricky-mccormick-notes): b03 cornfield (no body, no figure; NF 255, used twice),
// b04 desk + magnifier on note 1 (NF 304, used twice), b06 pen stops writing, b07 jeans pocket, b08 tip envelopes.
// Remotion cards: b04b the FBI's 4 code-breaking steps (stuck at step 2), b05 2011 appeal (text recreation, no logo),
// b05b FBI 2011 quote card, b07b handwriting close-up, b07c both notes. Ends on note 1 at frame-0 framing (loop).
// No shake: eased pushes only. Scheme dusty-teal. Mini-reveal every <= 12 s: 12.2 undetermined | 18-20 step two / what kind of
// code | 29.6-32.9 page for theories | 33.9-38.5 FBI vs family (twist 'But' 38.45, music drop) | 45.1 courier | 50.5 loop.
// Plate files in public/real3d/ricky-mccormick-notes/: b03.mp4 b04.mp4 b06.mp4 b07.mp4 b08.mp4 (+ note1.jpg note2.jpg).
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel} from '../Real3DKit.jsx';
import VO from './vo.json';

export const MC_FRAMES = 1590;   // 53.0 s; = 6 x 265 for the 6-part GitHub render
export const SCHEME = 'dusty-teal';
const P = 'real3d/ricky-mccormick-notes/';
const ez = Easing.bezier(0.33, 0, 0.2, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const TEAL = '#98C2BF', INK = '#F3F0EA';
// cut map (composition frames, from vo.json): 0 note1 | 115 note2 | 215 b03 field | 400 b04 lab | 567 steps | 651 b04 lab (2) |
// 788 appeal | 929 b08 tips | 1016 FBI quote | 1154 b06 pen ('But' twist) | 1244 handwriting | 1334 b07 jeans | 1379 both notes |
// 1436 b03 field (2) | 1505 note1 loop | 1590 end
const plates = [
  {src: P + 'b03.mp4', from: 215, dur: 185, drift: 0.02},
  {src: P + 'b04.mp4', from: 400, dur: 167, drift: 0.015, punches: [{at: 34, to: 1.03, dur: 24}]},   // 'crack' ~14.5 s
  {src: P + 'b04.mp4', from: 651, dur: 137, drift: 0.015, startFrom: 167},
  {src: P + 'b08.mp4', from: 929, dur: 87, drift: 0.02},
  {src: P + 'b06.mp4', from: 1154, dur: 90, drift: 0.02},
  {src: P + 'b07.mp4', from: 1334, dur: 45, drift: 0.02},
  {src: P + 'b03.mp4', from: 1436, dur: 69, drift: 0.02, startFrom: 185},
];
const Scrim = ({inF, outF, h = 640}) => { const f = useCurrentFrame(); const o = Math.min(1, Math.max(0, (f - inF) / 6)) * (1 - Math.min(1, Math.max(0, (f - outF) / 8)));
  return <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: h, opacity: o, background: 'linear-gradient(rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0) 100%)'}} />; };
const Head = ({from, dur, lines, inF = 0}) => (<Sequence from={from} durationInFrames={dur}><Scrim inF={inF} outF={dur - 8} /><R3DHead scheme={SCHEME} lines={lines} inF={inF} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 1440}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={30} /></Sequence>);
const Fade = ({children}) => { const f = useCurrentFrame(); return <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], cl)}}>{children}</AbsoluteFill>; };
const Bottom = () => <div style={{position: 'absolute', left: 0, top: 1240, width: 1080, height: 680, background: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.75) 100%)'}} />;

// Real FBI scan as a lit sheet over a blurred, darkened copy of itself. One continuous eased push (s0 -> s1) toward
// origin (ox, oy) and an optional eased vertical pan (pan px over the shot). No reversal, no shake.
const Scan = ({img, dur, s0 = 1.0, s1 = 1.12, ox = '50%', oy = '30%', pan = 0, fadeIn = 0}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [s0, s1], {easing: ez, ...cl});
  const ty = interpolate(f, [0, dur], [0, -pan], {easing: ez, ...cl});
  const a = fadeIn ? interpolate(f, [0, fadeIn], [0, 1], cl) : 1;
  return (<AbsoluteFill style={{background: '#0d0e10', opacity: a, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: 'scale(2.0)', filter: 'blur(28px) brightness(0.22)'}}><Img src={staticFile(P + img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
    <AbsoluteFill style={{transform: `translateY(${ty}px) scale(${s})`, transformOrigin: `${ox} ${oy}`}}>
      <div style={{position: 'absolute', left: 40, top: 150, width: 1000, height: 1293, boxShadow: '0 24px 70px rgba(0,0,0,0.85)', overflow: 'hidden'}}>
        <Img src={staticFile(P + img)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.12) brightness(0.93) sepia(0.18)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 75% 60% at 45% 30%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)'}} />
      </div>
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// The FBI's own four code-breaking steps (fbi.gov 2011). Step 1 ticks, step 2 lights up and stays 'stuck', 3-4 stay dim.
const Steps = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.06], {easing: ez, ...cl});
  const rows = ['Language', 'System', 'Key', 'Plaintext'];
  return (<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, #1b2224 0%, #0b0e0f 75%)'}}>
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <div style={{position: 'absolute', left: 162, top: 470, width: 756, fontFamily: 'Special Elite', fontSize: 28, letterSpacing: 4, color: TEAL}}>FBI · 4 STEPS TO BREAK ANY CODE</div>
      {rows.map((r, i) => { const t = interpolate(f, [4 + i * 7, 14 + i * 7], [0, 1], {easing: ez, ...cl}); const stuck = i === 1;
        const glow = stuck ? interpolate(f, [30, 44], [0, 1], cl) : 0;
        return (<div key={i} style={{position: 'absolute', left: 162, top: 540 + i * 120, width: 756, height: 96, opacity: t * (i > 1 ? 0.38 : 1), transform: `translateX(${(1 - t) * -30}px)`,
          border: `3px solid rgba(152,194,191,${0.25 + 0.6 * glow})`, background: `rgba(152,194,191,${0.06 + 0.16 * glow})`, borderRadius: 10, display: 'flex', alignItems: 'center'}}>
          <div style={{width: 96, textAlign: 'center', fontFamily: 'DM Serif Display', fontSize: 58, color: INK}}>{i + 1}</div>
          <div style={{flex: 1, fontFamily: 'Inter', fontWeight: 700, fontSize: 46, color: INK}}>{r}</div>
          <div style={{width: 230, textAlign: 'right', paddingRight: 24, fontFamily: 'Special Elite', fontSize: 30, color: TEAL, opacity: i === 0 ? t : glow}}>{i === 0 ? 'DONE' : stuck ? 'STUCK HERE' : ''}</div>
        </div>); })}
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// 2011 appeal: plain text recreation of the FBI web story headline (no logo, no seal), typed on a dark page; the FBI's own
// update line ('This story has generated an outpouring of responses.') lands on 'Tips poured in' (local frame 98).
const Appeal = ({dur, upd = 98}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.08], {easing: ez, ...cl});
  const t1 = 'Help Solve an Open Murder Case'; const n = Math.floor(Math.max(0, f - 4) * 1.6);
  const u = interpolate(f, [upd, upd + 10], [0, 1], {easing: ez, ...cl});
  return (<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1b2224 0%, #0b0e0f 75%)'}}>
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <div style={{position: 'absolute', left: 162, top: 520, width: 756, fontFamily: 'Special Elite', fontSize: 28, letterSpacing: 4, color: TEAL}}>FBI · NEWS STORY · 29 MARCH 2011</div>
      <div style={{position: 'absolute', left: 162, top: 580, width: 756, fontFamily: 'DM Serif Display', fontSize: 78, lineHeight: 1.08, color: INK}}>{t1.slice(0, n)}</div>
      <div style={{position: 'absolute', left: 162, top: 790, width: 756, fontFamily: 'Inter', fontSize: 34, lineHeight: 1.35, color: 'rgba(243,240,234,0.78)', opacity: interpolate(f, [30, 44], [0, 1], cl)}}>Part 2</div>
      <div style={{position: 'absolute', left: 162, top: 900, width: 600, height: 3, background: 'rgba(152,194,191,0.5)', transform: `scaleX(${interpolate(f, [36, 70], [0, 1], {easing: ez, ...cl})})`, transformOrigin: 'left'}} />
      <div style={{position: 'absolute', left: 162, top: 940, width: 756, fontFamily: 'Inter', fontStyle: 'italic', fontSize: 38, lineHeight: 1.3, color: INK, opacity: u, transform: `translateY(${(1 - u) * 18}px)`}}>
        <span style={{fontFamily: 'Special Elite', fontStyle: 'normal', fontSize: 26, letterSpacing: 3, color: TEAL}}>UPDATE · </span>This story has generated an outpouring of responses.</div>
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// FBI 2011 statement (exact words, archived fbi.gov story) over a dark, blurred note 2. Words fade in one by one, eased push.
const FBIQuote = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.06], {easing: ez, ...cl});
  const q = 'According to members of his family, McCormick had used such encrypted notes since he was a boy.'.split(' ');
  return (<AbsoluteFill style={{background: '#0b0d0e', overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: 'scale(1.6)', filter: 'blur(18px) brightness(0.18)'}}><Img src={staticFile(P + 'note2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <div style={{position: 'absolute', left: 162, top: 470, width: 756, fontFamily: 'Special Elite', fontSize: 28, letterSpacing: 4, color: TEAL}}>THE FBI, 2011</div>
      <div style={{position: 'absolute', left: 162, top: 530, width: 756, fontFamily: 'DM Serif Display', fontSize: 62, lineHeight: 1.16, color: INK}}>
        {'\u201C'}{q.map((w, i) => <span key={i} style={{opacity: interpolate(f, [4 + i * 4, 12 + i * 4], [0, 1], cl)}}>{w}{i < q.length - 1 ? ' ' : ''}</span>)}{'\u201D'}</div>
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// Both real notes side by side, slight opposite tilts, slow push: the re-hook 'So who wrote the code he carried?'
const Both = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.08], {easing: ez, ...cl});
  const card = (img, x, rot) => (<div style={{position: 'absolute', left: x, top: 470, width: 470, height: 608, transform: `rotate(${rot}deg)`, boxShadow: '0 20px 60px rgba(0,0,0,0.85)', overflow: 'hidden'}}>
    <Img src={staticFile(P + img)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.12) brightness(0.9) sepia(0.18)'}} /></div>);
  return (<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #1a2022 0%, #0a0c0d 75%)'}}>
    <AbsoluteFill style={{transform: `scale(${s})`}}>{card('note1.jpg', 60, -3)}{card('note2.jpg', 550, 2.5)}</AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

const Cap = () => { const f = useCurrentFrame(); const y = (f < 215 || f >= 1505) ? 1300 : 1280;
  return <R3DCaption words={VO.words} scheme={SCHEME} y={y} backing />; };

export const McCormickNotes = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <Sequence from={0} durationInFrames={115}><Scan img="note1.jpg" dur={115} s0={1.0} s1={1.14} ox="48%" oy="28%" /></Sequence>
    <Sequence from={115} durationInFrames={100}><Scan img="note2.jpg" dur={100} s0={1.28} s1={1.36} ox="50%" oy="20%" pan={130} /></Sequence>
    <PlateTrack plates={plates} dip={0} />
    <Sequence from={567} durationInFrames={84}><Fade><Steps dur={84} /></Fade></Sequence>
    <Sequence from={788} durationInFrames={141}><Appeal dur={141} upd={98} /></Sequence>
    <Sequence from={1016} durationInFrames={138}><Fade><FBIQuote dur={138} /></Fade></Sequence>
    <Sequence from={1244} durationInFrames={90}><Scan img="note1.jpg" dur={90} s0={2.1} s1={2.4} ox="32%" oy="36%" /></Sequence>
    <Sequence from={1379} durationInFrames={57}><Both dur={57} /></Sequence>
    <Sequence from={1505} durationInFrames={85}><Scan img="note1.jpg" dur={85} s0={1.0} s1={1.0} ox="48%" oy="28%" fadeIn={10} /></Sequence>
    <Real3DFinish seed={51} />
    <Head from={0} dur={104} inF={-12} lines={['2 notes in his pockets', "the FBI can't read"]} />
    <Head from={118} dur={92} lines={['30+ lines', 'letters · numbers · brackets']} />
    <Head from={330} dur={66} lines={['Cause of death', 'undetermined']} />
    <Head from={540} dur={26} lines={['Stuck at', 'step 2']} />
    <Head from={752} dur={34} lines={['No', 'breakthrough']} />
    <Head from={968} dur={46} lines={['A page just', 'for theories']} />
    <Head from={1196} dur={46} lines={['Could barely', 'write his name']} />
    <Head from={1352} dur={26} lines={['Maybe', 'a courier']} />
    <Head from={1381} dur={54} lines={['Who wrote', 'the code?']} />
    <Head from={1480} dur={24} lines={['Case', 'still open']} />
    <Sequence from={1505} durationInFrames={85}><Scrim inF={-6} outF={140} /><R3DHead scheme={SCHEME} lines={['2 notes in his pockets', "the FBI can't read"]} inF={-12} /></Sequence>
    <Tag from={4} dur={108} text="REAL FBI EVIDENCE · NOTE 1 OF 2" />
    <Tag from={118} dur={94} text="REAL FBI EVIDENCE · NOTE 2" />
    <Tag from={218} dur={180} text="ST. CHARLES COUNTY, MISSOURI · 30 JUNE 1999" />
    <Tag from={404} dur={160} text="FBI CRYPTANALYSIS UNIT · CRRU" />
    <Tag from={655} dur={130} text="AMERICAN CRYPTOGRAM ASSOCIATION" />
    <Tag from={933} dur={80} text="FBI COMMENTS PAGE · 2011" />
    <Tag from={1158} dur={84} text="HIS FAMILY · RIVERFRONT TIMES, 2012" />
    <Tag from={1248} dur={84} text="CIPHER EXPERT ELONKA DUNIN · 2012" />
    <Tag from={1440} dur={62} text="CASE STILL OPEN" />
    <Cap />
    <IAMark />
    <Sequence from={215} durationInFrames={352}><R3DLabel /></Sequence>
    <Sequence from={651} durationInFrames={137}><R3DLabel /></Sequence>
    <Sequence from={929} durationInFrames={87}><R3DLabel /></Sequence>
    <Sequence from={1154} durationInFrames={90}><R3DLabel /></Sequence>
    <Sequence from={1334} durationInFrames={45}><R3DLabel /></Sequence>
    <Sequence from={1436} durationInFrames={69}><R3DLabel /></Sequence>
  </AbsoluteFill>
);
