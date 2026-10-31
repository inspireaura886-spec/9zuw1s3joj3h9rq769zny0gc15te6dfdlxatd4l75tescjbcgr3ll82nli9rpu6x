// LF03 FILE 003 "If You Ever See Something Fall From the Sky... WRITE IT DOWN" - 1920x1080 @ 24 fps, one composition per chapter.
// Shot lists are data (a..b = voice line indices within the chapter, b exclusive; b null = to the end).
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {FontFaces, Finish, Dip} from '../../kit/index.js';
import {FPS, FR, ChCtx, QuoteShot, CheckShot, ArchShot, Sub, STROKE} from './shots.jsx';
import {StatShot, EndCardShot, StingShot} from './radio.jsx';
import {SkyShot, RadarShot, SeismoShot, TriShot, NotebookShot} from './sky.jsx';
import V_COLD from './vo_COLD.json'; import V_CH1 from './vo_CH1.json'; import V_CH2 from './vo_CH2.json'; import V_CH3 from './vo_CH3.json'; import V_CH4 from './vo_CH4.json';
import V_CH5 from './vo_CH5.json'; import V_CH6 from './vo_CH6.json'; import V_CH7 from './vo_CH7.json'; import V_OUTRO from './vo_OUTRO.json';

const VOS = {COLD: V_COLD, CH1: V_CH1, CH2: V_CH2, CH3: V_CH3, CH4: V_CH4, CH5: V_CH5, CH6: V_CH6, CH7: V_CH7, OUTRO: V_OUTRO};
export const GAP = 0.6; const OUTRO_TAIL = 12; // end screen stays up ~19 s in total
export const frames = (id) => FR(VOS[id].dur + GAP + (id === 'OUTRO' ? OUTRO_TAIL : 0));
export const STING_FRAMES = 48;
const c = (t, p, l, fov = 46) => ({t, pos: p, look: l, fov});
const T = {sky: SkyShot, radar: RadarShot, seismo: SeismoShot, tri: TriShot, note: NotebookShot, stat: StatShot, end: EndCardShot, quote: QuoteShot, check: CheckShot, arch: ArchShot};
const RULES = {CH1: 'COUNT THE WITNESSES', CH2: 'NOTE THE EXACT TIME AND DIRECTION', CH3: 'DO NOT TRUST THE FIRST EXPLANATION', CH4: 'KEEP THE PAPERWORK', CH5: 'ASK WHO ELSE SAW IT', CH6: 'REPORT IT TO SOMEONE WITH RANK', CH7: 'ACCEPT THAT "UNEXPLAINED" IS AN ANSWER'};
const SHAG = 'shag/IMG9.jpg';

// camera presets
const HARB_WIDE = [c(0, [-10, 3.2, 6], [10, 3, -50], 54), c(1, [-2, 2.8, 4], [12, 2, -52], 48)];
const HARB_LOW = [c(0, [4, 1.6, 5], [12, 1.5, -52], 44), c(1, [8, 2.2, 3], [12, 1.2, -52], 38)];
const FOREST_UP = [c(0, [-4, 2.5, 14], [8, 22, -50], 56), c(1, [2, 3, 6], [14, 10, -40], 52)];
const FOREST_PASS = [c(0, [-8, 3, 22], [10, 30, -60], 58), c(1, [0, 3, 18], [34, 34, -60], 56)];
const FOREST_WIDE = [c(0, [-12, 3, 24], [10, 12, -40], 54), c(1, [4, 4, 16], [14, 8, -40], 50)];
const FIELD = [c(0, [-6, 3, 18], [2, 6, -34], 50), c(1, [6, 3.4, 12], [3, 5, -34], 46)];
const RENDLE = [c(0, [-5, 2.4, 8], [0, 3, -24], 52), c(1, [3, 2.6, -4], [0, 3, -24], 48)];

