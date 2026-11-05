// oak-island-money-pit: REAL3D Short, 50.0 s = 1500 f (voice 48.14 s, Qwen narrator_m seed 41). Timeline format with a depth gauge.
// Frame 0 = the REAL 1866 New York Herald headline scan (public domain, Wikimedia Commons) + claim headline by 1.5 s.
// Plates = Blender Cycles on GitHub (blender/scenes/oak-island-money-pit): b02 shaft (NF 260, used twice), b03 stone (NF 290, twice),
// b04 water, b06 sinkhole cutaway, b07 empty bucket. Remotion cards: strata materials, NARA 1909 FDR photo, 1971 monitor card, loop.
// No shake: eased pushes only. Scheme stone. Mini-reveal every <= 12 s: 4.4 platform | 11.5 stone | 15.8 hard/water | 21.2 FDR |
// 25.5 camera | 29-32 never confirmed | 32.9 twist 'But' (music drop at 'explained' 46.98) | 38.6 1949 | 46.9 loop.
// Plate files in public/real3d/oak-island-money-pit/: b02.mp4 b03.mp4 b04.mp4 b06.mp4 b07.mp4 (+ herald1866.jpg fdr1909.jpg).
import {AbsoluteFill, Sequence, Img, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';
import {PlateTrack, Real3DFinish, R3DTag, IAMark, R3DFonts, R3DCaption, R3DHead, R3DLabel, SCHEMES} from '../Real3DKit.jsx';
import {SAFE} from '../textfit.js';
import VO from './vo.json';

export const OAK_FRAMES = 1500;   // 50.0 s = 6 x 250 for the 6-part GitHub render
export const SCHEME = 'stone';
const P = 'real3d/oak-island-money-pit/';
const ez = Easing.bezier(0.33, 0, 0.2, 1);
const cl = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'};
const S = SCHEMES[SCHEME];
const INK = S.text, ACC = S.active;
// cut map (composition frames, from cues.json): 0 herald | 130 b02 shaft | 229 strata | 344 b03 stone | 473 b04 water | 637 FDR |
// 711 b02 (2) camera | 866 monitor card | 983 b06 sinkhole ('But' twist) | 1158 b03 (2) | 1317 b07 bucket | 1404 herald loop | 1500 end
const plates = [
  {src: P + 'b02.mp4', from: 130, dur: 99, drift: 0.02},
  {src: P + 'b03.mp4', from: 344, dur: 129, drift: 0.015},
  {src: P + 'b04.mp4', from: 473, dur: 164, drift: 0.015, punches: [{at: 24, to: 1.03, dur: 24}]},   // 'hard' 16.18 s
  {src: P + 'b02.mp4', from: 711, dur: 155, drift: 0.015, startFrom: 100},
  {src: P + 'b06.mp4', from: 983, dur: 175, drift: 0.02, punches: [{at: 0, to: 1.035, dur: 26}]},    // 'But' twist
  {src: P + 'b03.mp4', from: 1158, dur: 159, drift: 0.015, startFrom: 130},
  {src: P + 'b07.mp4', from: 1317, dur: 87, drift: 0.02},
];
const Scrim = ({inF, outF, h = 640}) => { const f = useCurrentFrame(); const o = Math.min(1, Math.max(0, (f - inF) / 6)) * (1 - Math.min(1, Math.max(0, (f - outF) / 8)));
  return <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: h, opacity: o, background: 'linear-gradient(rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.48) 45%, rgba(0,0,0,0) 100%)'}} />; };
const Head = ({from, dur, lines, inF = 0}) => (<Sequence from={from} durationInFrames={dur}><Scrim inF={inF} outF={dur - 8} /><R3DHead scheme={SCHEME} lines={lines} inF={inF} outF={dur - 6} /></Sequence>);
const Tag = ({from, dur, text, y = 1440}) => (<Sequence from={from} durationInFrames={dur}><R3DTag text={text} at={0} y={y} size={30} /></Sequence>);
const Fade = ({children}) => { const f = useCurrentFrame(); return <AbsoluteFill style={{opacity: interpolate(f, [0, 6], [0, 1], cl)}}>{children}</AbsoluteFill>; };
const Bottom = () => <div style={{position: 'absolute', left: 0, top: 1240, width: 1080, height: 680, background: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.75) 100%)'}} />;

