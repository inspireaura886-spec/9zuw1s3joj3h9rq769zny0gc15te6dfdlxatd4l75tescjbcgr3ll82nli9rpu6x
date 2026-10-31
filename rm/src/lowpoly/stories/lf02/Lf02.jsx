// LF02 "Signals From Nowhere" - 1920x1080 @ 24 fps, one composition per chapter. Shot lists are data (a..b = voice line indices within the chapter, b exclusive).
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {FontFaces, Finish, Dip} from '../../kit/index.js';
import {FPS, FR, ChCtx, PropShot, QuoteShot, CheckShot, Sub} from './shots.jsx';
import {DishShot, TowerShot, MillShot, PulsarShot, WowBarsShot, PrintoutShot, BuzzShot, DigitsShot, StatShot, HumShot, TvShot, ChartShot, EndCardShot, StingShot} from './radio.jsx';
import V_COLD from './vo_COLD.json'; import V_CH1 from './vo_CH1.json'; import V_CH2 from './vo_CH2.json'; import V_CH3 from './vo_CH3.json';
import V_CH4 from './vo_CH4.json'; import V_CH5 from './vo_CH5.json'; import V_CH6 from './vo_CH6.json'; import V_OUTRO from './vo_OUTRO.json';

const VOS = {COLD: V_COLD, CH1: V_CH1, CH2: V_CH2, CH3: V_CH3, CH4: V_CH4, CH5: V_CH5, CH6: V_CH6, OUTRO: V_OUTRO};
export const GAP = 0.6;
export const frames = (id) => FR(VOS[id].dur + GAP);
export const STING_FRAMES = 48;
const c = (t, p, l, fov = 46) => ({t, pos: p, look: l, fov});
const T = {dish: DishShot, tower: TowerShot, mill: MillShot, pulsar: PulsarShot, bars: WowBarsShot, print: PrintoutShot, buzz: BuzzShot, digits: DigitsShot, stat: StatShot, hum: HumShot, tv: TvShot, chart: ChartShot, end: EndCardShot, prop: PropShot, quote: QuoteShot, check: CheckShot};
const DISH_WIDE = [c(0, [-26, 7, 40], [0, 7, -4], 48), c(1, [-10, 5, 30], [0, 8, -4], 46)];
const DISH_LOW = [c(0, [6, 2.4, 18], [0, 9, -6], 54), c(1, [-6, 3.4, 15], [0, 10, -6], 52)];