export const SHOTS = {
  COLD: [
    {a: 0, b: 1, T: 'sky', scene: 'forest', kind: 'orb', from: [-50, 62, -90], to: [14, 2, -40], objAt: 0, objDur: 6, smoke: true, cam: FOREST_UP,
      big: [{l: 0, w: 'something', lines: [{text: 'SOMETHING FALLS', color: 'white'}], y: 130, size: 120}, {l: 0, w: 'write', lines: [{text: 'WRITE IT DOWN', color: 'yellow'}], y: 130, size: 130}]},
    {a: 1, b: 2, T: 'stat', text: '4 NIGHTS', label: '4 CASES · 4 COUNTRIES', sub: 'CANADA · USA · AUSTRALIA · ENGLAND', rings: true, big: [{l: 1, w: 'ordinary', lines: [{text: 'ORDINARY PEOPLE', color: 'white'}, {text: 'LOOKED UP', color: 'yellow'}], y: 80, size: 100}]},
    {a: 2, b: null, T: 'arch', src: SHAG, credit: 'Shag Harbour, Nova Scotia · J5255 · CC BY-SA 4.0 (Wikimedia Commons)', w: 1100, h: 620, pill: [{l: 2, text: 'SHAG HARBOUR · NOVA SCOTIA · 1967', v: 'yellow'}], big: [{l: 2, w: 'forty', lines: [{text: 'A NASA ANSWER', color: 'white'}, {text: '40 YEARS LATE', color: 'red'}], y: 70, size: 100}]},
  ],
  CH1: [
    {a: 0, b: 1, T: 'arch', src: SHAG, credit: 'Shag Harbour, Nova Scotia · J5255 · CC BY-SA 4.0 (Wikimedia Commons)', rot: 1.2, pill: [{l: 0, text: '4 OCT 1967 · ~11:20 PM', v: 'yellow'}], big: [{l: 0, w: 'something', lines: [{text: 'SOMETHING CRASHED', color: 'white'}, {text: 'INTO THE WATER', color: 'red'}], y: 70, size: 100}]},
    {a: 1, b: 2, T: 'sky', scene: 'harbour', kind: 'orb', from: [26, 40, -95], to: [12, 0.6, -52], objAt: 0.4, objDur: 7, cam: HARB_WIDE, pill: [{l: 1, text: 'A LOW, LIT OBJECT HEADS TOWARD THE HARBOUR', v: 'yellow'}], big: [{l: 1, w: 'least', lines: [{text: 'AT LEAST 11 PEOPLE SAW IT', color: 'white'}], y: 130, size: 90}]},
    {a: 2, b: 3, T: 'sky', scene: 'harbour', kind: 'orb', arrived: true, to: [12, 0.6, -52], cam: HARB_LOW, pill: [{l: 2, text: 'LAURIE WICKENS + 4 FRIENDS · HIGHWAY 3', v: 'yellow'}], big: [{l: 2, w: 'settle', lines: [{text: '250-300 m OFFSHORE', color: 'cyan'}], y: 130, size: 100}]},
    {a: 3, b: 4, T: 'stat', text: '~15 MIN', label: 'RCMP OFFICERS ARRIVE', sub: 'EXPECTING SURVIVORS OF AN AIRCRAFT CRASH', rings: true, color: '#ff5a4e', big: [{l: 3, w: 'phoned', lines: [{text: 'THEY CALLED IT IN', color: 'white'}], y: 80, size: 100}]},
    {a: 4, b: 5, T: 'quote', head: 'WHO LOOKED INTO IT', lines: ['RESCUE COORDINATION CENTRE, HALIFAX', 'CANADIAN CIVILIAN + MILITARY AGENCIES', 'THE U.S. CONDON COMMITTEE'], hi: [2], size: 50},
    {a: 5, b: 6, T: 'quote', head: 'THE OFFICIAL STATUS', lines: ['NEVER OFFICIALLY IDENTIFIED', 'CANADIAN GOVERNMENT DOCUMENTS:', '"UNIDENTIFIED FLYING OBJECT"'], hi: [2], size: 56, stamp: 'UNIDENTIFIED', stampAt: {l: 5, w: 'never'}},
    {a: 6, b: 7, T: 'sky', scene: 'air', kind: 'rect', arrived: true, to: [0, 0, 0], cam: [c(0, [-2, 11, 16], [6, 4, -28], 56), c(1, [4, 10, 13], [10, 4, -28], 52)], pill: [{l: 6, text: 'AIR CANADA FLIGHT 305', v: 'yellow'}], big: [{l: 6, w: 'keeping', lines: [{text: 'LIT OBJECT KEEPING PACE', color: 'white'}, {text: 'WITH THE PLANE', color: 'yellow'}], y: 130, size: 90}]},
    {a: 7, b: 8, T: 'radar', brightAt: {l: 7, w: 'looked'}, pill: [{l: 7, text: 'CAPTAIN LEO MERSEY · NEAR HALIFAX', v: 'yellow'}], big: [{l: 7, w: 'four', lines: [{text: '4 BLIPS. 4 LIGHTS.', color: 'green'}], y: 80, size: 110}]},
    {a: 8, b: null, T: 'quote', head: 'RULE 1', lines: ['A SINGLE WITNESS', 'GIVES YOU A STORY.', 'MANY WITNESSES', 'GIVE YOU A CASE.'], hi: [2, 3], size: 78},
  ],
  CH2: [
    {a: 0, b: 1, T: 'stat', text: '9 DEC 1965', label: 'TWO YEARS EARLIER', sub: 'THE KECKSBURG FIREBALL', rings: true},
    {a: 1, b: 2, T: 'sky', scene: 'forest', kind: 'orb', pass: true, from: [-60, 42, -90], to: [90, 40, -70], objAt: 0.2, objDur: 6.5, cam: FOREST_PASS, pill: [{l: 1, text: 'SEEN IN 6 U.S. STATES + OVER DETROIT/WINDSOR', v: 'yellow'}], big: [{l: 1, w: 'brilliant', lines: [{text: 'A BRILLIANT FIREBALL', color: 'white'}], y: 130, size: 100}]},
    {a: 2, b: 3, T: 'stat', number: 23, label: 'PILOT REPORTS TO THE FAA', sub: 'THE FIRST AT ABOUT 4:44 PM EASTERN TIME', rings: true, pill: [{l: 2, text: 'SKY & TELESCOPE · ~4:44 PM EASTERN', v: 'yellow'}]},
    {a: 3, b: 4, T: 'seismo', hitAt: {l: 3, w: 'recorded'}, pill: [{l: 3, text: 'SHOCK WAVES AS IT PASSED THROUGH THE ATMOSPHERE', v: 'cyan'}], big: [{l: 3, w: 'recorded', lines: [{text: 'A SEISMOGRAPH', color: 'white'}, {text: 'RECORDED IT', color: 'yellow'}], y: 80, size: 100}]},
    {a: 4, b: 5, T: 'tri', stamp: '4:43 PM', pill: [{l: 4, text: 'TWO ASTRONOMERS · PHOTOS FROM TWO LOCATIONS', v: 'yellow'}], big: [{l: 4, w: 'triangulate', lines: [{text: 'TRIANGULATED ITS PATH', color: 'white'}], y: 80, size: 100}]},
    {a: 5, b: 6, T: 'quote', head: 'RULE 2', lines: ['EXACT TIME + DIRECTION', '= A PATH', 'OTHER PEOPLE CAN CHECK'], hi: [2], size: 74},
    {a: 6, b: 7, T: 'sky', scene: 'forest', kind: 'orb', from: [-40, 50, -100], to: [12, 2, -38], objAt: 0.6, objDur: 6, smoke: true, cam: FOREST_UP, pill: [{l: 6, text: 'KECKSBURG, PA · ~30 MI SE OF PITTSBURGH', v: 'yellow'}], big: [{l: 6, w: 'blue', lines: [{text: 'BLUE SMOKE · VIBRATIONS · A THUMP', color: 'cyan'}], y: 130, size: 80}]},
    {a: 7, b: null, T: 'quote', head: 'A FEELING VS A FACT', lines: ['A FEELING IS EASY TO DISMISS.', 'A TIME AND A DIRECTION', 'ARE NOT.'], hi: [1, 2], size: 62},
  ],
  CH3: [
    {a: 0, b: 1, T: 'quote', head: 'GREENSBURG TRIBUNE-REVIEW · FIRST STORIES', lines: ['WOODS SEALED OFF', 'ON THE ORDER OF ARMY AND', 'STATE POLICE OFFICIALS'], hi: [0], size: 66},
    {a: 1, b: 2, T: 'quote', head: 'A LATER EDITION', lines: ['SEARCHERS FAIL TO FIND OBJECT', 'TROOPERS + AIR FORCE FOUND', '"ABSOLUTELY NOTHING"'], hi: [0, 2], size: 54},
    {a: 2, b: 3, T: 'check', title: 'RULED OUT EARLY', rows: [{name: 'PLANE CRASH', what: 'ruled out', l: 2, w: 'plane'}, {name: 'MISSILE TEST', what: 'ruled out', l: 2, w: 'missile'}, {name: 'SATELLITE DEBRIS', what: 'ruled out', l: 2, w: 'satellite'}]},
    {a: 3, b: 4, T: 'sky', scene: 'forest', kind: 'orb', pass: true, from: [-60, 44, -90], to: [60, 36, -60], objAt: 0.2, objDur: 6, cam: FOREST_PASS, pill: [{l: 3, text: 'ASTRONOMER JOHN BALAFOUTAS · LIKELY A METEOR BOLIDE', v: 'yellow'}], big: [{l: 3, w: 'steep', lines: [{text: 'BURNING UP AT A', color: 'white'}, {text: 'STEEP ANGLE', color: 'yellow'}], y: 130, size: 100}]},
    {a: 4, b: 5, T: 'stat', text: 'KOSMOS 96', label: 'SOVIET SPACE PROBE', sub: 'ANOTHER FAVORITE ANSWER: ITS DEBRIS', rings: true, bg: 'radial-gradient(ellipse at 50% 45%, #3a1a1a 0%, #0a0606 85%)'},
    {a: 5, b: 6, T: 'quote', head: 'NOTICE', lines: ['EVERYONE HAD A', 'FAVORITE ANSWER.', 'EARLY.'], hi: [2], size: 92},
    {a: 6, b: null, T: 'quote', head: 'RULE 3', lines: ['HOLD EVERY EXPLANATION LOOSELY.', 'INCLUDING YOUR FAVORITE.'], hi: [1], size: 66},
  ],
  CH4: [
    {a: 0, b: 1, T: 'quote', head: 'NASA · 2005', lines: ['FRAGMENTS FROM THE KECKSBURG AREA', 'CAME FROM A SOVIET SATELLITE'], hi: [1], size: 58},
    {a: 1, b: 2, T: 'quote', head: 'BUT', lines: ['THE ORIGINAL RECORDS', 'WERE LOST IN 1987'], hi: [1], size: 92, stamp: 'LOST', stampAt: {l: 1, w: 'lost'}},
    {a: 2, b: 3, T: 'stat', text: 'COURT ORDERS', label: '+ FREEDOM OF INFORMATION REQUESTS', sub: 'NASA RESPONDED TO SEARCH FOR THE RECORDS', rings: true},
    {a: 3, b: 4, T: 'stat', number: 40, label: 'YEARS AFTER THE NIGHT', sub: 'THE ANSWER ARRIVED · THE PROOF BEHIND IT WAS GONE', rings: true, color: '#ff5a4e', big: [{l: 3, w: 'strange', lines: [{text: 'THE STRANGE PART', color: 'white'}], y: 80, size: 100}]},
    {a: 4, b: 5, T: 'quote', head: 'THE CASE BECAME SO FAMOUS', lines: ['IT IS OFTEN CALLED', '"PENNSYLVANIA\'S ROSWELL"'], hi: [1], size: 74},
    {a: 5, b: null, T: 'quote', head: 'RULE 4', lines: ['AN ANSWER WITHOUT', 'ITS PAPERWORK', 'IS ONLY A CLAIM.'], hi: [2], size: 92},
  ],
  CH5: [
    {a: 0, b: 1, T: 'stat', text: 'WESTALL', label: 'MELBOURNE · 6 APRIL 1966', sub: 'STUDENTS + A TEACHER REPORT A FLYING OBJECT', rings: true, bg: 'radial-gradient(ellipse at 50% 45%, #2a3a20 0%, #080c06 85%)'},
    {a: 1, b: 2, T: 'sky', scene: 'field', kind: 'disc', from: [6, 16, -46], to: [4, 3.4, -36], objAt: {l: 1, w: 'descended'}, objDur: 4, cam: FIELD, pill: [{l: 1, text: 'ROUND · DOMED TOP · WHITE, GREY OR SILVER', v: 'yellow'}], big: [{l: 1, w: 'descended', lines: [{text: 'DOWN BEHIND THE TREES', color: 'white'}], y: 130, size: 90}]},
    {a: 2, b: 3, T: 'sky', scene: 'field', kind: 'disc', arrived: true, to: [2, 8, -36], jets: 5, cam: [c(0, [-4, 3, 20], [2, 14, -34], 56), c(1, [4, 3, 16], [2, 14, -34], 52)], pill: [{l: 2, text: 'SOME ACCOUNTS: PURSUED BY 5 AIRCRAFT', v: 'yellow'}], big: [{l: 2, w: 'hovered', lines: [{text: 'OR DID IT HOVER?', color: 'red'}], y: 130, size: 100}]},
    {a: 3, b: 4, T: 'sky', scene: 'field', kind: 'disc', from: [0, 40, -90], to: [0, 40, -90], objAt: 99, objDur: 1, circles: 3, circleAt: {l: 3, w: 'burnt'}, cam: [c(0, [-6, 5, 6], [-2, 0, -22], 54), c(1, [4, 6, 8], [0, 0, -22], 50)], pill: [{l: 3, text: 'GRASS "BURNT, BOILED OR PRESSED DOWN"', v: 'yellow'}], big: [{l: 3, w: 'numbers', lines: [{text: 'ONE CIRCLE? THREE?', color: 'white'}], y: 130, size: 100}]},
    {a: 4, b: 5, T: 'stat', text: '9 APRIL', label: 'AIR FORCE + UFO ENTHUSIASTS VISIT', sub: 'THEY REPORTED NOTHING OF INTEREST', rings: true},
    {a: 5, b: 6, T: 'quote', head: 'THE BALLOON EXPLANATION', lines: ['MELBOURNE NEWSPAPER: WEATHER BALLOON', 'KEITH BASTERFIELD: A HIGH-ALTITUDE', 'TEST BALLOON FROM MILDURA, BLOWN OFF COURSE?'], hi: [2], size: 46},
    {a: 6, b: 7, T: 'quote', head: 'SKEPTIC BRIAN DUNNING WARNED', lines: ['OVER THE YEARS, DESCRIPTIONS', 'GOT DILUTED WITH DETAILS FROM', 'PEOPLE WHO MAY NOT HAVE SEEN', 'ANYTHING'], hi: [3], size: 52},
    {a: 7, b: null, T: 'note', head: 'RULE 5 · RECORD EACH ACCOUNT SEPARATELY', lines: ['WITNESS 1:', 'WITNESS 2:', 'WITNESS 3:', '(BEFORE THE STORIES BLEND)'], hi: [3], typeSecs: 3},
  ],
  CH6: [
    {a: 0, b: 1, T: 'sky', scene: 'rendlesham', kind: 'orb', from: [-30, 44, -70], to: [-6, 4, -30], objAt: 1.5, objDur: 7, cam: RENDLE, pill: [{l: 0, text: '26 DEC 1980 · ~3 AM · RAF WOODBRIDGE', v: 'yellow'}], big: [{l: 0, w: 'lights', lines: [{text: 'LIGHTS DESCENDING', color: 'white'}, {text: 'INTO THE FOREST', color: 'yellow'}], y: 130, size: 100}]},
    {a: 1, b: 2, T: 'stat', text: 'U.S. AIR FORCE', label: 'THE BASE WAS THEN USED BY THE USAF', sub: 'FIRST THOUGHT: AN AIRCRAFT HAD COME DOWN', rings: true},
    {a: 2, b: 3, T: 'sky', scene: 'rendlesham', kind: 'orb', arrived: true, to: [0, 4, -24], lights: true, cam: RENDLE, pill: [{l: 2, text: 'A MEMO: GLOWING · METALLIC · COLOURED LIGHTS', v: 'yellow'}]},
    {a: 3, b: 4, T: 'quote', head: 'IN DAYLIGHT', lines: ['3 SMALL IMPRESSIONS IN THE GROUND', 'BURN MARKS · BROKEN BRANCHES', 'POLICE: AN ANIMAL COULD HAVE DONE IT'], hi: [2], size: 48},
    {a: 4, b: 5, T: 'stat', text: 'SLIGHTLY HIGHER', label: 'RADIATION IN THE DEPRESSIONS', sub: 'STILL CLOSE TO BACKGROUND · LT COL CHARLES HALT', rings: true, bg: 'radial-gradient(ellipse at 50% 45%, #2a2a10 0%, #0a0a04 85%)'},
    {a: 5, b: 6, T: 'quote', head: 'LT COL HALT FILED IT', lines: ['A MICRO-CASSETTE RECORDING', 'A MEMO TO THE UK MINISTRY OF DEFENCE'], hi: [1], size: 60},
    {a: 6, b: 7, T: 'sky', scene: 'rendlesham', kind: 'orb', from: [60, 30, -70], to: [60, 30, -70], objAt: 99, lighthouse: true, cam: [c(0, [-8, 3, 6], [50, 10, -80], 52), c(1, [0, 3, 4], [60, 10, -80], 48)], pill: [{l: 6, text: 'SCEPTICS: FIREBALL · ORFORDNESS LIGHTHOUSE · BRIGHT STARS', v: 'cyan'}], big: [{l: 6, w: 'ministry', lines: [{text: 'MINISTRY: NO THREAT', color: 'white'}, {text: 'TO NATIONAL SECURITY', color: 'white'}], y: 130, size: 90}]},
    {a: 7, b: 8, T: 'quote', head: 'BOTH THINGS ARE TRUE', lines: ['THE LIGHTS HAVE EXPLANATIONS.', 'THE REPORT STILL EXISTS.', 'WE CAN READ WHAT WAS SAID.'], hi: [2], size: 62},
    {a: 8, b: null, T: 'quote', head: 'RULE 6', lines: ['AN OFFICIAL REPORT', 'PUTS A SIGHTING', 'ON THE RECORD.'], hi: [2], size: 92},
  ],
  CH7: [
    {a: 0, b: 1, T: 'quote', head: '4 CASES', lines: ['4 EXPLANATIONS OFFERED.', 'NONE OF THEM', 'SETTLED EVERYTHING.'], hi: [2], size: 80},
    {a: 1, b: 2, T: 'quote', head: 'RULE 7', lines: ['"I SAW THIS.', 'I DON\'T KNOW', 'WHAT IT WAS."'], hi: [2], size: 90},
    {a: 2, b: null, T: 'sky', scene: 'forest', kind: 'orb', arrived: true, to: [10, 36, -70], cam: [c(0, [0, 2, 16], [10, 14, -60], 54), c(1, [2, 22, 18], [10, 40, -60], 60)], big: [{l: 2, w: 'write', lines: [{text: 'WRITE IT DOWN', color: 'yellow'}], y: 130, size: 130}]},
  ],
  OUTRO: [
    {a: 0, b: 1, T: 'note', head: 'FILE 003 · FIELD NOTES', lines: ['TIME:', 'DIRECTION:', 'WITNESSES:', 'TELL SOMEONE.'], hi: [3], typeSecs: 3.5},
    {a: 1, b: null, T: 'end', subscribeAt: {l: 1, o: 1.2}, title: 'ANOTHER FILE OPENS SOON', sub: 'FILE 003 CLOSED'},
  ],
};

