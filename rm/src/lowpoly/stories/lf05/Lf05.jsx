import {pal} from '../../../palette.js'; // HUMANE caption palette 2026-11-03
// LF05 FILE 005 "If You Ever Find Bodies With No Wounds... CHECK THE AIR" - 1920x1080 @ 24 fps, one composition per chapter.
// Shot lists are data (a..b = voice line indices within the chapter, b exclusive; b null = to the end).
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {FontFaces, Finish, Dip} from '../../kit/index.js';
import {FPS, FR, ChCtx, QuoteShot, CheckShot, ArchShot, Sub, STROKE} from './shots.jsx';
import {StatShot, EndCardShot, StingShot} from './radio.jsx';
import {NotebookShot} from './sky.jsx';
import {KpuShot} from './dark.jsx';
import {MassShot, TwoEventsShot} from './mass.jsx';
import V_COLD from './vo_COLD.json'; import V_CH1 from './vo_CH1.json'; import V_CH2 from './vo_CH2.json'; import V_CH3 from './vo_CH3.json'; import V_CH4 from './vo_CH4.json';
import V_CH5 from './vo_CH5.json'; import V_CH6 from './vo_CH6.json'; import V_CH7 from './vo_CH7.json'; import V_OUTRO from './vo_OUTRO.json';

const VOS = {COLD: V_COLD, CH1: V_CH1, CH2: V_CH2, CH3: V_CH3, CH4: V_CH4, CH5: V_CH5, CH6: V_CH6, CH7: V_CH7, OUTRO: V_OUTRO};
export const GAP = 0.6; const OUTRO_TAIL = 12; // end screen stays up ~19 s in total
export const frames = (id) => FR(VOS[id].dur + GAP + (id === 'OUTRO' ? OUTRO_TAIL : 0));
export const STING_FRAMES = 48;
const c = (t, p, l, fov = 46) => ({t, pos: p, look: l, fov});
const T = {lake: (p) => <MassShot scene="lake" {...p} />, tent: (p) => <MassShot scene="tent" {...p} />, roop: (p) => <MassShot scene="roop" {...p} />, ward: (p) => <MassShot scene="ward" {...p} />, two: TwoEventsShot, kpu: KpuShot, note: NotebookShot, stat: StatShot, end: EndCardShot, quote: QuoteShot, check: CheckShot, arch: ArchShot};
const RULES = {CH1: 'CHECK THE AIR', CH2: 'READ THE BODIES, NOT THE RUMOURS', CH3: "THE FIRST ANSWER ISN'T THE LAST", CH4: 'CHECK THE DATE AND THE DNA', CH5: "SAY WHAT YOU DON'T KNOW", CH6: 'ONE IS A WARNING. FIX THE LAKE.', CH7: 'SOME MYSTERIES STAY OPEN'};

