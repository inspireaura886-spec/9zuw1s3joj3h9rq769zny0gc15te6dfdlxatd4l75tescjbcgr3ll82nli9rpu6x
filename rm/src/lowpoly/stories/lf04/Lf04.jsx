// LF04 FILE 004 "If You Ever See a Monster in the Dark... LOOK UP" - 1920x1080 @ 24 fps, one composition per chapter.
// Shot lists are data (a..b = voice line indices within the chapter, b exclusive; b null = to the end).
import {AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {FontFaces, Finish, Dip} from '../../kit/index.js';
import {FPS, FR, ChCtx, QuoteShot, CheckShot, ArchShot, Sub, STROKE} from './shots.jsx';
import {StatShot, EndCardShot, StingShot} from './radio.jsx';
import {SkyShot, NotebookShot} from './sky.jsx';
import {DarkShot, SizeShot, DoverMapShot, KpuShot} from './dark.jsx';
import V_COLD from './vo_COLD.json'; import V_CH1 from './vo_CH1.json'; import V_CH2 from './vo_CH2.json'; import V_CH3 from './vo_CH3.json'; import V_CH4 from './vo_CH4.json';
import V_CH5 from './vo_CH5.json'; import V_CH6 from './vo_CH6.json'; import V_CH7 from './vo_CH7.json'; import V_OUTRO from './vo_OUTRO.json';

const VOS = {COLD: V_COLD, CH1: V_CH1, CH2: V_CH2, CH3: V_CH3, CH4: V_CH4, CH5: V_CH5, CH6: V_CH6, CH7: V_CH7, OUTRO: V_OUTRO};
export const GAP = 0.6; const OUTRO_TAIL = 12; // end screen stays up ~19 s in total
export const frames = (id) => FR(VOS[id].dur + GAP + (id === 'OUTRO' ? OUTRO_TAIL : 0));
export const STING_FRAMES = 48;
const c = (t, p, l, fov = 46) => ({t, pos: p, look: l, fov});
const T = {sky: SkyShot, dark: DarkShot, size: SizeShot, dmap: DoverMapShot, kpu: KpuShot, note: NotebookShot, stat: StatShot, end: EndCardShot, quote: QuoteShot, check: CheckShot, arch: ArchShot};
const RULES = {CH1: 'WRITE IT DOWN FIRST', CH2: 'COUNT THE LIGHTS YOU CAN NAME', CH3: 'MEASURE IT AGAINST WHAT LIVES THERE', CH4: "DON'T LET THE NAME DECIDE", CH5: 'EXPECT THE LEGEND TO GROW', CH6: 'MARK THE MAP', CH7: 'KEEP "UNEXPLAINED" HONEST'};

// camera presets
const FOREST_UP = [c(0, [-4, 2.5, 14], [8, 22, -50], 56), c(1, [2, 3, 6], [14, 10, -40], 52)];
const FOREST_PASS = [c(0, [-8, 3, 22], [10, 30, -60], 58), c(1, [0, 3, 18], [34, 34, -60], 56)];
const FARM_PUSH = [c(0, [-7, 2.2, 12], [0, 3, -28], 56), c(1, [-1.5, 2.4, -1], [0, 3.2, -28], 46)];
const FARM_ORBIT = [c(0, [-15, 3, 2], [0, 2.5, -28], 54), c(1, [13, 3.4, 2], [0, 2.5, -28], 54)];
const FARM_LOW = [c(0, [3, 1.5, 6], [-2, 2.6, -26], 46), c(1, [-3, 1.7, 0], [0, 3.4, -28], 42)];
const FARM_WIDE = [c(0, [-4, 5, 16], [0, 2.6, -28], 58), c(1, [4, 4.4, 10], [0, 2.8, -28], 52)];
const HILL_CLIMB = [c(0, [-10, 2, 8], [8, 3, -40], 56), c(1, [-4, 2.2, -2], [8, 3.4, -40], 50)];
const HILL_FIG = [c(0, [-2, 2.0, -14], [7, 5.8, -40], 40), c(1, [3, 2.4, -22], [7, 5.6, -40], 32)];
const HILL_RUN = [c(0, [2, 2.6, -22], [7, 4.2, -40], 34), c(1, [-10, 3, 6], [6, 4, -40], 58)];
const HILL_WIDE = [c(0, [-14, 3, 10], [14, 14, -88], 56), c(1, [-4, 3, 6], [14, 14, -88], 50)];
const ROAD_SIDE = [c(0, [-11, 2.4, 6], [0, 2.2, -32], 56), c(1, [-7, 2.2, -6], [2, 3, -36], 50)];
const ROAD_FAR = [c(0, [-6, 2.4, 10], [6, 3, -44], 46), c(1, [-3, 2.2, 2], [7, 3.2, -44], 38)];
const ROAD_FLY = [c(0, [-4, 2.4, 4], [8, 4, -30], 52), c(1, [6, 3.4, -4], [0, 4, -34], 54)];
const BRIDGE_CAM = [c(0, [-4, 6, 14], [0, 9, -40], 62), c(1, [6, 9, 9], [0, 8, -40], 56)];
const WALL_CAM = [c(0, [-5, 2.0, 5], [0, 2.4, -8], 44), c(1, [1.2, 2.0, 0], [0, 2.7, -8], 34)];
const WALL_ORBIT = [c(0, [-6, 2, 2], [0, 2.2, -8], 46), c(1, [6, 2.2, 1], [0, 2.2, -8], 46)];
const OWL_CAM = [c(0, [0, 3.6, 3], [0, 4.0, -10], 44), c(1, [0, 4.0, -3], [0, 4.2, -10], 32)];
const GOB_YARD = [[-6, 0, -18, 1.3, 0.4], [5, 0, -16, 1.3, -0.4], [-1.5, 0, -21, 1.2, 0.1], [9, 0, -25, 1.2, -0.6]];
const GOB_ROOF = [[1.2, 4.9, -28, 1.3, 0]];
const GOB_MANY = [[-8, 0, -17, 1.3, 0.4], [-4.5, 0, -16, 1.2, 0.2], [-1, 0, -17, 1.3, 0], [2.5, 0, -16, 1.2, -0.2], [6, 0, -17, 1.3, -0.4], [9.5, 0, -19, 1.2, -0.5], [-10, 0, -23, 1.1, 0.5], [12, 0, -24, 1.2, -0.6], [-2.5, 0, -22, 1.1, 0.1], [4, 0, -23, 1.1, -0.1], [0.5, 4.9, -28, 1.3, 0], [-12, 0, -18, 1.2, 0.6]];
const EYES_NIGHT = [[0.6, 5.5, -27, '#ffd93b', 0.7, 0.2, 1.6], [-9, 1.1, -15, '#ffd93b', 0.5, 0.14, 1.3], [8, 1.0, -13, '#ffd93b', 0.5, 0.14, 1.3], [-3, 0.9, -19, '#ffd93b', 0.4, 0.12, 1.1]];

export const SHOTS = {
  COLD: [
    {a: 0, b: 1, T: 'dark', scene: 'farm', eyes: EYES_NIGHT, cam: FARM_PUSH,
      big: [{l: 0, w: 'monster', lines: [{text: 'A MONSTER IN THE DARK', color: 'white'}], y: 130, size: 100}, {l: 0, w: 'look', lines: [{text: 'LOOK UP', color: 'yellow'}], y: 130, size: 150}]},
    {a: 1, b: 2, T: 'dark', scene: 'farm', gob: GOB_YARD.concat(GOB_ROOF), shoot: true, cam: FARM_ORBIT, pill: [{l: 1, text: 'HOPKINSVILLE, KENTUCKY · AUGUST 1955', v: 'yellow'}],
      big: [{l: 1, w: 'twelve', lines: [{text: '12 PEOPLE', color: 'white'}, {text: '5 ADULTS · 7 CHILDREN', color: 'yellow'}], y: 80, size: 100}, {l: 1, w: 'nearly', lines: [{text: 'NEARLY 4 HOURS', color: 'white'}, {text: 'OF GUNFIRE', color: 'red'}], y: 80, size: 110}]},
    {a: 2, b: 3, T: 'stat', text: '4 CASES', label: '4 AMERICAN MONSTERS', sub: 'FLATWOODS · KELLY-HOPKINSVILLE · POINT PLEASANT · DOVER', rings: true, big: [{l: 2, w: 'explanation', lines: [{text: 'ONE EXPLANATION', color: 'white'}, {text: 'KEEPS SHOWING UP', color: 'yellow'}], y: 80, size: 100}]},
    {a: 3, b: null, T: 'dark', scene: 'owl', owls: [[0, 1.8, -10, 1.5, 0]], cam: OWL_CAM, big: [{l: 3, w: 'stay', lines: [{text: 'STAY TO THE END', color: 'yellow'}], y: 130, size: 110}]},
  ],
  CH1: [
    {a: 0, b: 1, T: 'sky', scene: 'forest', kind: 'orb', from: [-50, 50, -90], to: [14, 3, -42], objAt: {l: 0, w: 'brothers'}, objDur: 8, cam: FOREST_UP, pill: [{l: 0, text: '12 SEP 1952 · ~7:15 PM · FLATWOODS, WEST VIRGINIA', v: 'yellow'}],
      big: [{l: 0, w: 'brothers', lines: [{text: 'THREE BOYS', color: 'white'}, {text: 'SAW IT FALL', color: 'yellow'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'dark', scene: 'hill', party: true, cam: HILL_CLIMB, pill: [{l: 1, text: 'KATHLEEN MAY · NEIL NUNLEY · RONNIE SHAVER · EUGENE LEMON', v: 'yellow'}], big: [{l: 1, w: 'climbed', lines: [{text: 'UP THE HILL', color: 'white'}, {text: 'IN THE DARK', color: 'yellow'}], y: 80, size: 110}]},
    {a: 2, b: 3, T: 'dark', scene: 'hill', fig: true, figAt: {l: 2, w: 'tall'}, flashDrop: {l: 3, w: 'screamed'}, party: false, cam: HILL_FIG, pill: [{l: 2, text: 'WITNESS ACCOUNT · NOT VERIFIED', v: 'cyan'}],
      big: [{l: 2, w: 'red', lines: [{text: 'A RED, PULSATING LIGHT', color: 'red'}], y: 130, size: 90}, {l: 2, w: 'tall', lines: [{text: 'A TALL FIGURE', color: 'white'}, {text: 'ROUND RED FACE · HOOD-LIKE SHAPE', color: 'yellow'}], y: 80, size: 90}]},
    {a: 3, b: 4, T: 'dark', scene: 'hill', fig: true, flashDrop: {l: 3, w: 'dropped'}, cam: HILL_RUN, big: [{l: 3, w: 'whole', lines: [{text: 'THE WHOLE GROUP RAN', color: 'white'}], y: 130, size: 100}]},
    {a: 4, b: 5, T: 'quote', head: 'GRAY BARKER · FATE MAGAZINE · JANUARY 1953', lines: ['A TEN-FOOT FIGURE', 'A BLOOD-RED FACE', 'A HEAD LIKE THE ACE OF SPADES'], hi: [2], size: 60},
    {a: 5, b: 6, T: 'stat', text: 'NO CAUSE FOUND', label: 'A PUNGENT MIST · NAUSEA · SWOLLEN THROATS', sub: 'REPORTED BY SOME OF THE BOYS · A DOCTOR EXAMINED THEM', rings: true, color: '#ff5a4e'},
    {a: 6, b: 7, T: 'quote', head: 'HERE IS THE PROBLEM', lines: ['EVERY RETELLING', 'ADDED SOMETHING.', 'THE ARMS, THE HEIGHT,', 'THE SHAPE CHANGED.'], hi: [1, 3], size: 66},
    {a: 7, b: null, T: 'note', head: 'RULE 1 · WRITE IT DOWN FIRST', lines: ['WHAT I SAW:', '(MY OWN WORDS)', 'BEFORE ANYONE ASKS'], hi: [2], typeSecs: 3},
  ],
  CH2: [
    {a: 0, b: 1, T: 'sky', scene: 'forest', kind: 'orb', pass: true, from: [-60, 42, -90], to: [90, 40, -70], objAt: 0.2, objDur: 5.5, cam: FOREST_PASS, pill: [{l: 0, text: 'FLATWOODS · THAT SAME NIGHT', v: 'yellow'}]},
    {a: 1, b: 2, T: 'sky', scene: 'forest', kind: 'orb', pass: true, from: [-60, 44, -90], to: [90, 38, -70], objAt: 0.3, objDur: 7, cam: FOREST_PASS, pill: [{l: 1, text: 'JOE NICKELL · SKEPTICAL INQUIRER · 2000', v: 'cyan'}, {l: 1, w: 'maryland', text: 'SEEN ACROSS MARYLAND · PENNSYLVANIA · WEST VIRGINIA', v: 'yellow'}],
      big: [{l: 1, w: 'meteor', lines: [{text: 'MOST LIKELY A METEOR', color: 'white'}], y: 130, size: 100}]},
    {a: 2, b: 3, T: 'dark', scene: 'hill', beacons: 3, cam: HILL_WIDE, pill: [{l: 2, text: 'NICKELL: THREE FLASHING RED AIRCRAFT BEACONS?', v: 'cyan'}], big: [{l: 2, w: 'three', lines: [{text: 'RED PULSING LIGHT?', color: 'red'}], y: 130, size: 100}]},
    {a: 3, b: 4, T: 'quote', head: 'A PROPOSAL, NOT A PROOF', lines: ['ONE STRANGE NIGHT', 'BECOMES TWO ORDINARY LIGHTS.', 'EACH CAN BE CHECKED.'], hi: [2], size: 64},
    {a: 4, b: 5, T: 'dark', scene: 'owl', owls: [[0, 1.8, -10, 1.5, 0]], cam: OWL_CAM, pill: [{l: 4, text: 'NICKELL: A STARTLED BARN OWL ON A BRANCH', v: 'cyan'}], big: [{l: 4, w: 'foliage', lines: [{text: 'LEAVES LIKE A', color: 'white'}, {text: 'PLEATED SKIRT?', color: 'yellow'}], y: 130, size: 100}]},
    {a: 5, b: 6, T: 'quote', head: 'THE NEXT DAY · A. LEE STEWART JR.', lines: ['SKID MARKS + AN ODD,', 'GUMMY DEPOSIT.', 'A LOCAL BOY, MAX LOCKARD,', 'LATER ADMITTED HE DROVE', 'HIS TRUCK AROUND THE SITE.'], hi: [4], size: 50},
    {a: 6, b: null, T: 'quote', head: 'RULE 2', lines: ['COUNT THE LIGHTS', 'YOU CAN NAME', 'BEFORE THE ONES', "YOU CAN'T."], hi: [3], size: 82},
  ],
  CH3: [
    {a: 0, b: 1, T: 'dark', scene: 'farm', gob: GOB_YARD, eyes: [[0.6, 5.6, -27, '#ffd93b', 0.7, 0.2, 1.6]], cam: FARM_WIDE, pill: [{l: 0, text: 'KELLY, KENTUCKY (NEAR HOPKINSVILLE) · 1955', v: 'yellow'}],
      big: [{l: 0, w: 'two', lines: [{text: '2-4 FT TALL', color: 'white'}, {text: 'GLOWING EYES', color: 'yellow'}], y: 80, size: 110}]},
    {a: 1, b: 2, T: 'stat', number: 16, label: 'OFFICERS + MILITARY POLICE', sub: '4 CITY · 5 STATE · 3 DEPUTIES · 4 FORT CAMPBELL MPs', rings: true},
    {a: 2, b: 3, T: 'dark', scene: 'farm', cops: true, cam: FARM_LOW, pill: [{l: 2, text: 'BROKEN WINDOWS · HOLES IN THE SCREENS', v: 'yellow'}], big: [{l: 2, w: 'creatures', lines: [{text: 'NO CREATURES FOUND', color: 'red'}], y: 130, size: 100}]},
    {a: 3, b: 4, T: 'dark', scene: 'farm', gob: GOB_ROOF.concat([[-6, 0, -18, 1.3, 0.4]]), eyes: [[-9, 1.1, -15, '#ffd93b', 0.5, 0.14, 1.3]], shoot: true, cam: FARM_ORBIT, pill: [{l: 3, text: '~3:30 AM · THEY CAME BACK', v: 'yellow'}], big: [{l: 3, w: 'left', lines: [{text: 'THEN THEY LEFT', color: 'white'}], y: 130, size: 100}]},
    {a: 4, b: 5, T: 'size', owlAt: {l: 4, w: 'great'}, pill: [{l: 4, text: 'SKEPTIC BRIAN DUNNING', v: 'cyan'}], big: [{l: 4, w: 'two', lines: [{text: 'MEASURE IT', color: 'yellow'}], y: 80, size: 110}]},
    {a: 5, b: 6, T: 'dark', scene: 'owl', owls: [[0, 1.8, -10, 1.5, 0, '#7a5a3c', '#c9b48e']], cam: OWL_CAM, pill: [{l: 5, text: 'NOCTURNAL · SILENT FLIGHT · YELLOW EYES', v: 'cyan'}], big: [{l: 5, w: 'matches', lines: [{text: 'A BETTER MATCH', color: 'white'}, {text: 'THAN YOU MIGHT EXPECT', color: 'yellow'}], y: 130, size: 80}]},
    {a: 6, b: 7, T: 'quote', head: 'DUNNING · THE GLOWING PATCH', lines: ['CONSISTENT WITH FOXFIRE,', 'A GLOWING FUNGUS.'], hi: [1], size: 70},
    {a: 7, b: null, T: 'quote', head: 'RULE 3', lines: ['MEASURE IT AGAINST', 'WHAT LIVES THERE.', 'HEIGHT · WINGSPAN · EYES'], hi: [1], size: 82},
  ],
  CH4: [
    {a: 0, b: 1, T: 'dark', scene: 'road', carFrom: [3, 0, -14], carTo: [3, 0, -14], carDur: 1, headlights: true, moth: {x: 9, y: 3, z: -42, s: 1.5, rot: -0.5}, cam: ROAD_FAR, pill: [{l: 0, text: '15 NOV 1966 · POINT PLEASANT, WEST VIRGINIA', v: 'yellow'}],
      big: [{l: 0, w: 'glowing', lines: [{text: 'GLOWING RED EYES', color: 'red'}], y: 130, size: 110}]},
    {a: 1, b: 2, T: 'dark', scene: 'road', carFrom: [3, 0, -70], carTo: [3, 0, -6], carDur: 8, headlights: true, moth: {x: 8, y: 3, follow: true, s: 1.5, rot: -0.7}, cam: ROAD_SIDE, pill: [{l: 1, text: 'THE "TNT AREA" · A WORLD WAR II MUNITIONS PLANT', v: 'yellow'}],
      big: [{l: 1, w: 'hundred', lines: [{text: '100 MPH', color: 'red'}, {text: 'AND IT KEPT PACE', color: 'white'}], y: 80, size: 120}]},
    {a: 2, b: 3, T: 'quote', head: 'POINT PLEASANT REGISTER · 16 NOV 1966', lines: ['THE NEXT MORNING,', 'IT WAS IN PRINT.'], hi: [1], size: 84},
    {a: 3, b: 4, T: 'quote', head: 'WHERE THE NAME CAME FROM (MOST LIKELY)', lines: ['THE BATMAN TV SHOW', 'A VILLAIN: THE KILLER MOTH', 'LOCAL PAPERS RAN WITH "MOTHMAN"'], hi: [2], size: 56},
    {a: 4, b: 5, T: 'quote', head: 'NOTICE', lines: ['NOBODY WHO WAS THERE', 'CALLED IT THAT FIRST.'], hi: [1], size: 86},
    {a: 5, b: 6, T: 'dark', scene: 'farm', eyes: [[-6, 1.0, -14, '#ff3a2a', 0.5, 0.14, 1.5], [8, 5.6, -27, '#ff3a2a', 0.5, 0.14, 1.5]], cam: FARM_PUSH, pill: [{l: 5, text: 'SHERIFF GEORGE JOHNSON: A LARGE GREEN HERON', v: 'cyan'}],
      big: [{l: 5, w: 'bicycle', lines: [{text: 'EYES LIKE', color: 'white'}, {text: 'BICYCLE REFLECTORS', color: 'red'}], y: 80, size: 100}]},
    {a: 6, b: 7, T: 'dark', scene: 'road', carFrom: [3, 0, -60], carTo: [3, 0, -60], carDur: 1, headlights: false, moth: {x: 4, y: 3.4, z: -18, s: 1.9, rot: 0}, cam: ROAD_FLY, pill: [{l: 6, text: 'ROBERT SMITH · WEST VIRGINIA UNIVERSITY', v: 'cyan'}],
      big: [{l: 6, w: 'crane', lines: [{text: 'A SANDHILL CRANE?', color: 'white'}, {text: '7-FT WINGSPAN', color: 'yellow'}], y: 80, size: 100}]},
    {a: 7, b: null, T: 'quote', head: 'RULE 4', lines: ['BE CAREFUL', 'WITH THE NAME.', 'MEMORY FILLS IN', 'THE REST.'], hi: [3], size: 86},
  ],
  CH5: [
    {a: 0, b: 1, T: 'dark', scene: 'farm', gob: GOB_MANY, cam: FARM_ORBIT, pill: [{l: 0, text: 'FIRST NEWSPAPER REPORT · HOPKINSVILLE STORY', v: 'yellow'}], big: [{l: 0, w: 'twelve', lines: [{text: '12 TO 15 CREATURES', color: 'white'}], y: 130, size: 100}]},
    {a: 1, b: 2, T: 'quote', head: 'THE COLOUR', lines: ['"GREEN" IS NOT IN', 'THE EARLY ARTICLES.', 'IT WAS ADDED LATER.'], hi: [2], size: 74},
    {a: 2, b: 3, T: 'stat', text: 'HOAX', label: 'PROJECT BLUE BOOK LATER LISTED IT AS', sub: 'AIR FORCE · NO COMMENT', rings: true, color: '#ff5a4e'},
    {a: 3, b: 4, T: 'quote', head: 'IT STILL BECAME A TEACHING EXAMPLE', lines: ['2014 · FRONTIERS IN PSYCHOLOGY', 'SCHMALTZ + LILIENFELD:', 'A PSEUDOSCIENCE TEACHING CASE', 'IT ALSO INSPIRED: "CRITTERS" (1986)'], hi: [3], size: 48,
      pill: [{l: 3, w: 'spielberg', text: 'AND SPIELBERG\'S UNPRODUCED FILM "NIGHT SKIES"', v: 'yellow'}]},
    {a: 4, b: 5, T: 'dark', scene: 'bridge', collapseAt: {l: 4, w: 'collapsed'}, cam: BRIDGE_CAM, pill: [{l: 4, text: '15 DEC 1967 · SILVER BRIDGE · POINT PLEASANT', v: 'yellow'}],
      big: [{l: 4, w: 'forty', lines: [{text: '46 PEOPLE DIED', color: 'white'}], y: 130, size: 110}]},
    {a: 5, b: 6, T: 'quote', head: 'THE LINK WAS WRITTEN LATER', lines: ['1970 · THE SILVER BRIDGE', 'GRAY BARKER · HEAVILY FICTIONALIZED', '1975 · THE MOTHMAN PROPHECIES', 'JOHN KEEL · CARRIED THE LINK ON'], hi: [0, 2], size: 46},
    {a: 6, b: 7, T: 'quote', head: 'REED · SKEPTICAL INQUIRER · 2022', lines: ['A GREAT BLUE HERON', 'WAS STATISTICALLY', 'LIKELIER'], hi: [0], size: 78},
    {a: 7, b: null, T: 'quote', head: 'RULE 5', lines: ['A REAL TRAGEDY CAN ATTACH', 'ITSELF TO AN EARLIER STORY.', 'ASK WHEN EACH PART WAS', 'FIRST WRITTEN DOWN.'], hi: [3], size: 62},
  ],
  CH6: [
    {a: 0, b: 1, T: 'stat', text: 'A CASE WITH A MAP', label: 'DOVER, MASSACHUSETTS · 1977', rings: true},
    {a: 1, b: 2, T: 'dark', scene: 'wall', wallBeast: true, headlights: true, cam: WALL_CAM, pill: [{l: 1, text: '21 APR 1977 · FARM STREET · DOVER, MA · BILL BARTLETT, 17', v: 'yellow'}],
      big: [{l: 1, w: 'four', lines: [{text: '4 FEET TALL', color: 'white'}], y: 130, size: 100}, {l: 1, w: 'orange', lines: [{text: 'ORANGE GLOWING EYES', color: 'yellow'}], y: 130, size: 100}, {l: 1, w: 'nose', lines: [{text: 'NO NOSE · NO MOUTH', color: 'red'}], y: 130, size: 100}]},
    {a: 2, b: 3, T: 'dmap', pins: [{l: 2, w: 'baxter'}, {l: 2, w: 'brabham'}], shown: false, pill: [{l: 2, text: 'THE SAME EVENING · THE NEXT NIGHT', v: 'yellow'}], big: [{l: 2, w: 'next', lines: [{text: '3 TEENAGERS', color: 'white'}, {text: '3 SIGHTINGS', color: 'yellow'}], y: 80, size: 110}]},
    {a: 3, b: 4, T: 'quote', head: 'EACH TEEN DREW A SKETCH', lines: ['BARTLETT WROTE ON HIS:', '"I SWEAR ON A STACK', 'OF BIBLES THAT I SAW', 'THIS CREATURE."'], hi: [1, 2, 3], size: 54},
    {a: 4, b: 5, T: 'dmap', pins: [{l: 4, s: 0}, {l: 4, s: 0}, {l: 4, s: 0}], shown: true, lineAt: {l: 4, w: 'straight'}},
    {a: 5, b: 6, T: 'quote', head: 'NOT PUBLIC UNTIL MAY', lines: ['POLICE TO THE ASSOCIATED PRESS:', 'PROBABLY NOTHING MORE THAN', 'A SCHOOL VACATION HOAX.'], hi: [2], size: 52},
    {a: 6, b: 7, T: 'dark', scene: 'owl', owls: [[0, 1.8, -10, 1.5, 0, '#e6e6ee', '#f7f7fb', '#ffd23a']], cam: OWL_CAM, pill: [{l: 6, text: 'PROPOSED: A FOAL · A MOOSE CALF · A SNOWY OWL', v: 'cyan'}], big: [{l: 6, w: 'proposed', lines: [{text: 'PROPOSED, NOT PROVEN', color: 'yellow'}], y: 130, size: 100}]},
    {a: 7, b: null, T: 'quote', head: 'RULE 6', lines: ['MARK THE PLACE,', 'THE TIME,', 'AND THE DIRECTION.', 'A STRAIGHT LINE CAN BE CHECKED.'], hi: [3], size: 72},
  ],
  CH7: [
    {a: 0, b: 1, T: 'quote', head: '4 CASES · 4 PROPOSED ANSWERS', lines: ['FLATWOODS: METEOR · BEACONS · BARN OWL', 'KELLY: GREAT HORNED OWL', 'POINT PLEASANT: HERON · SANDHILL CRANE', 'DOVER: FOAL · MOOSE CALF · SNOWY OWL'], hi: [], size: 40},
    {a: 1, b: 2, T: 'stat', text: 'PROPOSED', label: 'NOT PROVEN', rings: true, color: '#ff5a4e', big: [{l: 1, w: 'proposed', lines: [{text: 'NOTICE THE CAREFUL WORD', color: 'white'}], y: 80, size: 90}]},
    {a: 2, b: 3, T: 'dark', scene: 'wall', wallBeast: true, headlights: false, cam: WALL_ORBIT, pill: [{l: 2, text: 'BRIAN DUNNING · ON THE DOVER ANSWER', v: 'cyan'}, {l: 2, w: 'liars', text: 'HE IS NOT CALLING THE KIDS LIARS', v: 'yellow'}],
      big: [{l: 2, w: 'ask', lines: [{text: 'WHY WOULD A SNOWY OWL', color: 'white'}, {text: 'FOOL SEVERAL PEOPLE?', color: 'yellow'}], y: 80, size: 90}]},
    {a: 3, b: 4, T: 'kpu', rows: [{name: 'KNOWN', color: '#9be15d', what: 'SINCERE WITNESSES REPORTED GLOWING EYES IN THE DARK', l: 3, w: 'known'}, {name: 'PROPOSED', color: '#ffd93b', what: 'OWLS · HERONS · A CRANE · A METEOR · A TRUCK', l: 3, w: 'proposed'}, {name: 'UNSOLVED', color: '#ff5a4e', what: 'WHY THE SAME FEW SHAPES, AGAIN AND AGAIN', l: 3, w: 'unsolved'}]},
    {a: 4, b: null, T: 'sky', scene: 'forest', kind: 'orb', arrived: true, to: [10, 36, -70], cam: [c(0, [0, 2, 16], [10, 14, -60], 54), c(1, [2, 22, 18], [10, 40, -60], 60)], big: [{l: 4, w: 'pretend', lines: [{text: "DON'T PRETEND YOU KNOW MORE", color: 'white'}, {text: 'IN EITHER DIRECTION', color: 'yellow'}], y: 80, size: 90}]},
  ],
  OUTRO: [
    {a: 0, b: 1, T: 'note', head: 'FILE 004 · FIELD NOTES', lines: ['WRITE IT DOWN.', 'COUNT THE LIGHTS.', 'MEASURE IT.', 'LOOK UP.'], hi: [3], typeSecs: 5},
    {a: 1, b: null, T: 'end', subscribeAt: {l: 1, o: 1.2}, title: 'ANOTHER FILE OPENS SOON', sub: 'FILE 004 CLOSED'},
  ],
};

// ---- rule HUD: a slam-in rule card for the first 3.4 s of each chapter, then a small 7-box tracker in the top-right corner.
const RuleHud = ({id}) => {
  const n = id.startsWith('CH') ? parseInt(id.slice(2), 10) : 0; const f = useCurrentFrame(); const {fps} = useVideoConfig();
  if (!n) return null;
  const k = spring({frame: f, fps, config: {damping: 12, stiffness: 150}}); const out = Math.min(1, Math.max(0, (f - FR(3.0)) / 8));
  return <>
    {f < FR(3.4) && <div style={{position: 'absolute', left: 0, right: 0, top: 360, height: 300, background: 'rgba(4,6,12,0.88)', borderTop: '6px solid #ffd93b', borderBottom: '6px solid #ffd93b', opacity: 1 - out, transform: `scaleY(${0.2 + 0.8 * Math.min(1, k)})`, textAlign: 'center'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 56, color: '#ffd93b', letterSpacing: 8, marginTop: 28, ...STROKE(8)}}>FILE 004 · RULE {n}</div>
      <div style={{fontFamily: 'Lilita One', fontSize: RULES[id].length > 30 ? 74 : 118, color: '#fff', marginTop: 12, lineHeight: 1.05, padding: '0 80px', ...STROKE(14)}}>{RULES[id]}</div>
    </div>}
    <div style={{position: 'absolute', right: 96, top: 52, textAlign: 'right'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 30, color: '#ffd93b', letterSpacing: 5, ...STROKE(6)}}>FILE 004</div>
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