// Real 1866 Herald headline (450x972 scan) as a lit sheet over a blurred, darkened copy of itself. One eased push, no reversal.
const Herald = ({dur, s0 = 1.0, s1 = 1.1, ox = '50%', oy = '30%', fadeIn = 0}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [s0, s1], {easing: ez, ...cl});
  const a = fadeIn ? interpolate(f, [0, fadeIn], [0, 1], cl) : 1;
  return (<AbsoluteFill style={{background: '#0d0e10', opacity: a, overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: 'scale(2.2)', filter: 'blur(30px) brightness(0.22)'}}><Img src={staticFile(P + 'herald1866.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${ox} ${oy}`}}>
      <div style={{position: 'absolute', left: 300, top: 450, width: 480, height: 1036, boxShadow: '0 24px 70px rgba(0,0,0,0.85)', overflow: 'hidden', background: '#d8cfb8'}}>
        <Img src={staticFile(P + 'herald1866.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.1) brightness(0.88) sepia(0.28)'}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 35%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.5) 100%)'}} />
      </div>
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// Strata cross-section: charcoal / putty / coconut fiber, each band slides in on its spoken word (local frames 27 / 49 / 75).
const Strata = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.05], {easing: ez, ...cl});
  const rows = [['CHARCOAL', 27, '#2a2a28', '#6a6862'], ['PUTTY', 49, '#b9ab8c', '#4b4331'], ['COCONUT FIBER', 75, '#7a5f3d', '#e8dcc2']];
  return (<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, #231f1a 0%, #0c0b0a 75%)'}}>
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <div style={{position: 'absolute', left: SAFE.left, top: 520, width: SAFE.width, fontFamily: 'Special Elite', fontSize: 28, letterSpacing: 4, color: ACC}}>PER THE DIGGERS' ACCOUNTS</div>
      <div style={{position: 'absolute', left: SAFE.left, top: 590, width: SAFE.width, height: 40, background: 'repeating-linear-gradient(90deg, #5a4630 0 46px, #46361f 46px 52px)', borderRadius: 4}} />
      {rows.map(([name, at, bg, fg], i) => { const t = interpolate(f, [at - 8, at + 6], [0, 1], {easing: ez, ...cl});
        return (<div key={i} style={{position: 'absolute', left: SAFE.left, top: 640 + i * 150, width: SAFE.width * t, height: 130, overflow: 'hidden', background: bg, borderRadius: 6, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'}}>
          <div style={{position: 'absolute', left: 28, top: 0, height: 130, display: 'flex', alignItems: 'center', fontFamily: 'Inter', fontWeight: 800, fontSize: 46, letterSpacing: 3, color: fg, whiteSpace: 'nowrap'}}>{name}</div>
        </div>); })}
      <div style={{position: 'absolute', left: SAFE.left, top: 640 + 3 * 150, width: SAFE.width, height: 40, background: 'repeating-linear-gradient(90deg, #5a4630 0 46px, #46361f 46px 52px)', borderRadius: 4, opacity: interpolate(f, [80, 92], [0, 1], cl)}} />
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// NARA 1909 FDR photo (public domain), landscape, as a sheet over a blurred copy; eased push + gentle pan. Chip '1909' on 'Roosevelt'.
const FDR = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.16], {easing: ez, ...cl});
  const tx = interpolate(f, [0, dur], [20, -30], {easing: ez, ...cl});
  const c = interpolate(f, [14, 22], [0, 1], {easing: ez, ...cl});
  return (<AbsoluteFill style={{background: '#0d0d0c', overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: 'scale(2.6)', filter: 'blur(26px) brightness(0.25)'}}><Img src={staticFile(P + 'fdr1909.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} /></AbsoluteFill>
    <AbsoluteFill style={{transform: `translateX(${tx}px) scale(${s})`, transformOrigin: '50% 45%'}}>
      <div style={{position: 'absolute', left: 100, top: 700, width: 880, height: 510, boxShadow: '0 24px 70px rgba(0,0,0,0.85)', overflow: 'hidden'}}>
        <Img src={staticFile(P + 'fdr1909.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.08) brightness(0.92) sepia(0.2)'}} />
      </div>
    </AbsoluteFill>
    <div style={{position: 'absolute', left: SAFE.left, top: 470, width: SAFE.width, textAlign: 'center', opacity: c, transform: `translateY(${(1 - c) * 12}px)`}}>
      <span style={{fontFamily: 'DM Serif Display', fontSize: 120, color: INK, textShadow: '0 4px 22px rgba(0,0,0,0.9)'}}>1909</span></div>
    <Bottom />
  </AbsoluteFill>); };

// 1971 monitor card: murky static, scanlines, '1971 · CAMERA · 235 FT'; stamp NEVER CONFIRMED lands on 'confirmed' (local frame 86).
const Monitor = ({dur}) => { const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, 1.06], {easing: ez, ...cl});
  const st = interpolate(f, [84, 94], [0, 1], {easing: ez, ...cl});
  const sx = (f * 37) % 360;
  return (<AbsoluteFill style={{background: '#070807', overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${s})`}}>
      <AbsoluteFill style={{opacity: 0.55, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='2' seed='${(f >> 1) % 32}'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`, backgroundSize: '360px 360px', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 3px, rgba(0,0,0,0) 3px 7px)'}} />
      <div style={{position: 'absolute', left: 0, top: 520 + sx, width: 1080, height: 90, background: 'linear-gradient(rgba(180,190,180,0), rgba(180,190,180,0.10), rgba(180,190,180,0))'}} />
      <div style={{position: 'absolute', left: SAFE.left, top: 560, width: SAFE.width, fontFamily: 'Special Elite', fontSize: 30, letterSpacing: 4, color: ACC}}>● REC · 1971 · CAMERA IN THE SHAFT</div>
      <div style={{position: 'absolute', left: SAFE.left, top: 620, width: SAFE.width, fontFamily: 'DM Serif Display', fontSize: 150, lineHeight: 1.0, color: INK, opacity: 0.9}}>235 FT</div>
      <div style={{position: 'absolute', left: SAFE.left + 40, top: 880, width: SAFE.width - 80, textAlign: 'center', border: `5px solid ${ACC}`, borderRadius: 8, padding: '18px 0', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 64, letterSpacing: 4, color: INK, opacity: st, transform: `rotate(-3deg) scale(${1.15 - 0.15 * st})`, background: 'rgba(10,10,9,0.55)'}}>NEVER CONFIRMED</div>
    </AbsoluteFill>
    <Bottom />
  </AbsoluteFill>); };