// camera presets (lake at z=-30, valley opens toward +z; tent at z=-12; Roopkund lake z=-26; ward beds z -3..-42)
const LAKE_WIDE = [c(0, [-10, 7, 26], [0, 2, -30], 56), c(1, [8, 6, 14], [0, 2, -30], 52)];
const LAKE_CRATER = [c(0, [-6, 3, 0], [0, 2, -34], 50), c(1, [4, 5, -8], [0, 3, -34], 46)];
const LAKE_HIGH = [c(0, [0, 34, 14], [0, 0, -30], 62), c(1, [0, 24, -6], [0, 0, -30], 56)];
const VALLEY = [c(0, [-4, 3, 48], [0, 1, 10], 56), c(1, [2, 2.4, 32], [0, 1, 10], 50)];
const VALLEY_LOW = [c(0, [-17, 2.4, 19], [-6, 0.4, 10], 46), c(1, [-11, 2, 15], [-8, 0.4, 10], 40)];
const FOUNT = [c(0, [-12, 5, 0], [0, 12, -30], 56), c(1, [10, 6, -6], [0, 12, -30], 54)];
const GAS_ROLL = [c(0, [-16, 10, 58], [0, 3, -8], 58), c(1, [-9, 8, 46], [0, 3, -8], 54)];
const FOUNT_SIDE = [c(0, [-24, 6, -4], [0, 10, -30], 56), c(1, [-15, 8, -16], [0, 10, -30], 54)];
const PIPE = [c(0, [-20, 6, 10], [0, 9, -22], 56), c(1, [14, 8, 4], [0, 10, -22], 54)];
const TENT_WIDE = [c(0, [-12, 4, 6], [0, 1.5, -14], 56), c(1, [-6, 3, 0], [0, 1.5, -14], 50)];
const TENT_PUSH = [c(0, [-10, 2.8, 1], [0, 1.2, -12], 50), c(1, [-6, 2.2, -5], [0, 1.0, -12], 42)];
const TENT_CUT = [c(0, [-8, 1.8, -10], [-1.6, 1.1, -12], 40), c(1, [-4.6, 1.4, -11], [-1.6, 1.1, -12], 30)];
const HIKE = [c(0, [-2, 2.6, 8], [0, 1.8, -8], 54), c(1, [4, 2.4, 7], [2, 1.8, -8], 52)];
const TRAIL = [c(0, [0, 6, 0], [0, 0, -30], 60), c(1, [2, 3, -10], [0, 0, -40], 54)];
const PINE = [c(0, [-4, 3, -14], [-14, 2.0, -28], 52), c(1, [-10, 2.6, -22], [-14, 2.0, -28], 46)];
const MIDWAY = [c(0, [-1, 3.4, -4], [-6, 0.5, -17], 52), c(1, [-2, 2.6, -9], [-6, 0.5, -17], 44)];
const RAVINE = [c(0, [0.4, 5, 4], [0, 0, -24], 54), c(1, [0.6, 3.4, -8], [0, 0, -26], 46)];
const SLAB = [c(0, [-9, 4, -2], [0, 2.5, -24], 58), c(1, [-6, 3, -3], [0, 1.6, -16], 52)];
const ROOP_WIDE = [c(0, [-14, 6, 8], [0, 1, -26], 56), c(1, [10, 5, 0], [0, 1, -26], 54)];
const ROOP_LOW = [c(0, [-6, 1.5, -8], [2, 0.3, -24], 44), c(1, [2, 1.2, -12], [2, 0.3, -24], 38)];
const ROOP_PATH = [c(0, [-4, 2.6, 8], [0, 1.8, -8], 54), c(1, [4, 2.4, 6], [2, 1.8, -8], 52)];
const ROOP_RANGER = [c(0, [-8, 2.5, 2], [0, 1.2, -14], 50), c(1, [2, 2.2, -4], [2, 0.8, -24], 46)];
const WARD_DOWN = [c(0, [0, 2.4, 6], [0, 1.6, -40], 54), c(1, [0, 2.2, -6], [0, 1.6, -40], 50)];
const WARD_STATUE = [c(0, [-3, 2.4, -8], [0, 2.0, -18], 40), c(1, [-1.2, 2.2, -13], [0, 2.0, -18], 30)];
const WARD_SIDE = [c(0, [-4, 2.6, -2], [7.5, 1.0, -14], 54), c(1, [-1, 2.2, -8], [7.5, 1.0, -18], 46)];
const BODIES_PINE = [[-11.8, -25.6, 0.4], [-12.6, -24.4, 1.6]];
const BODIES_MID = [[-9, -20, 0.2], [-6, -17, 1.0], [-4, -14.5, 0.3]];
const BODIES_RAV = [[0.7, -17, 0.3], [-0.9, -22, 1.2], [0.8, -26, 2.0], [-0.6, -30, 0.1]];
const TENT_TORN = {p: [0, 0, -12], rot: 0.2, torn: true, glow: false, snow: 0.45, skis: true, boots: true};
const TENT_OK = {p: [0, 0, -12], rot: 0.2, torn: false, glow: true, snow: 0};