export const SHOTS = {
  COLD: [
    {a: 0, b: 1, T: 'tower', buzz: true, cam: [c(0, [-14, 5, 28], [3, 14, -2], 50), c(1, [-3, 3, 16], [3, 22, -2], 54)],
      pill: [{l: 0, text: '4625 kHz · RIGHT NOW', v: 'yellow'}], big: [{l: 0, w: 'buzzing', lines: [{text: 'IT NEVER STOPS', color: 'yellow'}], y: 130, size: 120}, {l: 0, w: 'nobody', lines: [{text: 'WHO RUNS IT?', color: 'red'}], y: 130, size: 130}]},
    {a: 1, b: 2, T: 'stat', text: '6 SIGNALS', label: 'OUT OF THE DARK', sub: 'one nearly changed history · one is a crime on live TV', rings: true,
      big: [{l: 1, w: 'six', lines: [{text: 'ONE WAS A CRIME', color: 'red'}, {text: 'ON LIVE TELEVISION', color: 'white', size: 84}], y: 80, size: 100}]},
    {a: 2, b: null, T: 'dish', dishes: [[0, 0, 0]], cam: DISH_WIDE, signal: true, signalAt: 2, moon: true, big: [{l: 2, w: 'stay', lines: [{text: 'ALMOST CALLED', color: 'white'}, {text: 'A MESSAGE FROM ALIENS', color: 'yellow'}], y: 125, size: 100}]},
  ],
  CH1: [
    {a: 0, b: 1, T: 'stat', text: '1420 MHz', label: "HYDROGEN'S OWN FREQUENCY", sub: '1959 · TWO CORNELL PHYSICISTS', rings: true, big: [{l: 0, w: 'any', lines: [{text: 'WHERE ALIENS MIGHT CALL', color: 'yellow'}], y: 125, size: 100}]},
    {a: 1, b: 3, T: 'dish', dishes: [[0, 0, 0]], cam: DISH_WIDE, moon: true, pill: [{l: 1, text: '1973 · OHIO STATE · BIG EAR', v: 'yellow'}], big: [{l: 2, lines: [{text: 'LONGEST SEARCH', color: 'white'}, {text: 'OF ITS KIND', color: 'yellow'}], y: 125}]},
    {a: 3, b: 4, T: 'dish', dishes: [[0, 0, 0], [-16, 0, -10]], cam: DISH_LOW, aim: 1.05, signal: true, signalAt: {l: 3, w: 'recorded'}, pill: [{l: 3, text: '15 AUG 1977 · 11:16 PM', v: 'red'}], big: [{l: 3, w: 'something', lines: [{text: 'BIG EAR HEARD', color: 'white'}, {text: 'SOMETHING', color: 'red'}], y: 125, size: 110}]},
    {a: 4, b: 5, T: 'print', rows: 14, pill: [{l: 4, text: 'JERRY EHMAN · VOLUNTEER', v: 'yellow'}], big: [{l: 4, w: 'row', lines: [{text: 'ONE ROW STOPPED HIM', color: 'yellow'}], y: 80, size: 100}]},
    {a: 5, b: 7, T: 'stat', number: 72, label: 'SECONDS', sub: 'THE WHOLE TIME BIG EAR COULD WATCH IT', rings: true, bg: 'radial-gradient(ellipse at 50% 45%, #2a1a50 0%, #060814 85%)',
      pill: [{l: 5, text: 'STRONG · NARROW · SAGITTARIUS', v: 'cyan'}], big: [{l: 6, w: 'lasted', lines: [{text: 'THE FULL WINDOW', color: 'white'}], y: 80, size: 100}]},
    {a: 7, b: 8, T: 'print', rows: 12, pill: [{l: 7, text: '10 s SAMPLE · 2 s PROCESSING', v: 'yellow'}], big: [{l: 7, w: 'printed', lines: [{text: 'ONE CHARACTER', color: 'white'}, {text: 'PER 10 SECONDS', color: 'yellow'}], y: 80}]},
    {a: 8, b: 10, T: 'bars', circleAt: {l: 9, w: 'climbed'}, big: [{l: 8, w: 'numbers', lines: [{text: '1 → 9 → THE LETTERS', color: 'white'}], y: 80, size: 90}, {l: 9, w: 'climbed', lines: [{text: 'ALL THE WAY TO "U"', color: 'yellow'}], y: 80, size: 110}]},
    {a: 10, b: 11, T: 'print', rows: 12, circleAt: {l: 10, w: 'circled'}, big: [{l: 10, w: 'wow', lines: [{text: '"WOW!"', color: 'red'}], y: 70, size: 150}]},
    {a: 11, b: 12, T: 'quote', head: 'THE CODE 6EQUJ5', lines: ['NOT A MESSAGE.', 'A STRENGTH SCALE,', 'IN 10-SECOND STEPS.'], hi: [1], size: 76, big: [{l: 11, lines: [{text: 'WHAT IT REALLY MEANS', color: 'yellow'}], y: 60, size: 90}]},
    {a: 12, b: 14, T: 'dish', dishes: [[0, 0, 0]], cam: [c(0, [14, 5, 26], [0, 9, -2], 50), c(1, [-14, 4, 24], [0, 9, -2], 50)], aim: 0.7, big: [{l: 12, lines: [{text: 'SEARCHED AGAIN', color: 'white'}, {text: 'AND AGAIN', color: 'white'}], y: 100}, {l: 13, w: 'never', lines: [{text: 'NEVER CAME BACK', color: 'red'}], y: 100, size: 130}]},
    {a: 14, b: 15, T: 'check', title: 'THE SUSPECTS', rows: [{name: 'COMETS', what: 'not proven', l: 14, w: 'comets'}, {name: 'SPACE DEBRIS', what: 'not proven', l: 14, w: 'space'}, {name: 'SCINTILLATION', what: 'not proven', l: 14, w: 'interstellar'}]},
    {a: 15, b: null, T: 'buzz', freq: '4625', label: 'THE NEXT ONE NEVER STOPS', big: [{l: 15, w: 'next', lines: [{text: 'THE NEXT ONE', color: 'white'}, {text: 'NEVER STOPS', color: 'red'}], y: 100, size: 120}]},
  ],
  CH2: [
    {a: 0, b: 1, T: 'tower', buzz: true, cam: [c(0, [-16, 6, 30], [3, 12, -2], 50), c(1, [-4, 3, 18], [3, 20, -2], 54)], pill: [{l: 0, text: 'UVB-76 · "THE BUZZER"', v: 'yellow'}, {l: 0, w: 'broadcasts', text: '4625 kHz SHORTWAVE', v: 'cyan'}]},
    {a: 1, b: 2, T: 'buzz', rate: 25, label: '≈ 25 BUZZES A MINUTE', big: [{l: 1, w: 'twenty', lines: [{text: '24 HOURS A DAY', color: 'yellow'}], y: 80, size: 120}]},
    {a: 2, b: 5, T: 'tower', buzz: true, cam: [c(0, [20, 4, 20], [0, 8, -2], 50), c(1, [10, 18, 24], [3, 12, -2], 50)], pill: [{l: 2, text: 'EARLIEST RECORDING · 1982', v: 'yellow'}],
      big: [{l: 3, w: 'each', lines: [{text: 'BUZZ · PAUSE · BUZZ', color: 'white'}], y: 130, size: 100}, {l: 4, w: 'soviet', lines: [{text: 'THROUGH THE COLLAPSE', color: 'yellow'}, {text: 'AND EVERY YEAR SINCE', color: 'white', size: 80}], y: 130, size: 100}]},
    {a: 5, b: 6, T: 'buzz', rate: 25, msgAt: {l: 5, w: 'live'}, msg: ['[ A LIVE VOICE · IN RUSSIAN ]'], big: [{l: 5, w: 'sometimes', lines: [{text: 'THE BUZZ STOPS', color: 'red'}], y: 100, size: 120}]},
    {a: 6, b: 7, T: 'buzz', quiet: true, label: 'FIXED MESSAGE FORMATS', freq: 'MONOLITH', unit: '', msgAt: {l: 6, w: 'full'}, msg: ['UZOR · CALLSIGNS', 'CODE WORDS · DIGITS'], big: []},
    {a: 7, b: 8, T: 'quote', head: 'THE FAMOUS NAME IS A TYPO', lines: ['1997-2010: "UZB-76"', 'UVB-76 = MISTRANSCRIPTION'], hi: [1], size: 76, stamp: 'TYPO', stampAt: {l: 7, w: 'mistranscription'}},
    {a: 8, b: 9, T: 'quote', head: 'NICKNAME: DOOMSDAY RADIO', lines: ['NOT LINKED TO DEAD HAND', 'INTERRUPTED MANY TIMES', 'NO MISSILES FOLLOWED'], hi: [2], size: 70},
    {a: 9, b: 11, T: 'tower', cam: [c(0, [-22, 5, 24], [0, 5, -2], 50), c(1, [-12, 3, 12], [-5, 2, 0], 50)], pill: [{l: 9, text: 'BEST THEORY: MILITARY NETWORK · LENINGRAD DISTRICT', v: 'yellow'}], big: [{l: 10, lines: [{text: 'TRUE PURPOSE', color: 'white'}, {text: 'NEVER REVEALED', color: 'red'}], y: 125, size: 110}]},
    {a: 11, b: null, T: 'prop', prop: 'radio', bg: 'room', pal: 'room', floor: '#3a2a1c', cam: [c(0, [-5, 4, 10], [0.4, 1.2, 0], 46), c(1, [3, 3.4, 7.6], [0.8, 1.0, 0.2], 42)], big: [{l: 11, w: 'talks', lines: [{text: 'THE NEXT STATION', color: 'white'}, {text: 'TALKED TO SPIES', color: 'yellow'}], y: 80, size: 100}]},
  ],
  CH3: [
    {a: 0, b: 1, T: 'prop', prop: 'radio', bg: 'room', pal: 'room', floor: '#3a2a1c', cam: [c(0, [3, 3.4, 7.6], [0.8, 1.0, 0.2], 42), c(1, [-5, 4, 10], [0.4, 1.2, 0], 46)], pill: [{l: 0, text: 'NUMBERS STATIONS', v: 'yellow'}], big: [{l: 0, w: 'addressed', lines: [{text: 'ADDRESSED TO SPIES', color: 'red'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'digits', head: 'SYNTHETIC VOICE · MORSE · DIGITAL', groups: ['ZERO · TWO', '- - · · -', '01011001'], big: [{l: 1, lines: [{text: 'MOSTLY ROBOT VOICES', color: 'white'}], y: 70, size: 100}]},
    {a: 2, b: 3, T: 'digits', head: 'BROADCAST SCHEDULE', groups: ['03:00', '??:??', '17:30', '??:??'], big: [{l: 2, w: 'others', lines: [{text: 'OTHERS AT RANDOM', color: 'yellow'}], y: 70, size: 100}]},
    {a: 3, b: 4, T: 'stat', text: 'THE POACHER', label: 'LINCOLNSHIRE POACHER', sub: 'BRITISH · THE MOST FAMOUS', rings: true, bg: 'radial-gradient(ellipse at 50% 45%, #2a2a1a 0%, #0a0a06 85%)'},
    {a: 4, b: 5, T: 'digits', groups: ['0 2 5 8 8', '4 1 7 0 3', '9 6 2 2 5', '1 8 3 4 0'], big: [{l: 4, w: 'woman', lines: [{text: 'GROUPS OF FIVE', color: 'yellow'}], y: 70, size: 110}]},
    {a: 5, b: 6, T: 'stat', text: 'AKROTIRI', label: 'RAF BASE · CYPRUS', sub: 'TRACED BY AMATEUR ENTHUSIASTS', rings: true, bg: 'radial-gradient(ellipse at 50% 45%, #1a3a3a 0%, #060c0c 85%)'},
    {a: 6, b: 7, T: 'quote', head: 'LAST RECORDED TRANSMISSION', lines: ['2 JULY 2008'], hi: [0], size: 110, stamp: 'SILENT', stampAt: {l: 6, w: 'july'}},
    {a: 7, b: 8, T: 'quote', head: 'OFFICIAL STATUS', lines: ['NO GOVERNMENT HAS', 'CONFIRMED THEY EXIST'], hi: [1], size: 82, stamp: 'UNCONFIRMED', stampAt: {l: 7, w: 'confirmed'}},
    {a: 8, b: null, T: 'dish', dishes: [[0, 0, 0]], cam: DISH_WIDE, aim: 1.2, stars: 1, big: [{l: 8, w: 'next', lines: [{text: 'A SIGNAL WITH', color: 'white'}, {text: 'NO SENDER AT ALL?', color: 'yellow'}], y: 125, size: 100}]},
  ],
  CH4: [
    {a: 0, b: 1, T: 'hum', pill: [{l: 0, text: 'TAOS, NEW MEXICO · EARLY 1990s', v: 'yellow'}], big: [{l: 0, w: 'low', lines: [{text: 'A HUM MOST', color: 'white'}, {text: 'COULD NOT HEAR', color: 'yellow'}], y: 125, size: 110}]},
    {a: 1, b: 2, T: 'stat', number: 2, suffix: '%', label: 'COULD HEAR IT', sub: '32-80 Hz · A DIFFERENT PITCH EACH', rings: true},
    {a: 2, b: 3, T: 'quote', head: 'WHO HEARS THE HUM?', lines: ['MIDDLE-AGED: MORE LIKELY', 'MEN + WOMEN: ABOUT EQUAL'], hi: [0], size: 70},
    {a: 3, b: 4, T: 'stat', text: '4 COUNTRIES', label: 'SAME REPORTS', sub: 'AUSTRALIA · CANADA · BRITAIN · USA', rings: true},
    {a: 4, b: 5, T: 'stat', number: 22000, label: 'REPORTS IN ONE EVENING', sub: 'WINDSOR, ONTARIO · 2012', rings: true, color: '#ff5a4e'},
    {a: 5, b: 7, T: 'mill', cam: [c(0, [-30, 10, 34], [0, 10, -10], 50), c(1, [-6, 8, 22], [2, 12, -10], 50)], offAt: {l: 6, w: 'shut'}, pill: [{l: 5, text: 'ZUG ISLAND · DETROIT RIVER', v: 'yellow'}], big: [{l: 6, w: 'when', lines: [{text: 'APRIL 2020: FURNACES OFF', color: 'white'}], y: 125, size: 84}, {l: 6, w: 'noise', lines: [{text: 'THE NOISE WENT TOO', color: 'yellow'}], y: 125, size: 100}]},
    {a: 7, b: 8, T: 'quote', head: 'RESEARCHERS SAY', lines: ['THE HUM IS NOT', 'A SINGLE PHENOMENON'], hi: [1], size: 86},
    {a: 8, b: 9, T: 'quote', head: 'POSSIBLE CAUSES', lines: ['INDUSTRIAL MACHINES', 'TINNITUS · THE EAR ITSELF', 'TAOS: NEVER PINNED DOWN'], hi: [2], size: 68},
    {a: 9, b: 10, T: 'hum', big: [{l: 9, w: 'for', lines: [{text: 'A SOUND ONLY YOU HEAR', color: 'red'}], y: 125, size: 100}]},
    {a: 10, b: null, T: 'tv', states: [{l: 10, t: 'static'}], big: [{l: 10, w: 'next', lines: [{text: 'THE NEXT SIGNAL', color: 'white'}, {text: 'HAD A FACE', color: 'yellow'}], y: 80, size: 110}]},
  ],
  CH5: [
    {a: 0, b: 1, T: 'tv', states: [{l: 0, t: 'static'}], pill: [{l: 0, text: '22 NOV 1987 · CHICAGO', v: 'yellow'}], big: [{l: 0, w: 'two', lines: [{text: '2 STATIONS', color: 'white'}, {text: '2 HOURS APART', color: 'red'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'tv', states: [{l: 1, t: 'static'}, {l: 1, w: 'screen', t: 'black'}], pill: [{l: 1, text: '9:14 PM · WGN · SPORTS SEGMENT', v: 'yellow'}], big: [{l: 1, w: 'screen', lines: [{text: 'THE SCREEN WENT BLACK', color: 'white'}], y: 80, size: 100}]},
    {a: 2, b: 3, T: 'tv', states: [{l: 2, t: 'black'}, {l: 2, w: 'person', t: 'mask'}], big: [{l: 2, w: 'then', lines: [{text: 'A MASKED FIGURE', color: 'white'}, {text: 'ONLY A LOUD BUZZ', color: 'red'}], y: 80, size: 100}]},
    {a: 3, b: 4, T: 'stat', text: '< 1 MIN', label: 'THEN ENGINEERS CUT IT', sub: 'THEY CHANGED THE LINK FREQUENCY', rings: true, color: '#ff5a4e'},
    {a: 4, b: 5, T: 'tv', states: [{l: 4, t: 'static'}, {l: 4, w: 'doctor', t: 'mask'}], pill: [{l: 4, text: '~11:20 PM · WTTW · DOCTOR WHO', v: 'yellow'}], big: [{l: 4, w: 'around', lines: [{text: 'IT HAPPENED AGAIN', color: 'red'}], y: 80, size: 110}]},
    {a: 5, b: 7, T: 'tv', states: [{l: 5, t: 'mask'}, {l: 6, w: 'soda', t: 'soda'}], pill: [{l: 5, text: 'THIS TIME: AUDIO · ~90 SECONDS', v: 'red'}], big: [{l: 6, w: 'rambled', lines: [{text: 'RAMBLING · A SODA CAN', color: 'white'}], y: 80, size: 90}]},
    {a: 7, b: 9, T: 'quote', head: 'FCC INVESTIGATION', lines: ['PERPETRATORS:', 'NEVER IDENTIFIED'], hi: [1], size: 100, stamp: 'UNSOLVED', stampAt: {l: 8, w: 'never'}},
    {a: 9, b: 10, T: 'tv', states: [{l: 9, t: 'mask'}, {l: 9, w: 'airwaves', t: 'static'}], big: [{l: 9, lines: [{text: 'A STRANGER TOOK', color: 'white'}, {text: 'OVER A CITY', color: 'red'}], y: 80, size: 110}]},
    {a: 10, b: null, T: 'chart', period: 1.337, label: 'CAMBRIDGE · 1967 · PEN CHART', big: [{l: 10, w: 'strangest', lines: [{text: 'THE STRANGEST SIGNAL', color: 'white'}, {text: 'OF ALL', color: 'yellow'}], y: 80, size: 110}]},
  ],
  CH6: [
    {a: 0, b: 1, T: 'chart', period: 1.337, pill: [{l: 0, text: '1967 · CAMBRIDGE · JOCELYN BELL', v: 'yellow'}], big: [{l: 0, w: 'miles', lines: [{text: 'MILES OF PAPER CHART', color: 'white'}], y: 70, size: 100}]},
    {a: 1, b: 2, T: 'chart', period: 1.337, big: [{l: 1, w: 'almost', lines: [{text: 'A PULSE EVERY 1.337 s', color: 'yellow'}], y: 70, size: 100}]},
    {a: 2, b: 4, T: 'stat', text: '28 NOV 1967', label: 'SHE PINNED IT DOWN', sub: "NATURE WASN'T SUPPOSED TO KEEP TIME THAT WELL", rings: true, bg: 'radial-gradient(ellipse at 50% 45%, #1a3a50 0%, #060814 85%)'},
    {a: 4, b: 5, T: 'chart', period: 1.337, stampAt: {l: 4, w: 'little'}, stamp: 'LGM-1', big: [{l: 4, w: 'jokingly', lines: [{text: 'LITTLE GREEN MEN', color: 'green'}], y: 70, size: 120}]},
    {a: 5, b: 7, T: 'quote', head: 'JOCELYN BELL BURNELL · LATER RECALLED', lines: ['"HOW DOES ONE ANNOUNCE', 'THE RESULTS RESPONSIBLY?', 'WHO DOES ONE TELL FIRST?"'], hi: [2], size: 64},
    {a: 7, b: 8, T: 'dish', dishes: [[0, 0, 0]], cam: DISH_WIDE, aim: 0.5, yaw: 0.9, signal: true, signalAt: {l: 7, w: 'similar'}, big: [{l: 7, w: 'then', lines: [{text: 'ANOTHER PART OF THE SKY', color: 'white'}, {text: 'SAME SIGNAL', color: 'yellow'}], y: 125, size: 90}]},
    {a: 8, b: 9, T: 'pulsar', cam: [c(0, [0, 6, 40], [0, 0, 0], 50), c(1, [10, 4, 26], [0, 0, 0], 50)], pill: [{l: 8, text: 'THE FIRST PULSAR EVER RECOGNIZED', v: 'cyan'}], big: [{l: 8, w: 'rapidly', lines: [{text: 'A SPINNING', color: 'white'}, {text: 'NEUTRON STAR', color: 'cyan'}], y: 125, size: 110}]},
    {a: 9, b: null, T: 'stat', text: '$3 MILLION', label: 'BREAKTHROUGH PRIZE · 2018', sub: '1974 NOBEL: HEWISH, NOT BELL', color: '#ffd93b', bg: 'radial-gradient(ellipse at 50% 45%, #2a1a50 0%, #060814 85%)', rings: true, big: [{l: 9, w: 'hewish', lines: [{text: 'BELL GOT NO NOBEL', color: 'red'}], y: 100, size: 100}]},
  ],
  OUTRO: [
    {a: 0, b: 1, T: 'pulsar', cam: [c(0, [10, 4, 30], [0, 0, 0], 50), c(1, [-8, 6, 40], [0, 0, 0], 50)], big: [{l: 0, w: 'so', lines: [{text: 'IT WAS A', color: 'white'}, {text: 'SPINNING STAR', color: 'cyan'}], y: 125, size: 110}]},
    {a: 1, b: 2, T: 'dish', dishes: [[0, 0, 0]], cam: DISH_WIDE, stars: 1, big: [{l: 1, w: 'wow', lines: [{text: 'WOW! NEVER REPEATED', color: 'yellow'}], y: 100, size: 90}, {l: 1, w: 'buzzer', lines: [{text: 'THE BUZZER STILL BUZZES', color: 'white'}], y: 100, size: 90}, {l: 1, w: 'nobody', lines: [{text: 'THE MAN IN THE MASK: UNNAMED', color: 'red'}], y: 100, size: 80}]},
    {a: 2, b: null, T: 'end', subscribeAt: {l: 2, w: 'subscribe'}, title: 'VANISHED WITHOUT A TRACE', sub: 'WATCH NEXT'},
  ],
};

const Chapter = ({id}) => {
  const VO = VOS[id]; const total = frames(id); const list = SHOTS[id];
  return <ChCtx.Provider value={{VO}}>
    <AbsoluteFill style={{background: '#000'}}>
      <FontFaces /><style>{`@font-face{font-family:'Special Elite';src:url('${staticFile('fonts/SpecialElite-Regular.ttf')}') format('truetype');}`}</style>
      {list.map((s, i) => {
        const a = VO.line_starts[s.a]; const b = s.b == null ? VO.dur + GAP : VO.line_starts[s.b];
        const from = FR(a); const to = s.b == null ? total : FR(b); const Comp = T[s.T];
        return <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}><Comp {...s} startSec={a} endSec={s.b == null ? VO.dur + GAP : b} />{i > 0 && <Dip inFrames={4} color="#05070f" />}</Sequence>;
      })}
      <Finish vignette={0.4} grain={0.05} />
      <Sub />
    </AbsoluteFill>
  </ChCtx.Provider>;
};
export const Lf = (id) => () => <Chapter id={id} />;
export const IDS = Object.keys(VOS);
export const Sting = () => <AbsoluteFill style={{background: '#000'}}><FontFaces /><StingShot /><Finish vignette={0.4} grain={0.05} /></AbsoluteFill>;