// Depth gauge chip (timeline format): 0 -> 10/20/30 FT with the platforms, 90 FT stone, 98 FT hard, then the 1971 camera down to 235 FT.
const GAUGE = [[0, 0], [135, 0], [165, 10], [192, 20], [219, 30], [344, 30], [348, 90], [510, 90], [512, 98], [637, 98]];
const CAM = [[740, 0], [811, 235], [866, 235]];
const Gauge = () => { const f = useCurrentFrame();
  const inCam = f >= 711; const pts = inCam ? CAM : GAUGE;
  const v = Math.round(interpolate(f, pts.map((p) => p[0]), pts.map((p) => p[1]), {easing: ez, ...cl}));
  const o = (f < 20 ? interpolate(f, [8, 20], [0, 1], cl) : 1) * (f >= 637 && f < 711 ? 0 : 1) * (f >= 866 ? 0 : 1);
  if (o <= 0) return null;
  return (<div style={{position: 'absolute', left: SAFE.left + 150, top: 1130, width: SAFE.width - 300, height: 84, borderRadius: 12, background: S.chip, opacity: 0.88 * o, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, boxShadow: '0 6px 24px rgba(0,0,0,0.6)'}}>
    <span style={{fontFamily: 'Special Elite', fontSize: 26, letterSpacing: 4, color: ACC}}>{inCam ? '1971 DEPTH' : 'DEPTH'}</span>
    <span style={{fontFamily: 'Montserrat', fontWeight: 800, fontSize: 48, color: S.chipText, minWidth: 150, textAlign: 'right'}}>{v} FT</span>
  </div>); };

