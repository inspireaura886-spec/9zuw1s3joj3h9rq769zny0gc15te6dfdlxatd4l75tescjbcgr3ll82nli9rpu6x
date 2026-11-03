import {pal} from '../../../palette.js'; // HUMANE caption palette 2026-11-03
// LF06 FILE 007 "If You Ever Find a Message Nobody Can Read... STOP GUESSING" - 1920x1080 @ 24 fps, one composition per chapter.
// Shots are data: a..b = voice line indices (b exclusive; null = to the end); optional from/to = word cues {l,w,o} to split a long line.
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {FontFaces, Finish, Dip} from '../../kit/index.js';
import {FPS, FR, ChCtx, QuoteShot, CheckShot, ArchShot, Sub, STROKE, secOf} from './shots.jsx';
import {StatShot, EndCardShot, StingShot} from './radio.jsx';
import {NotebookShot} from './sky.jsx';
import {KpuShot} from './dark.jsx';
import {CipherShot, ScrapShot, CodeShot} from './codes.jsx';
import V_COLD from './vo_COLD.json'; import V_CH1 from './vo_CH1.json'; import V_CH2 from './vo_CH2.json'; import V_CH3 from './vo_CH3.json'; import V_CH4 from './vo_CH4.json';
import V_CH5 from './vo_CH5.json'; import V_CH6 from './vo_CH6.json'; import V_CH7 from './vo_CH7.json'; import V_OUTRO from './vo_OUTRO.json';

const VOS = {COLD: V_COLD, CH1: V_CH1, CH2: V_CH2, CH3: V_CH3, CH4: V_CH4, CH5: V_CH5, CH6: V_CH6, CH7: V_CH7, OUTRO: V_OUTRO};
export const GAP = 0.6; const OUTRO_TAIL = 12;
export const frames = (id) => FR(VOS[id].dur + GAP + (id === 'OUTRO' ? OUTRO_TAIL : 0));
export const STING_FRAMES = 48;
const c = (t, p, l, fov = 46) => ({t, pos: p, look: l, fov});
const T = {cipher: CipherShot, scrap: ScrapShot, screen: (p) => <CodeShot scene="screen" {...p} />, book: (p) => <CodeShot scene="book" {...p} />, beach: (p) => <CodeShot scene="beach" {...p} />, hill: (p) => <CodeShot scene="hill" {...p} />, disc: (p) => <CodeShot scene="disc" {...p} />,
  kpu: KpuShot, note: NotebookShot, stat: StatShot, end: EndCardShot, quote: QuoteShot, check: CheckShot, arch: ArchShot};
const RULES = {CH1: 'SOUND TRAVELS FARTHER THAN YOU THINK', CH2: 'EARS BUILT FOR WAR BECOME EARS FOR SCIENCE', CH3: 'A NICKNAME IS NOT A DIAGNOSIS', CH4: 'COMPARE IT WITH SOUNDS YOU KNOW', CH5: 'READ THE SHAPE. ADMIT ONE EAR.', CH6: 'DATE YOUR LABEL', CH7: 'SAY "UNRESOLVED" OUT LOUD'};

// cameras
const SCREEN_WIDE = [c(0, [-24, 7, 16], [0, 3, -14], 56), c(1, [16, 5, 12], [4, 3, -14], 50)];
const SCREEN_PUSH = [c(0, [-4, 3, 4], [4, 3.2, -14], 52), c(1, [8, 3, -4], [11, 3.2, -14], 40)];
const SCREEN_LOW = [c(0, [10, 1.6, -2], [10, 3.4, -14], 48), c(1, [13, 2.2, -7], [11, 3.4, -14], 40)];
const SCREEN_HIGH = [c(0, [0, 18, 10], [0, 1, -14], 58), c(1, [-6, 14, 2], [2, 1, -14], 52)];
const BOOK_TOP = [c(0, [0, 11, 5], [0, 0, 0], 46), c(1, [0, 7, 3.5], [0, 0, 0], 40)];
const BOOK_SIDE = [c(0, [-9, 4, 8], [0, 0.4, 0], 50), c(1, [-3, 3, 8], [1, 0.4, 0], 44)];
const BOOK_PLANT = [c(0, [-5, 5, 3], [-2.2, 0.3, 0], 42), c(1, [-3, 4, 2.2], [-2.2, 0.3, 0], 34)];
const BEACH_WIDE = [c(0, [-14, 4, 18], [0, 0.4, 6], 50), c(1, [-7, 2.6, 13], [0, 0.4, 6], 42)];
const BEACH_LOW = [c(0, [-4, 1.4, 11], [0, 0.4, 6], 42), c(1, [-2, 1.0, 9], [0, 0.4, 6], 32)];
const HILL_WIDE = [c(0, [-22, 7, 10], [2, 1, -12], 56), c(1, [-10, 5, 8], [3, 1, -13], 50)];
const HILL_BOX = [c(0, [-4, 3, -4], [4, 0.8, -14], 48), c(1, [1, 2.6, -8], [4, 0.9, -14], 38)];
const DISC_FRONT = [c(0, [0, 2, 12], [0, 0.2, 0], 44), c(1, [0, 1.6, 8.5], [0, 0.2, 0], 38)];
const DISC_SIDE = [c(0, [-8, 3, 8], [0, 0.2, 0], 48), c(1, [6, 2.4, 8], [0, 0.2, 0], 42)];