// ---- rule HUD: a slam-in rule card for the first 3.4 s of each chapter, then a small 7-box tracker in the top-right corner.
const RuleHud = ({id}) => {
  const n = id.startsWith('CH') ? parseInt(id.slice(2), 10) : 0; const f = useCurrentFrame(); const {fps} = useVideoConfig();
  if (!n) return null;
  const k = spring({frame: f, fps, config: {damping: 12, stiffness: 150}}); const out = Math.min(1, Math.max(0, (f - FR(3.0)) / 8));
  return <>
    {f < FR(3.4) && <div style={{position: 'absolute', left: 0, right: 0, top: 360, height: 300, background: 'rgba(4,6,12,0.88)', borderTop: '6px solid #ffd93b', borderBottom: '6px solid #ffd93b', opacity: 1 - out, transform: `scaleY(${0.2 + 0.8 * Math.min(1, k)})`, textAlign: 'center'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 56, color: '#ffd93b', letterSpacing: 8, marginTop: 28, ...STROKE(8)}}>FILE 003 · RULE {n}</div>
      <div style={{fontFamily: 'Lilita One', fontSize: RULES[id].length > 30 ? 74 : 118, color: '#fff', marginTop: 12, lineHeight: 1.05, padding: '0 80px', ...STROKE(14)}}>{RULES[id]}</div>
    </div>}
    <div style={{position: 'absolute', right: 96, top: 52, textAlign: 'right'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 30, color: '#ffd93b', letterSpacing: 5, ...STROKE(6)}}>FILE 003</div>
      <div style={{display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end'}}>{Array.from({length: 7}, (_, i) => <div key={i} style={{width: 40, height: 40, borderRadius: 8, border: '4px solid #141414', background: i + 1 === n ? '#ffd93b' : i + 1 < n ? '#8a7a30' : '#2a2f40', color: i + 1 === n ? '#141414' : '#cfd6e6', fontFamily: 'Lilita One', fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>)}</div>
    </div>
  </>;
};

const Chapter = ({id}) => {
  const VO = VOS[id]; const total = frames(id); const list = SHOTS[id];
  return <ChCtx.Provider value={{VO}}>
    <AbsoluteFill style={{background: '#000'}}>
      <FontFaces /><style>{`@font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}`}</style>
      {list.map((s, i) => {
        const a = VO.line_starts[s.a]; const b = s.b == null ? total / FPS : VO.line_starts[s.b];
        const from = FR(a); const to = s.b == null ? total : FR(b); const Comp = T[s.T];
        const {T: _t, a: _a, b: _b, ...rest} = s;
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