const Cap = () => { const f = useCurrentFrame(); const y = (f < 130 || f >= 1404) ? 1300 : 1280;
  return <R3DCaption words={VO.words} scheme={SCHEME} y={y} backing />; };

export const OakIsland = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <R3DFonts />
    <Sequence from={0} durationInFrames={130}><Herald dur={130} s0={1.0} s1={1.1} /></Sequence>
    <PlateTrack plates={plates} dip={0} />
    <Sequence from={229} durationInFrames={115}><Fade><Strata dur={115} /></Fade></Sequence>
    <Sequence from={637} durationInFrames={74}><Fade><FDR dur={74} /></Fade></Sequence>
    <Sequence from={866} durationInFrames={117}><Fade><Monitor dur={117} /></Fade></Sequence>
    <Sequence from={1404} durationInFrames={96}><Herald dur={96} s0={1.0} s1={1.0} fadeIn={10} /></Sequence>
    <Real3DFinish seed={41} />
    <Head from={0} dur={124} inF={-12} lines={['One hole, 200 years', 'of treasure hunts']} />
    <Head from={134} dur={92} lines={['A log platform', 'every 10 feet']} />
    <Head from={349} dur={118} lines={['A carved stone', 'at 90 feet']} />
    <Head from={480} dur={150} lines={['Something hard', 'then 60 feet of water']} />
    <Head from={640} dur={68} lines={['FDR dug', 'here too']} />
    <Head from={716} dur={146} lines={['1971 camera', '235 feet down']} />
    <Head from={990} dur={170} lines={['But geologists say', 'a natural sinkhole?']} />
    <Head from={1162} dur={150} lines={['The stone symbols', 'only drawn in 1949']} />
    <Head from={1320} dur={80} lines={['No treasure', 'ever came out']} />
    <Sequence from={1404} durationInFrames={96}><Scrim inF={-6} outF={90} /><R3DHead scheme={SCHEME} lines={['One hole, 200 years', 'of treasure hunts']} inF={-12} /></Sequence>
    <Tag from={4} dur={120} text="NEW YORK HERALD · 1866" />
    <Tag from={134} dur={92} text="OAK ISLAND · NOVA SCOTIA" />
    <Tag from={352} dur={118} text="STONE REPORTED AT 90 FT" />
    <Tag from={476} dur={158} text="THE PIT FILLED WITH WATER" />
    <Tag from={640} dur={68} text="NARA PHOTO · FDR LIBRARY" />
    <Tag from={714} dur={150} text="CAMERA SHAFT · 1971" />
    <Tag from={986} dur={170} text="GEOLOGISTS · SINKHOLE THEORY" />
    <Tag from={1162} dur={150} text="ONLY DRAWING DATES FROM 1949" />
    <Tag from={1320} dur={80} text="NO TREASURE RECOVERED" />
    <Gauge />
    <Cap />
    <IAMark />
    <Sequence from={130} durationInFrames={99}><R3DLabel /></Sequence>
    <Sequence from={344} durationInFrames={293}><R3DLabel /></Sequence>
    <Sequence from={711} durationInFrames={155}><R3DLabel /></Sequence>
    <Sequence from={983} durationInFrames={421}><R3DLabel /></Sequence>
  </AbsoluteFill>
);