export const SHOTS = {
  COLD: [
    {a: 0, b: 1, T: 'screen', cam: SCREEN_WIDE, big: [{l: 0, w: 'sound', lines: [{text: 'A SOUND', color: 'white'}, {text: 'NOBODY CAN NAME', color: 'red'}], y: 80, size: 120}, {l: 0, w: 'keep', lines: [{text: 'KEEP LISTENING', color: 'yellow'}], y: 130, size: 150}]},
    {a: 1, to: {l: 1, w: 'loud'}, T: 'stat', text: 'SUMMER 1997', label: 'UNDERWATER MICROPHONES · PACIFIC', sub: 'A SOUND RISES FOR ABOUT A MINUTE', rings: true, color: '#7fe3ff'},
    {from: {l: 1, w: 'loud'}, b: 2, T: 'stat', number: 5000, label: 'KM APART · SENSORS HEARD IT', sub: 'SOURCE: NOAA PMEL', rings: true, color: pal().alt},
    {a: 2, b: 3, T: 'quote', head: 'THE QUESTION', lines: ['WHAT ANIMAL', 'MAKES THAT?', 'NOAA: NOT AN ANIMAL'], hi: [2], size: 80},
    {a: 3, to: {l: 3, w: 'and'}, T: 'stat', text: '7 SOUNDS · 7 RULES', label: 'BLOOP · SLOW DOWN · TRAIN · JULIA · WHISTLE · UPSWEEP · 52 HZ', rings: true},
    {from: {l: 3, w: 'and'}, b: 4, T: 'stat', text: 'SINCE 1991', label: 'STILL NO CONFIRMED SOURCE', rings: true, color: pal().active},
    {a: 4, b: null, T: 'screen', cam: SCREEN_HIGH, big: [{l: 4, w: 'end', lines: [{text: 'STAY TO THE END', color: 'yellow'}], y: 90, size: 120}]},
  ],
  CH1: [
    {a: 0, b: 1, T: 'screen', cam: SCREEN_PUSH, big: [{l: 0, w: 'sofar', lines: [{text: 'THE SOFAR CHANNEL', color: 'yellow'}], y: 80, size: 120}]},
    {a: 1, b: 2, T: 'quote', head: 'FOUND INDEPENDENTLY · 1940s', lines: ['MAURICE EWING + LAMAR WORZEL · USA', 'LEONID BREKHOVSKIKH · USSR'], hi: [0, 1], size: 56},
    {a: 2, to: {l: 2, w: 'second'}, T: 'stat', text: '1944 · SALUDA', label: 'A MICROPHONE HUNG FROM A SAILING SHIP', rings: true, color: '#7fe3ff'},
    {from: {l: 2, w: 'second'}, b: 3, T: 'stat', number: 1700, label: 'KM AWAY · THE CHARGE WAS HEARD', sub: '900 NAUTICAL MILES', rings: true, color: pal().active},
    {a: 3, b: 4, T: 'stat', text: '9,200 KM', label: 'HEARD ISLAND TO ASCENSION ISLAND', sub: 'ARRIVED ~1 H 44 MIN LATER', rings: true, color: pal().alt},
    {a: 4, b: null, T: 'quote', head: 'RULE 1', lines: ['IN THE OCEAN', 'A SOUND CAN COME', 'FROM MUCH FARTHER', 'AWAY THAN YOU THINK.'], hi: [3], size: 82},
  ],
  CH2: [
    {a: 0, b: 1, T: 'screen', cam: SCREEN_LOW, big: [{l: 0, w: 'united', lines: [{text: 'WHO WAS LISTENING?', color: 'white'}, {text: 'THE US NAVY', color: 'yellow'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'quote', head: 'SOSUS · SOUND SURVEILLANCE SYSTEM', lines: ['CHAIN OF UNDERWATER MICROPHONES', 'TO TRACK SOVIET SUBMARINES', 'COVER NAME: PROJECT CAESAR'], hi: [2], size: 56},
    {a: 2, to: {l: 2, w: 'by'}, T: 'stat', text: '1951', label: 'FIRST ARRAY · ELEUTHERA, BAHAMAS', rings: true, color: '#7fe3ff'},
    {from: {l: 2, w: 'by'}, b: 3, T: 'stat', text: '6 JULY 1962', label: 'FIRST DETECTION OF A SOVIET NUCLEAR SUBMARINE', sub: '40 HYDROPHONES BY 1952', rings: true, color: pal().alt},
    {a: 3, b: 4, T: 'stat', text: '1991', label: 'DECLASSIFIED · NOAA PMEL BEGINS RECORDING', sub: 'AUGUST 1991 · OPENED TO SCIENTISTS 1992', rings: true, color: pal().active},
    {a: 4, b: null, T: 'quote', head: 'RULE 2', lines: ['EARS BUILT FOR WAR', 'CAN BECOME', 'EARS FOR SCIENCE.'], hi: [2], size: 90},
  ],
  CH3: [
    {a: 0, b: 1, T: 'screen', cam: SCREEN_WIDE, big: [{l: 0, w: 'bloop', lines: [{text: 'THE BLOOP', color: 'red'}], y: 90, size: 170}]},
    {a: 1, to: {l: 1, w: 'it'}, T: 'stat', text: 'SUMMER 1997', label: 'ULTRA-LOW-FREQUENCY · HIGH-AMPLITUDE', sub: 'RISES IN FREQUENCY FOR ~1 MINUTE', rings: true, color: '#7fe3ff'},
    {from: {l: 1, w: 'it'}, b: 2, T: 'stat', text: '50°S · 100°W', label: 'TRIANGULATED · SOUTH PACIFIC', sub: 'HEARD >5,000 KM APART', rings: true, color: pal().active},
    {a: 2, to: {l: 2, w: 'then'}, T: 'quote', head: '2001 · CHRISTOPHER FOX · NOAA', lines: ['TOLD CNN:', 'ICE CALVING IN ANTARCTICA'], hi: [1], size: 70},
    {from: {l: 2, w: 'then'}, b: 3, T: 'quote', head: '2002 · NEW SCIENTIST', lines: ['RESEMBLES A LIVING CREATURE', 'BUT FAR MORE POWERFUL', 'THAN ANY ANIMAL ON EARTH'], hi: [2], size: 60},
    {a: 3, b: 4, T: 'stat', text: 'THE NAME STUCK', label: 'AND SO DID THE MONSTER', rings: true, color: pal().alt},
    {a: 4, b: null, T: 'quote', head: 'RULE 3', lines: ['A NICKNAME', 'IS NOT A DIAGNOSIS.'], hi: [1], size: 100},
  ],
  CH4: [
    {a: 0, b: 1, T: 'stat', text: 'ICE', label: 'WHAT THE BLOOP TURNED OUT TO BE', rings: true, color: '#7fe3ff'},
    {a: 1, b: 2, T: 'quote', head: 'NOAA PMEL', lines: ['CONSISTENT WITH ICEQUAKES', 'FROM LARGE ICEBERGS', 'CRACKING AND FRACTURING'], hi: [0], size: 62},
    {a: 2, b: 3, T: 'stat', text: 'ICEBERG A53a', label: 'TRACKED VIA SCOTIA SEA HYDROPHONES', sub: 'BROKE APART NEAR SOUTH GEORGIA · EARLY 2008', rings: true, color: '#9be15d'},
    {a: 3, b: 4, T: 'quote', head: 'BRANSFIELD STRAIT + SCOTIA SEA · 2005-2009', lines: ['ICEQUAKES ARE A PROMINENT', 'PART OF THE OCEAN SOUNDSCAPE'], hi: [0], size: 58},
    {a: 4, b: 5, T: 'quote', head: 'THE BLOOP', lines: ['NOT A NEW SOUND.', 'A VERY OLD ONE,', 'MADE BIG BY DISTANCE.'], hi: [2], size: 80},
    {a: 5, b: null, T: 'quote', head: 'RULE 4', lines: ['BEFORE YOU INVENT', 'SOMETHING NEW,', 'COMPARE IT WITH SOUNDS', 'YOU ALREADY KNOW.'], hi: [3], size: 80},
  ],
  CH5: [
    {a: 0, b: 1, T: 'check', title: 'A FAMILY OF NICKNAMES', rows: [{name: 'SLOW DOWN', what: 'ICEBERG', l: 0, w: 'slow'}, {name: 'TRAIN', what: 'ICEBERG', l: 0, w: 'train'}, {name: 'JULIA', what: 'ICEBERG', l: 0, w: 'julia'}, {name: 'WHISTLE', what: 'UNLOCATED', l: 0, w: 'whistle'}]},
    {a: 1, b: 2, T: 'stat', text: 'SLOW DOWN', label: '19 MAY 1997 · ~62°S · PITCH FALLS FOR ~7 MIN', sub: 'NOAA: A DRIFTING ICEBERG GROUNDING', rings: true, color: '#7fe3ff'},
    {a: 2, b: 3, T: 'stat', text: 'TRAIN', label: '4 MARCH 1997 · ~32-35 HZ TONE', sub: 'ICEBERG GROUNDED NEAR CAPE ADARE, ROSS SEA', rings: true, color: pal().active},
    {a: 3, b: 4, T: 'stat', text: 'JULIA', label: '1 MARCH 1999', sub: 'MOST LIKELY A LARGE ICEBERG AGROUND OFF ANTARCTICA', rings: true, color: '#9be15d'},
    {a: 4, b: 5, T: 'stat', text: 'WHISTLE', label: '7 JULY 1997 · HEARD BY ONE INSTRUMENT', sub: 'LOCATING A SOURCE TAKES THREE', rings: true, color: pal().alt},
    {a: 5, b: null, T: 'quote', head: 'RULE 5', lines: ['READ THE SHAPE.', 'THEN ADMIT', 'WHEN YOU ONLY', 'HAVE ONE EAR.'], hi: [3], size: 82},
  ],
  CH6: [
    {a: 0, b: 1, T: 'screen', cam: SCREEN_HIGH, big: [{l: 0, w: 'quiet', lines: [{text: 'ONE SOUND', color: 'white'}, {text: 'TWO DESCRIPTIONS', color: 'yellow'}], y: 80, size: 120}]},
    {a: 1, b: 2, T: 'quote', head: 'OLDER NOAA OCEAN EXPLORER PAGE · SLOW DOWN', lines: ['ORIGIN: UNKNOWN', 'NEAR 15°S · 115°W', '~2,000 KM FROM SENSORS'], hi: [0], size: 60},
    {a: 2, b: 3, T: 'quote', head: 'NEWER NOAA PMEL PAGE · SLOW DOWN', lines: ['NEAR 62°S · ANTARCTIC PENINSULA', '~5,000 KM RANGE', 'SOURCE: A GROUNDING ICEBERG'], hi: [2], size: 58},
    {a: 3, b: 4, T: 'stat', text: 'NOT A COVER-UP', label: 'THREE SENSORS + YEARS OF COMPARISON', sub: 'THAT IS SCIENCE UPDATING', rings: true, color: '#9be15d'},
    {a: 4, b: null, T: 'quote', head: 'RULE 6', lines: ['DATE YOUR LABEL.', 'UNKNOWN TODAY MAY BE', 'KNOWN AFTER MORE DATA.'], hi: [2], size: 80},
  ],
  CH7: [
    {a: 0, b: 1, T: 'screen', cam: SCREEN_LOW, big: [{l: 0, w: 'two', lines: [{text: 'TWO SOUNDS', color: 'white'}, {text: 'LEFT', color: 'red'}], y: 80, size: 130}]},
    {a: 1, to: {l: 1, w: 'it'}, T: 'stat', text: 'UPSWEEP', label: 'UPWARD SWEEPS · ~3 S EACH · ~54°S 140°W', sub: 'THERE WHEN NOAA BEGAN RECORDING · AUG 1991', rings: true, color: '#7fe3ff'},
    {from: {l: 1, w: 'it'}, b: 2, T: 'quote', head: 'NOAA ON UPSWEEP', lines: ['ORIGIN: UNRESOLVED', 'PEAKS IN SPRING AND AUTUMN', 'QUIETER SINCE 1991'], hi: [0], size: 66},
    {a: 2, to: {l: 2, w: 'blue'}, T: 'stat', text: '52 HERTZ', label: 'NORTH PACIFIC · WOODS HOLE · 1989', sub: 'TRACKED EVERY YEAR THROUGH AT LEAST 2014', rings: true, color: pal().active},
    {from: {l: 2, w: 'blue'}, b: 3, T: 'quote', head: 'THE ANIMAL', lines: ['BLUE WHALES: 10-39 HZ', 'FIN WHALES: ~20 HZ', 'NEVER CONFIRMED BY SIGHT'], hi: [2], size: 62},
    {a: 3, b: 4, T: 'quote', head: '2021 · A DOCUMENTARY', lines: ['A POSSIBLE ANSWER:', 'A BLUE-FIN WHALE HYBRID', 'A POSSIBILITY. NOT A FACT.'], hi: [2], size: 62},
    {a: 4, b: null, T: 'quote', head: 'RULE 7', lines: ['SAY “UNRESOLVED”', 'OUT LOUD.', 'THAT IS HOW THE NEXT PERSON', 'KNOWS WHERE TO LISTEN.'], hi: [1], size: 82},
  ],
  OUTRO: [
    {a: 0, b: 1, T: 'note', head: 'FILE 007 · FIELD NOTES', lines: ['SOUND TRAVELS FAR.', 'EARS BUILT FOR WAR.', 'A NICKNAME PROVES NOTHING.', 'COMPARE IT. READ THE SHAPE. DATE THE LABEL.', 'SAY WHAT YOU DO NOT KNOW.'], hi: [4], typeSecs: 9},
    {a: 1, b: null, T: 'end', subscribeAt: {l: 1, o: 1.2}, title: 'ANOTHER FILE OPENS SOON', sub: 'FILE 007 CLOSED'},
  ],
};

const RuleHud = ({id}) => {
  const n = id.startsWith('CH') ? parseInt(id.slice(2), 10) : 0; const f = useCurrentFrame(); const {fps} = useVideoConfig();
  if (!n) return null;
  const k = spring({frame: f, fps, config: {damping: 12, stiffness: 150}}); const out = Math.min(1, Math.max(0, (f - FR(3.0)) / 8));
  return <>
    {f < FR(3.4) && <div style={{position: 'absolute', left: 0, right: 0, top: 360, height: 300, background: 'rgba(4,6,12,0.88)', borderTop: `6px solid ${pal().active}`, borderBottom: `6px solid ${pal().active}`, opacity: 1 - out, transform: `scaleY(${0.2 + 0.8 * Math.min(1, k)})`, textAlign: 'center'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 56, color: pal().active, letterSpacing: 8, marginTop: 28, ...STROKE(8)}}>FILE 007 · RULE {n}</div>
      <div style={{fontFamily: 'Lilita One', fontSize: RULES[id].length > 30 ? 66 : 118, color: '#fff', marginTop: 12, lineHeight: 1.05, padding: '0 80px', ...STROKE(14)}}>{RULES[id]}</div>
    </div>}
    <div style={{position: 'absolute', right: 96, top: 52, textAlign: 'right'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 30, color: pal().active, letterSpacing: 5, ...STROKE(6)}}>FILE 007</div>
      <div style={{display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end'}}>{Array.from({length: 7}, (_, i) => <div key={i} style={{width: 40, height: 40, borderRadius: 8, border: '4px solid #141414', background: i + 1 === n ? pal().active : i + 1 < n ? '#8a7a30' : '#2a2f40', color: i + 1 === n ? '#141414' : '#cfd6e6', fontFamily: 'Lilita One', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>)}</div>
    </div>
  </>;
};

const Chapter = ({id}) => {
  const VO = VOS[id]; const total = frames(id); const list = SHOTS[id];
  return <ChCtx.Provider value={{VO}}>
    <AbsoluteFill style={{background: '#000'}}>
      <FontFaces /><style>{`@font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}`}</style>
      {list.map((s, i) => {
        const a = s.from ? secOf(VO, s.from) : VO.line_starts[s.a];
        const b = s.to ? secOf(VO, s.to) : s.b == null ? total / FPS : VO.line_starts[s.b];
        const from = FR(a); const to = s.b == null && !s.to ? total : FR(b); const Comp = T[s.T];
        const {T: _t, a: _a, b: _b, from: _f, to: _to, ...rest} = s;
        return <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><Comp {...rest} startSec={a} endSec={b} />{i > 0 && <Dip inFrames={4} color="#05070f" />}</Sequence>;
      })}
      <Finish vignette={0.4} grain={0.05} />
      <RuleHud id={id} />
      <Sub />
    </AbsoluteFill>
  </ChCtx.Provider>;
};
export const Lf = (id) => () => <Chapter id={id} />;
export const IDS = Object.keys(VOS);
export const Sting = () => <AbsoluteFill style={{background: '#000'}}><FontFaces /><StingShot /><Finish vignette={0.4} grain={0.05} /></AbsoluteFill>;