export const SHOTS = {
  COLD: [
    {a: 0, b: 1, T: 'lake', dead: true, cattle: true, cam: VALLEY_LOW, fogGround: 0.3, pill: [{l: 0, text: 'NO WOUNDS · NO WITNESSES · NO SMOKE', v: 'cyan'}],
      big: [{l: 0, w: 'bodies', lines: [{text: 'BODIES WITH', color: 'white'}, {text: 'NO WOUNDS', color: 'red'}], y: 80, size: 120}, {l: 0, w: 'check', lines: [{text: 'CHECK THE AIR', color: 'yellow'}], y: 130, size: 150}]},
    {a: 1, b: 2, T: 'lake', lakeR: 12, dead: true, villageLit: 0.4, cam: LAKE_WIDE, pill: [{l: 1, text: 'LAKE MONOUN · CAMEROON · AUGUST 1984', v: 'yellow'}, {l: 1, w: 'terrorism', text: 'TERRORISM SUSPECTED', v: 'red'}],
      big: [{l: 1, w: 'thirty', lines: [{text: '37 DEAD', color: 'white'}, {text: 'NOBODY COULD EXPLAIN IT', color: 'yellow'}], y: 80, size: 120}]},
    {a: 2, b: 3, T: 'stat', number: 1746, label: 'LAKE NYOS · AUGUST 1986', sub: 'THE CAUSE WAS SOMETHING NOBODY COULD SEE', rings: true, color: pal().alt},
    {a: 3, b: 4, T: 'stat', text: '4 CASES · 7 RULES', label: 'MONOUN + NYOS · DYATLOV PASS · ROOPKUND · SLEEPY SICKNESS', sub: 'FOUR MASS DEATHS', rings: true},
    {a: 4, b: null, T: 'ward', patients: 10, cam: WARD_DOWN, big: [{l: 4, w: 'stay', lines: [{text: 'ONE MYSTERY', color: 'white'}, {text: 'IS STILL OPEN', color: 'yellow'}], y: 80, size: 110}]},
  ],
  CH1: [
    {a: 0, b: 1, T: 'lake', lakeR: 12, villageLit: 0.7, cam: LAKE_WIDE, pill: [{l: 0, text: '15 AUG 1984 · ~10:30 PM · LAKE MONOUN', v: 'yellow'}, {l: 0, w: 'between', text: '~3 AM TO DAWN', v: 'cyan'}],
      big: [{l: 0, w: 'loud', lines: [{text: 'A LOUD NOISE', color: 'white'}], y: 130, size: 120}, {l: 0, w: 'thirty', lines: [{text: '37 PEOPLE DIED', color: 'red'}, {text: 'IN THE LOW GROUND', color: 'white'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'stat', text: 'SKIN DAMAGE', label: 'SOME VICTIMS · STILL NOT FULLY EXPLAINED', rings: true, color: pal().alt},
    {a: 2, b: 3, T: 'quote', head: 'AT THE TIME', lines: ['A MYSTERY.', 'TERRORISM', 'WAS SUSPECTED.'], hi: [2], size: 86},
    {a: 3, b: 4, T: 'lake', bubbles: true, cam: LAKE_HIGH, pill: [{l: 3, text: 'LAKE NYOS · NORTH-WEST CAMEROON', v: 'yellow'}, {l: 3, w: 'under', text: 'MAGMA LEAKS CO2 INTO THE WATER', v: 'cyan'}],
      big: [{l: 3, w: 'deep', lines: [{text: 'A DEEP CRATER LAKE', color: 'white'}, {text: 'ON AN INACTIVE VOLCANO', color: 'yellow'}], y: 80, size: 100}]},
    {a: 4, b: 5, T: 'lake', gasAt: {l: 4, w: 'gas'}, gasDur: 11, redAt: {l: 4, w: 'gas'}, fountain: true, cam: GAS_ROLL, pill: [{l: 4, text: '21 AUG 1986', v: 'yellow'}, {l: 4, w: 'cha', text: 'CHA · NYOS · SUBUM', v: 'yellow'}],
      big: [{l: 4, w: 'somewhere', lines: [{text: '100,000 – 300,000 TONS', color: 'white'}, {text: 'OF CARBON DIOXIDE', color: 'red'}], y: 80, size: 100}, {l: 4, w: 'cloud', lines: [{text: '~100 KM/H', color: 'red'}], y: 130, size: 140}]},
    {a: 5, b: 6, T: 'lake', dead: true, cattle: true, gasAt: {s: 0.0}, gasDur: 8, cam: VALLEY, fogGround: 0.28, pill: [{l: 5, text: 'WITHIN 25 KM · 3,500 LIVESTOCK', v: 'yellow'}],
      big: [{l: 5, w: 'heavy', lines: [{text: 'HEAVY. SILENT.', color: 'white'}], y: 130, size: 120}, {l: 5, w: 'killed', lines: [{text: '1,746 DEAD', color: 'red'}], y: 130, size: 150}]},
    {a: 6, b: null, T: 'quote', head: 'RULE 1', lines: ['NO WOUNDS?', 'CHECK THE AIR', 'BEFORE YOU CHASE', 'THE STORY.'], hi: [1], size: 82},
  ],
  CH2: [
    {a: 0, b: 1, T: 'tent', hikers: true, cam: HIKE, pill: [{l: 0, text: 'NORTHERN URALS · FEBRUARY 1959', v: 'yellow'}, {l: 0, w: 'led', text: 'IGOR DYATLOV, 23', v: 'cyan'}],
      big: [{l: 0, w: 'nine', lines: [{text: '9 HIKERS', color: 'white'}, {text: 'SKIING TO MOUNT OTORTEN', color: 'yellow'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'stat', text: 'ONE TURNED BACK', label: 'YURI YUDIN · 28 JANUARY · JOINT PAIN', sub: 'THE ONLY SURVIVOR', rings: true},
    {a: 2, b: 3, T: 'tent', tent: TENT_TORN, trail: false, cam: TENT_PUSH, pill: [{l: 2, text: '26 FEB 1959 · KHOLAT SYAKHL', v: 'yellow'}],
      big: [{l: 2, w: 'half', lines: [{text: 'HALF TORN DOWN', color: 'white'}, {text: 'SHOES STILL INSIDE', color: 'yellow'}], y: 80, size: 110}]},
    {a: 3, b: 4, T: 'tent', tent: TENT_TORN, cutOpen: true, cam: TENT_CUT, big: [{l: 3, w: 'investigators', lines: [{text: 'CUT OPEN', color: 'red'}, {text: 'FROM THE INSIDE', color: 'white'}], y: 80, size: 130}]},
    {a: 4, b: 5, T: 'tent', tent: TENT_TORN, trail: true, wind: 0.3, cam: TRAIL, pill: [{l: 4, text: '−25 TO −30 °C · A STORM', v: 'cyan'}],
      big: [{l: 4, w: 'nine', lines: [{text: '9 SETS OF FOOTPRINTS', color: 'white'}], y: 130, size: 100}, {l: 4, w: 'in', lines: [{text: 'SOCKS · ONE SHOE · BAREFOOT', color: 'yellow'}], y: 130, size: 80}]},
    {a: 5, b: 6, T: 'quote', head: 'THE FIRST RUMOUR', lines: ['AN ATTACK BY THE MANSI,', 'REINDEER HERDERS.', 'THE GROUND SAID:', 'ONLY THE HIKERS.'], hi: [3], size: 64},
    {a: 6, b: null, T: 'quote', head: 'RULE 2', lines: ['READ THE BODIES', 'AND THE GROUND,', 'NOT THE RUMOURS.'], hi: [2], size: 86},
  ],
  CH3: [
    {a: 0, b: 1, T: 'tent', tent: TENT_TORN, pineFire: true, bodies: BODIES_PINE, cam: PINE, pill: [{l: 0, text: 'UNDER A SIBERIAN PINE · A SMALL FIRE', v: 'yellow'}],
      big: [{l: 0, w: 'branches', lines: [{text: 'BRANCHES BROKEN', color: 'white'}, {text: 'UP TO 5 M HIGH', color: 'yellow'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'tent', tent: TENT_TORN, pineFire: true, bodies: BODIES_PINE.concat(BODIES_MID), cam: MIDWAY, pill: [{l: 1, text: 'BETWEEN THE PINE AND THE TENT', v: 'yellow'}], big: [{l: 1, w: 'poses', lines: [{text: 'HEADING BACK', color: 'white'}], y: 130, size: 110}]},
    {a: 2, b: 3, T: 'tent', ravine: true, bodies: BODIES_RAV, wind: 0.05, cam: RAVINE, pill: [{l: 2, text: 'MAY · A RAVINE · UNDER 4 M OF SNOW', v: 'yellow'}, {l: 2, w: 'forensic', text: 'DR BORIS VOZROZHDENNY: LIKE A CAR CRASH', v: 'cyan'}],
      big: [{l: 2, w: 'three', lines: [{text: 'SKULL DAMAGE', color: 'white'}, {text: 'CHEST FRACTURES', color: 'white'}], y: 80, size: 100}, {l: 2, w: 'yet', lines: [{text: 'NO EXTERNAL WOUNDS', color: 'red'}], y: 130, size: 110}]},
    {a: 3, b: 4, T: 'stat', text: '6 OF 9', label: 'DIED OF HYPOTHERMIA', rings: true, color: '#7fe3ff'},
    {a: 4, b: 5, T: 'quote', head: 'MAY 1959 · SOVIET INQUEST', lines: ['"A COMPELLING', 'NATURAL FORCE."', 'THE FILES WENT TO', 'A SECRET ARCHIVE.'], hi: [1], size: 74},
    {a: 5, b: 6, T: 'tent', tent: TENT_TORN, slabAt: {l: 5, w: 'researchers'}, cam: SLAB, wind: 0.25, pill: [{l: 5, text: 'REOPENED 2019', v: 'yellow'}, {l: 5, w: 'july', text: 'JULY 2020 · PROSECUTOR ANDREY KURYAKOV: AVALANCHE', v: 'cyan'}, {l: 5, w: 'simulation', text: 'ETH ZURICH + EPFL · COMMUNICATIONS EARTH & ENVIRONMENT', v: 'cyan'}],
      big: [{l: 5, w: 'showing', lines: [{text: 'A SMALL SLAB', color: 'white'}, {text: 'OF WIND-BLOWN SNOW', color: 'yellow'}], y: 80, size: 110}]},
    {a: 6, b: 7, T: 'quote', head: 'CRITICISMS REMAIN', lines: ['NO AVALANCHE DEBRIS', 'WAS RECORDED.', 'OTHER EXPEDITIONS REPORTED', 'NO SUCH CONDITIONS.'], hi: [0], size: 66},
    {a: 7, b: null, T: 'quote', head: 'RULE 3', lines: ['THE FIRST ANSWER', 'IS NOT THE LAST ONE.'], hi: [1], size: 92},
  ],
  CH4: [
    {a: 0, b: 1, T: 'roop', bones: 30, lakeFrozen: false, cam: ROOP_WIDE, pill: [{l: 0, text: 'ROOPKUND · HIMALAYAS · ~5,000 M', v: 'yellow'}],
      big: [{l: 0, w: 'skeletons', lines: [{text: 'HUMAN SKELETONS', color: 'white'}, {text: 'AT THE EDGE OF THE ICE', color: 'yellow'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'roop', bones: 24, ranger: true, cam: ROOP_RANGER, pill: [{l: 1, text: 'FOREST RANGER HARI KISHAN MADHWAL · 1942', v: 'yellow'}, {l: 1, w: 'feared', text: 'FEARED: A HIDDEN JAPANESE FORCE', v: 'red'}],
      big: [{l: 1, w: 'bones', lines: [{text: 'THE BONES WERE', color: 'white'}, {text: 'FAR TOO OLD', color: 'yellow'}], y: 80, size: 110}]},
    {a: 2, b: 3, T: 'stat', text: '300+ PEOPLE', label: 'REMAINS FOUND AT ROOPKUND', rings: true},
    {a: 3, b: 4, T: 'roop', bones: 0, pilgrims: true, hailAt: {l: 3, w: 'storm'}, cam: ROOP_PATH, pill: [{l: 3, text: 'LEGEND: KING RAJA JASDHAVAL · HIS QUEEN · A DANCE TROUPE', v: 'yellow'}, {l: 3, w: 'goddess', text: 'PILGRIMAGE TO NANDA DEVI', v: 'cyan'}],
      big: [{l: 3, w: 'hailstones', lines: [{text: 'HUGE HAILSTONES', color: 'red'}], y: 130, size: 130}]},
    {a: 4, b: 5, T: 'quote', head: '1950s · ANTHROPOLOGICAL SURVEY OF INDIA', lines: ['HEAD INJURIES FROM', 'ROUND OBJECTS FALLING', 'OXFORD DATE: ~850 CE', 'IT FIT THE LEGEND.'], hi: [3], size: 62},
    {a: 5, b: 6, T: 'quote', head: 'THEN CAME THE DNA', lines: ['38 INDIVIDUALS', 'RADIOCARBON DATING', '+ GENOME-WIDE ANALYSIS'], hi: [0], size: 80},
    {a: 6, b: 7, T: 'two', cues: {a: {l: 6, w: 'twenty'}, b: {l: 6, w: 'fourteen'}, c: {l: 6, w: 'southeast'}, d: {l: 7, o: 0.2}}},
    {a: 7, b: 8, T: 'stat', text: '2 EVENTS', label: 'A THOUSAND YEARS APART', sub: 'NOT ONE CATASTROPHE', rings: true, color: pal().alt},
    {a: 8, b: null, T: 'quote', head: 'RULE 4', lines: ['CHECK THE DATE.', 'CHECK THE DNA.', 'BEFORE YOU TRUST', 'A PERFECT STORY.'], hi: [3], size: 80},
  ],
  CH5: [
    {a: 0, b: 1, T: 'lake', redAt: {s: 0.0}, fountain: true, gasAt: {s: 0.0}, gasDur: 12, cam: FOUNT_SIDE, pill: [{l: 0, text: 'KNOWN', v: 'green'}, {l: 0, w: 'fountain', text: 'FOAM FOUNTAIN ~100 M · WAVE ≥ 25 M ON ONE SHORE', v: 'yellow'}],
      big: [{l: 0, w: 'lake', lines: [{text: 'BLUE TO DEEP RED', color: 'red'}], y: 130, size: 130}]},
    {a: 1, b: 2, T: 'stat', text: 'WHAT TRIGGERED IT?', label: 'NOT KNOWN', rings: true, color: pal().alt},
    {a: 2, b: 3, T: 'quote', head: 'PROPOSED TRIGGERS', lines: ['A LANDSLIDE (MOST GEOLOGISTS)', 'A SMALL ERUPTION ON THE LAKE BED', 'COOL RAIN OVERTURNING THE WATER', 'EARTHQUAKE: UNLIKELY · NO TREMORS'], hi: [0], size: 50},
    {a: 3, b: 4, T: 'stat', text: 'UNPROVEN', label: 'NOBODY HAS SHOWN WHICH ONE', rings: true, color: pal().active},
    {a: 4, b: 5, T: 'roop', bones: 36, cam: ROOP_LOW, pill: [{l: 4, text: 'ROOPKUND · ~1800 CE', v: 'yellow'}],
      big: [{l: 4, w: 'why', lines: [{text: 'WHY WERE THEY', color: 'white'}, {text: 'IN THE HIMALAYAS?', color: 'yellow'}], y: 80, size: 110}, {l: 4, w: 'study', lines: [{text: 'THE STUDY DOES NOT SAY', color: 'red'}], y: 130, size: 100}]},
    {a: 5, b: null, T: 'quote', head: 'RULE 5', lines: ['SAY WHAT YOU', "DON'T KNOW", 'OUT LOUD.'], hi: [1, 2], size: 96},
  ],
  CH6: [
    {a: 0, b: 1, T: 'stat', text: '1984 → 1986', label: 'MONOUN → NYOS', sub: 'A SIMILAR THREAT WAS NOT ANTICIPATED', rings: true, color: pal().alt},
    {a: 1, b: 2, T: 'quote', head: 'THE LESSON', lines: ['THE WARNING WAS THERE.', 'IT WAS NOT READ', 'AS A WARNING.'], hi: [2], size: 80},
    {a: 2, b: 3, T: 'lake', pipe: true, cam: PIPE, pill: [{l: 2, text: 'DEGASSING TUBE · SIPHONS WATER FROM THE BOTTOM TO THE TOP', v: 'cyan'}, {l: 2, w: 'installed', text: 'FIRST PIPE 2001 · TWO MORE 2011', v: 'yellow'}],
      big: [{l: 2, w: 'degassing', lines: [{text: 'LET THE GAS OUT', color: 'white'}, {text: 'IN SAFE AMOUNTS', color: 'yellow'}], y: 80, size: 110}]},
    {a: 3, b: 4, T: 'stat', text: 'PILOT TESTS', label: 'MONOUN 1992 · NYOS 1995', rings: true, color: '#9be15d'},
    {a: 4, b: 5, T: 'quote', head: '3 LAKES KNOWN TO BE SATURATED WITH CO2', lines: ['LAKE NYOS', 'LAKE MONOUN', 'LAKE KIVU · DR CONGO / RWANDA'], hi: [2], size: 74},
    {a: 5, b: null, T: 'quote', head: 'RULE 6', lines: ['ONCE IS A WARNING.', 'THEN FIX THE LAKE.'], hi: [1], size: 96},
  ],
  CH7: [
    {a: 0, b: 1, T: 'ward', patients: 8, cam: WARD_DOWN, pill: [{l: 0, text: 'ONE MORE FILE · A SICKNESS', v: 'yellow'}], big: [{l: 0, w: 'sickness', lines: [{text: 'NOT A PLACE.', color: 'white'}, {text: 'A SICKNESS.', color: 'red'}], y: 80, size: 120}]},
    {a: 1, b: 2, T: 'ward', patients: 12, cam: WARD_SIDE, pill: [{l: 1, text: '1915 – 1926 · WORLDWIDE', v: 'yellow'}, {l: 1, w: 'described', text: 'DESCRIBED 1917: VON ECONOMO + CRUCHET', v: 'cyan'}],
      big: [{l: 1, w: 'sleepy', lines: [{text: 'ENCEPHALITIS LETHARGICA', color: 'white'}, {text: '"SLEEPY SICKNESS"', color: 'yellow'}], y: 80, size: 100}]},
    {a: 2, b: 3, T: 'stat', text: '500,000+ DEAD', label: '1,000,000+ INFECTED · 1915–1926', rings: true, color: pal().alt},
    {a: 3, b: 4, T: 'ward', patients: 14, nurse: false, cam: WARD_STATUE, big: [{l: 3, w: 'many', lines: [{text: 'STATUE-LIKE', color: 'white'}, {text: 'SPEECHLESS · MOTIONLESS', color: 'yellow'}], y: 80, size: 110}]},
    {a: 4, b: 5, T: 'quote', head: 'WHAT CAUSED IT?', lines: ['ONCE LINKED TO SPANISH FLU', 'MODERN RESEARCH ARGUES AGAINST', 'AN ENTEROVIRUS FOUND IN CASES', '2012 · OLIVER SACKS: PROBABLE', 'OR A BACTERIUM: S. PNEUMONIAE'], hi: [3], size: 50},
    {a: 5, b: 6, T: 'quote', head: '2008 REVIEW', lines: ['ALMOST 100 YEARS LATER,', 'THE CAUSE REMAINED', '"ENIGMATIC".'], hi: [2], size: 88},
    {a: 6, b: 7, T: 'kpu', rows: [{name: 'KNOWN', color: '#9be15d', what: 'A WORLDWIDE EPIDEMIC · 500,000+ DEAD', l: 6, w: 'known'}, {name: 'PROPOSED', color: pal().active, what: 'A VIRUS (ENTEROVIRUS)', l: 6, w: 'proposed'}, {name: 'UNSOLVED', color: pal().alt, what: 'WHY IT CAME · WHY IT VANISHED', l: 6, w: 'unsolved'}]},
    {a: 7, b: null, T: 'quote', head: 'RULE 7', lines: ['SOME MYSTERIES', 'STAY OPEN.', "DON'T CLOSE ONE", "BECAUSE IT'S QUIET."], hi: [1], size: 90},
  ],
  OUTRO: [
    {a: 0, b: 1, T: 'note', head: 'FILE 005 · FIELD NOTES', lines: ['CHECK THE AIR.', 'READ THE EVIDENCE.', "SAY WHAT YOU DON'T KNOW."], hi: [2], typeSecs: 4},
    {a: 1, b: null, T: 'end', subscribeAt: {l: 1, o: 1.2}, title: 'ANOTHER FILE OPENS SOON', sub: 'FILE 005 CLOSED'},
  ],
};

// ---- rule HUD: a slam-in rule card for the first 3.4 s of each chapter, then a small 7-box tracker in the top-right corner.
const RuleHud = ({id}) => {
  const n = id.startsWith('CH') ? parseInt(id.slice(2), 10) : 0; const f = useCurrentFrame(); const {fps} = useVideoConfig();
  if (!n) return null;
  const k = spring({frame: f, fps, config: {damping: 12, stiffness: 150}}); const out = Math.min(1, Math.max(0, (f - FR(3.0)) / 8));
  return <>
    {f < FR(3.4) && <div style={{position: 'absolute', left: 0, right: 0, top: 360, height: 300, background: 'rgba(4,6,12,0.88)', borderTop: `6px solid ${pal().active}`, borderBottom: `6px solid ${pal().active}`, opacity: 1 - out, transform: `scaleY(${0.2 + 0.8 * Math.min(1, k)})`, textAlign: 'center'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 56, color: pal().active, letterSpacing: 8, marginTop: 28, ...STROKE(8)}}>FILE 005 · RULE {n}</div>
      <div style={{fontFamily: 'Lilita One', fontSize: RULES[id].length > 30 ? 74 : 118, color: '#fff', marginTop: 12, lineHeight: 1.05, padding: '0 80px', ...STROKE(14)}}>{RULES[id]}</div>
    </div>}
    <div style={{position: 'absolute', right: 96, top: 52, textAlign: 'right'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 30, color: pal().active, letterSpacing: 5, ...STROKE(6)}}>FILE 005</div>
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
