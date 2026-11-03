import {pal} from '../../../palette.js'; // HUMANE caption palette 2026-11-03
// LF06 FILE 006 "If You Ever Find a Message Nobody Can Read... STOP GUESSING" - 1920x1080 @ 24 fps, one composition per chapter.
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
const RULES = {CH1: 'A CODE THAT BEATS YOU MAY WAIT FOR A BETTER TOOL', CH2: 'TEST THE PAPER BEFORE THE WORDS', CH3: 'EXPERTS LOSE TOO. SHARE THE PROBLEM.', CH4: 'A CLUE IS NOT AN ANSWER', CH5: 'ASK WHETHER THE STORY IS THE PUZZLE', CH6: "SOME MESSAGES ARE TOO SHORT. DON'T FORCE IT.", CH7: 'SAY "UNKNOWN" OUT LOUD'};

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
    {a: 0, b: 1, T: 'cipher', cols: 17, rows: 20, scanAt: {l: 0, w: 'nobody'}, scanDur: 3, head: 'A MESSAGE NOBODY CAN READ · STAND-IN SYMBOLS',
      big: [{l: 0, w: 'message', lines: [{text: 'A MESSAGE', color: 'white'}, {text: 'NOBODY CAN READ', color: 'red'}], y: 80, size: 120}, {l: 0, w: 'stop', lines: [{text: 'STOP GUESSING', color: 'yellow'}], y: 130, size: 150}]},
    {a: 1, to: {l: 1, w: 'stays'}, T: 'cipher', cols: 17, rows: 20, head: 'Z340 · STAND-IN SYMBOLS · NOT THE REAL CIPHER', pill: [{l: 1, text: 'NOVEMBER 1969 · SAN FRANCISCO', v: 'yellow'}, {l: 1, w: 'killer', text: 'THE ZODIAC KILLER · 340 CHARACTERS', v: 'red'}],
      big: [{l: 1, w: 'three', lines: [{text: '340 CHARACTERS', color: 'white'}], y: 130, size: 130}]},
    {from: {l: 1, w: 'stays'}, b: 2, T: 'stat', number: 51, label: 'YEARS UNBROKEN', sub: 'UNTIL THREE STRANGERS READ IT', rings: true, color: pal().alt},
    {a: 2, to: {l: 2, w: 'shorter'}, T: 'stat', text: '3 STRANGERS', label: 'THREE DIFFERENT CONTINENTS', sub: 'DECEMBER 2020', rings: true, color: '#7fe3ff'},
    {from: {l: 2, w: 'shorter'}, b: 3, T: 'cipher', kind: 'zodiac', cols: 13, rows: 1, size: 70, head: 'THE SHORTER CODES · 13 AND 32 CHARACTERS · STAND-IN SYMBOLS', noteStamp: 'STILL UNREAD', stampAt: {l: 2, w: 'still'}},
    {a: 3, to: {l: 3, w: 'sold'}, T: 'stat', text: '7 CODES · 7 RULES', label: 'ZODIAC · VOYNICH · DORABELLA · KRYPTOS · BEALE · SOMERTON · PHAISTOS', rings: true},
    {from: {l: 3, w: 'sold'}, b: 4, T: 'stat', text: '$962,500', label: 'THE KRYPTOS ARCHIVE · AUCTIONED', sub: 'WITH THE ANSWER TO K4 · NOV 2025', rings: true, color: pal().active},
    {a: 4, b: null, T: 'screen', cam: SCREEN_WIDE, big: [{l: 4, w: 'stay', lines: [{text: 'ONE MESSAGE', color: 'white'}, {text: 'IS STILL WAITING', color: 'yellow'}], y: 80, size: 110}]},
  ],
  CH1: [
    {a: 0, to: {l: 0, w: 'inside'}, T: 'cipher', cols: 17, rows: 20, head: 'Z340 · STAND-IN SYMBOLS', pill: [{l: 0, text: '8 NOV 1969 · A CARD TO THE SAN FRANCISCO CHRONICLE', v: 'yellow'}, {l: 0, w: 'zodiac', text: 'THE ZODIAC KILLER', v: 'red'}],
      big: [{l: 0, w: 'start', lines: [{text: 'THE CODE', color: 'white'}, {text: 'THAT FELL', color: 'yellow'}], y: 80, size: 120}]},
    {from: {l: 0, w: 'inside'}, b: 1, T: 'cipher', cols: 17, rows: 20, scanAt: {l: 0, w: 'inside'}, scanDur: 6, head: 'Z340 · 340 CHARACTERS', big: [{l: 0, w: 'three', lines: [{text: '340 CHARACTERS', color: 'white'}], y: 130, size: 130}]},
    {a: 1, b: 2, T: 'stat', number: 51, label: 'YEARS WITHOUT AN ANSWER', rings: true, color: pal().alt},
    {a: 2, to: {l: 2, w: 'by'}, T: 'stat', text: '5 DEC 2020', label: 'Z340 IS READ', rings: true, color: '#9be15d'},
    {from: {l: 2, w: 'by'}, to: {l: 2, w: 'three'}, T: 'quote', head: 'THREE PRIVATE CITIZENS', lines: ['DAVID ORANCHAK · USA · ENGINEER', 'SAM BLAKE · AUSTRALIA · MATHS', 'JARL VAN EYCKE · BELGIUM · CODER'], hi: [2], size: 54},
    {from: {l: 2, w: 'three'}, b: 3, T: 'cipher', cols: 17, rows: 20, scanAt: {l: 2, w: 'using'}, scanDur: 5, solvedAt: {l: 2, w: 'called'}, solvedText: ['SOLVED', 'WITH A PROGRAM CALLED AZDECRYPT'], head: 'Z340 · STAND-IN SYMBOLS'},
    {a: 3, b: 4, T: 'quote', head: 'THE CIPHER-MAKER’S SLIP', lines: ['THE ZODIAC APPARENTLY', 'MADE A MISTAKE BUILDING IT.', 'THAT MADE IT', 'HARDER TO SOLVE.'], hi: [3], size: 64},
    {a: 4, b: 5, T: 'quote', head: 'WHAT THE MESSAGE SAID', lines: ['NOT THE MAN CALLED “SAM”', 'NOT AFRAID OF THE GAS CHAMBER', 'NO CLUE TO WHO HE WAS'], hi: [2], size: 60},
    {a: 5, b: null, T: 'quote', head: 'RULE 1', lines: ['A CODE THAT BEATS YOU', 'TODAY MAY ONLY BE WAITING', 'FOR A BETTER TOOL.'], hi: [2], size: 82},
  ],
  CH2: [
    {a: 0, to: {l: 0, w: 'around'}, T: 'book', cam: BOOK_TOP, label: 'THE VOYNICH MANUSCRIPT · STAND-IN PAGE', big: [{l: 0, w: 'now', lines: [{text: 'A BOOK', color: 'white'}, {text: 'NOBODY CAN READ', color: 'red'}], y: 80, size: 120}]},
    {from: {l: 0, w: 'around'}, b: 1, T: 'book', cam: BOOK_PLANT, openAt: {l: 0, w: 'scholars'}, label: 'VOYNICHESE · AN UNDECIPHERED SCRIPT', pill: [{l: 0, text: '~240 PAGES · HAND-WRITTEN', v: 'yellow'}], big: [{l: 0, w: 'scholars', lines: [{text: 'SCRIPT CALLED', color: 'white'}, {text: '“VOYNICHESE”', color: 'yellow'}], y: 80, size: 110}]},
    {a: 1, to: {l: 1, w: 'he'}, T: 'quote', head: 'THE FIRST CONFIRMED OWNER', lines: ['GEORG BARESCH', 'AN ALCHEMIST IN PRAGUE', '17TH CENTURY'], hi: [0], size: 72},
    {from: {l: 1, w: 'he'}, to: {l: 1, w: 'that'}, T: 'book', cam: BOOK_SIDE, label: 'SAMPLES SENT TO A SCHOLAR IN ROME', pill: [{l: 1, w: 'rome', text: 'ASKING FOR HELP', v: 'cyan'}]},
    {from: {l: 1, w: 'that'}, b: 2, T: 'stat', text: '1639', label: 'THE EARLIEST MENTION WE CAN CONFIRM', rings: true},
    {a: 2, to: {l: 2, w: 'in'}, T: 'book', cam: BOOK_TOP, label: 'WHAT SCIENCE COULD DO', big: [{l: 2, w: 'here', lines: [{text: 'WHAT SCIENCE', color: 'white'}, {text: 'COULD DO', color: 'yellow'}], y: 80, size: 120}]},
    {from: {l: 2, w: 'in'}, to: {l: 2, w: 'protein'}, T: 'stat', text: '1404 – 1438', label: 'RADIOCARBON DATE OF THE PARCHMENT', sub: 'UNIVERSITY OF ARIZONA · 2009', rings: true, color: '#7fe3ff'},
    {from: {l: 2, w: 'protein'}, b: 3, T: 'quote', head: 'PROTEIN TESTING · 2014', lines: ['CALFSKIN', 'AT LEAST 14 OR 15 SKINS', 'NEVER WRITTEN ON BEFORE'], hi: [2], size: 66},
    {a: 3, b: 4, T: 'book', cam: BOOK_PLANT, big: [{l: 3, w: 'so', lines: [{text: 'REAL. OLD.', color: 'green'}, {text: 'STILL UNREAD.', color: 'red'}], y: 80, size: 120}]},
    {a: 4, b: null, T: 'quote', head: 'RULE 2', lines: ['TEST THE PAPER', 'BEFORE YOU TEST', 'THE WORDS.'], hi: [2], size: 92},
  ],
  CH3: [
    {a: 0, b: 1, T: 'check', title: 'WHO TRIED THE VOYNICH', rows: [{name: 'PRESCOTT CURRIER', what: 'NOT DEMONSTRABLY SOLVED', l: 0, w: 'prescott'}, {name: 'WILLIAM FRIEDMAN', what: 'NOT DEMONSTRABLY SOLVED', l: 0, w: 'william'}, {name: 'ELIZEBETH FRIEDMAN', what: 'NOT DEMONSTRABLY SOLVED', l: 0, w: 'elizebeth'}, {name: 'JOHN TILTMAN', what: 'NOT DEMONSTRABLY SOLVED', l: 0, w: 'john'}]},
    {a: 1, to: {l: 1, w: 'on'}, T: 'quote', head: 'JULY 1897 · EDWARD ELGAR', lines: ['A NOTE SLIPPED INTO A LETTER', 'TO A YOUNG WOMAN,', 'DORA PENNY'], hi: [2], size: 62},
    {from: {l: 1, w: 'on'}, b: 2, T: 'cipher', kind: 'dora', cols: 29, rows: 3, size: 52, head: 'DORABELLA · 87 CHARACTERS · 3 LINES · STAND-IN CURVES', foot: '24 SYMBOLS · 1-3 CURVES · 8 DIRECTIONS', scanAt: {l: 1, w: 'built'}, scanDur: 6},
    {a: 2, to: {l: 2, w: 'until'}, T: 'stat', text: '40 YEARS', label: 'IN A DRAWER · UNREAD', rings: true, color: pal().active},
    {from: {l: 2, w: 'until'}, b: 3, T: 'quote', head: 'AFTER THE DRAWER', lines: ['1937 · DORA PRINTS IT IN HER MEMOIR', '1899 · ELGAR DEDICATES AN ENIGMA', 'VARIATION TO HER', 'ITS MEANING: STILL UNKNOWN'], hi: [3], size: 52},
    {a: 3, to: {l: 3, w: 'not'}, T: 'cipher', cols: 17, rows: 20, scanAt: {l: 3, w: 'finally'}, solvedAt: {l: 3, w: 'broke'}, solvedText: ['Z340', 'BROKEN IN 2020'], head: 'WHAT FINALLY BROKE Z340'},
    {from: {l: 3, w: 'not'}, to: {l: 3, w: 'and'}, T: 'stat', text: '3 STRANGERS', label: 'NOT ONE EXPERT · SHARING TOOLS', rings: true, color: '#9be15d'},
    {from: {l: 3, w: 'and'}, b: 4, T: 'book', cam: BOOK_TOP, label: '2020 · YALE PUTS THE WHOLE VOYNICH ONLINE', pill: [{l: 3, text: 'OPEN TO ANYONE', v: 'cyan'}]},
    {a: 4, b: null, T: 'quote', head: 'RULE 3', lines: ['EXPERTS LOSE TOO.', 'SHARE THE PROBLEM.'], hi: [1], size: 100},
  ],
  CH4: [
    {a: 0, to: {l: 0, w: 'kryptos'}, T: 'screen', cam: SCREEN_WIDE, pill: [{l: 0, text: 'A COURTYARD AT THE CIA', v: 'yellow'}], big: [{l: 0, w: 'now', lines: [{text: 'THE MOST FAMOUS', color: 'white'}, {text: 'CODE IN THE WORLD', color: 'yellow'}], y: 80, size: 110}]},
    {from: {l: 0, w: 'kryptos'}, b: 1, T: 'screen', cam: SCREEN_PUSH, pill: [{l: 0, w: 'kryptos', text: 'KRYPTOS · JIM SANBORN', v: 'yellow'}, {l: 0, w: 'dedicated', text: 'DEDICATED 3 NOV 1990', v: 'cyan'}, {l: 0, w: 'a', text: 'CURVED COPPER SCREEN · 4 MESSAGES', v: 'cyan'}]},
    {a: 1, to: {l: 1, w: 'the'}, T: 'stat', text: '3 OF 4 FELL', label: 'K1 · K2 · K3', rings: true, color: '#9be15d'},
    {from: {l: 1, w: 'the'}, b: 2, T: 'quote', head: 'WHO SOLVED THEM FIRST?', lines: ['1999 · JIM GILLOGLY', 'THE FIRST PUBLIC SOLVER', '1998 · DAVID STEIN (CIA)', 'PENCIL AND PAPER · CIA SAYS'], hi: [3], size: 54},
    {a: 2, b: 3, T: 'stat', number: 97, label: 'CHARACTERS IN K4', sub: 'NEVER PUBLICLY SOLVED', rings: true, color: pal().alt},
    {a: 3, to: {l: 3, w: 'in'}, T: 'screen', cam: SCREEN_LOW, clueAt: {l: 3, w: 'then'}, pill: [{l: 3, text: 'THEN SANBORN STARTED GIVING CLUES', v: 'yellow'}]},
    {from: {l: 3, w: 'in'}, b: 4, T: 'quote', head: 'THE CLUES', lines: ['2010 · SIX LETTERS: BERLIN', '2014 · FIVE MORE: CLOCK', 'FOUR CLUES IN TOTAL'], hi: [1], size: 62},
    {a: 4, b: 5, T: 'screen', cam: SCREEN_HIGH, clueAt: {l: 4, w: 'and'}, big: [{l: 4, w: 'a', lines: [{text: 'A CLUE NARROWS', color: 'white'}, {text: 'THE SEARCH.', color: 'yellow'}], y: 80, size: 110}, {l: 4, w: 'it', lines: [{text: 'IT DOES NOT FINISH IT.', color: 'red'}], y: 130, size: 90}]},
    {a: 5, to: {l: 5, w: 'on'}, T: 'quote', head: 'THE ARCHIVE', lines: ['2025 · SANBORN PUTS HIS ARCHIVE', 'UP FOR AUCTION', 'WITH THE ANSWER TO K4'], hi: [2], size: 58},
    {from: {l: 5, w: 'on'}, to: {l: 5, w: 'in'}, T: 'stat', text: '$962,500', label: 'SOLD · 20 NOVEMBER', rings: true, color: pal().active},
    {from: {l: 5, w: 'in'}, b: 6, T: 'quote', head: 'JUNE 2026', lines: ['THE BUYER, A FIRM CALLED PARADIGM,', 'STEPPED FORWARD.', 'THE SOLUTION: NOT PUBLISHED', 'AS FAR AS I CAN FIND.'], hi: [2], size: 50},
    {a: 6, b: null, T: 'quote', head: 'RULE 4', lines: ['A CLUE IS NOT AN ANSWER.', 'PROVE THE', 'WHOLE MESSAGE.'], hi: [2], size: 90},
  ],
  CH5: [
    {a: 0, b: 1, T: 'hill', cam: HILL_WIDE, big: [{l: 0, w: 'sometimes', lines: [{text: 'SOMETIMES THE PROBLEM', color: 'white'}, {text: 'ISN’T THE CODE', color: 'yellow'}], y: 80, size: 100}]},
    {a: 1, to: {l: 1, w: 'one'}, T: 'stat', text: '3 PAGES', label: 'THE BEALE CIPHERS', rings: true, color: pal().active},
    {from: {l: 1, w: 'one'}, b: 2, T: 'hill', cam: HILL_BOX, digAt: {l: 1, w: 'gold'}, pill: [{l: 1, text: 'SAID TO POINT TO BURIED TREASURE', v: 'yellow'}, {l: 1, w: 'estimated', text: 'ESTIMATED: OVER $60 MILLION', v: 'red'}]},
    {a: 2, to: {l: 2, w: 'a'}, T: 'quote', head: 'WHERE THE STORY COMES FROM', lines: ['A PAMPHLET · 1885', '“THE BEALE PAPERS”'], hi: [1], size: 80},
    {from: {l: 2, w: 'a'}, to: {l: 2, w: 'he'}, T: 'hill', cam: HILL_WIDE, pill: [{l: 2, w: 'thomas', text: 'THOMAS BEALE · ~1820 · BEDFORD COUNTY, VIRGINIA', v: 'yellow'}]},
    {from: {l: 2, w: 'he'}, b: 3, T: 'hill', cam: HILL_BOX, pill: [{l: 2, w: 'he', text: 'A BOX LEFT WITH INNKEEPER ROBERT MORRISS', v: 'cyan'}, {l: 2, w: 'never', text: 'BEALE: NEVER SEEN AGAIN', v: 'red'}]},
    {a: 3, to: {l: 3, w: 'the'}, T: 'stat', text: '1 OF 3 SOLVED', label: 'PAGE 2 · WHAT WAS BURIED', sub: 'KEY: THE DECLARATION OF INDEPENDENCE', rings: true, color: '#9be15d'},
    {from: {l: 3, w: 'the'}, b: 4, T: 'quote', head: 'STILL UNSOLVED', lines: ['PAGE 1 · THE LOCATION', 'PAGE 3 · THE OWNERS'], hi: [0, 1], size: 80},
    {a: 4, to: {l: 4, w: 'in'}, T: 'quote', head: '1980 · JIM GILLOGLY', lines: ['AN ARTICLE CALLED', '“A DISSENTING OPINION”'], hi: [1], size: 76},
    {from: {l: 4, w: 'in'}, b: 5, T: 'quote', head: '1982 · JOE NICKELL', lines: ['WORDS LIKE “STAMPEDING”', 'SEEM TOO MODERN', 'DOUBTED THOMAS BEALE', 'EVER EXISTED'], hi: [3], size: 60},
    {a: 5, b: 6, T: 'stat', text: 'NO TREASURE', label: 'HAS EVER BEEN FOUND', rings: true, color: pal().alt},
    {a: 6, b: null, T: 'quote', head: 'RULE 5', lines: ['BEFORE YOU DECODE', 'THE MESSAGE, ASK:', 'IS THE STORY', 'THE PUZZLE?'], hi: [3], size: 82},
  ],
  CH6: [
    {a: 0, b: 1, T: 'beach', cam: BEACH_WIDE, pill: [{l: 0, text: 'SOMERTON PARK · ADELAIDE · 1 DEC 1948', v: 'yellow'}], big: [{l: 0, w: 'next', lines: [{text: 'A BODY ON A BEACH', color: 'white'}, {text: 'NEVER IDENTIFIED', color: 'red'}], y: 80, size: 110}]},
    {a: 1, to: {l: 1, w: 'two'}, T: 'beach', cam: BEACH_LOW, pill: [{l: 1, text: 'MONTHS LATER · A HIDDEN FOB POCKET', v: 'yellow'}, {l: 1, w: 'tiny', text: 'A TINY ROLLED SCRAP OF PAPER', v: 'cyan'}]},
    {from: {l: 1, w: 'two'}, to: {l: 1, w: 'it'}, T: 'scrap', big: [{l: 1, w: 'two', lines: [{text: 'TAMAM SHUD', color: 'white'}], y: 80, size: 150}]},
    {from: {l: 1, w: 'it'}, b: 2, T: 'quote', head: 'TAMAM SHUD', lines: ['MEANS “ENDED”', 'TORN FROM THE LAST PAGE OF', 'THE RUBAIYAT OF OMAR KHAYYAM'], hi: [0], size: 62},
    {a: 2, b: 3, T: 'scrap', mode: 'dents', revealAt: {l: 2, w: 'in'}, strikeAt: {l: 2, w: 'the'}, pill: [{l: 2, text: 'FAINT INDENTATIONS · 5 LINES OF CAPITALS · LINE 2 STRUCK OUT', v: 'yellow'}]},
    {a: 3, b: 4, T: 'quote', head: '1978 · DEFENCE DEPARTMENT CRYPTOGRAPHERS', lines: ['NOT ENOUGH SYMBOLS', 'FOR A SATISFACTORY ANSWER.', 'THE TEXT MIGHT EVEN', 'BE MEANINGLESS.'], hi: [3], size: 54},
    {a: 4, b: 5, T: 'quote', head: 'DEREK ABBOTT’S TEAM · THEN JOHN REHLING · 2014', lines: ['THE LETTERS ARE PROBABLY', 'THE FIRST LETTERS OF WORDS', 'INITIALS OF SOME ENGLISH TEXT'], hi: [2], size: 52},
    {a: 5, b: 6, T: 'quote', head: 'INITIALS OF A SENTENCE YOU DO NOT HAVE', lines: ['IS A LOCK', 'WITH NO KEY.'], hi: [1], size: 100},
    {a: 6, b: 7, T: 'quote', head: '2022 · ABBOTT + A GENEALOGIST', lines: ['CLAIMED THE MAN WAS CARL WEBB', 'DNA FROM HIS HAIR', 'SOUTH AUSTRALIA POLICE:', 'NOT VERIFIED'], hi: [3], size: 56},
    {a: 7, b: null, T: 'quote', head: 'RULE 6', lines: ['SOME MESSAGES ARE', 'TOO SHORT TO SOLVE.', 'DO NOT FORCE AN ANSWER.'], hi: [2], size: 80},
  ],
  CH7: [
    {a: 0, b: 1, T: 'disc', cam: DISC_FRONT, label: 'THE PHAISTOS DISC · STAND-IN SIGNS', big: [{l: 0, w: 'one', lines: [{text: 'ONE LAST FILE', color: 'white'}, {text: 'SILENCE FROM THE BRONZE AGE', color: 'yellow'}], y: 80, size: 100}]},
    {a: 1, to: {l: 1, w: 'both'}, T: 'disc', cam: DISC_SIDE, pill: [{l: 1, text: '1908 · CRETE · LUIGI PERNIER', v: 'yellow'}, {l: 1, w: 'disc', text: 'FIRED CLAY · 16 CM · PALACE OF PHAISTOS', v: 'cyan'}]},
    {from: {l: 1, w: 'both'}, b: 2, T: 'stat', text: '242 SIGNS', label: '45 DIFFERENT SIGNS · PRESSED INTO SOFT CLAY', sub: 'A SPIRAL ON BOTH SIDES', rings: true, color: pal().active},
    {a: 2, to: {l: 2, w: 'today'}, T: 'quote', head: 'AT FIRST', lines: ['SOME SCHOLARS SUSPECTED', 'A FORGERY'], hi: [1], size: 80},
    {from: {l: 2, w: 'today'}, b: 3, T: 'disc', cam: DISC_FRONT, pill: [{l: 2, w: 'today', text: 'TODAY: GENERALLY ACCEPTED AS AUTHENTIC', v: 'green'}, {l: 2, w: 'and', text: 'UNREAD · NOT EVEN SURE IT IS WRITING', v: 'red'}]},
    {a: 3, to: {l: 3, w: 'thirteen'}, T: 'cipher', cols: 13, rows: 3, size: 62, head: 'BACK IN CALIFORNIA · 1970 · ZODIAC · STAND-IN SYMBOLS', pill: [{l: 3, w: 'sent', text: 'TWO SHORTER CODES', v: 'yellow'}]},
    {from: {l: 3, w: 'thirteen'}, b: 4, T: 'quote', head: 'THE SHORT ZODIAC CODES', lines: ['13 CHARACTERS · 32 CHARACTERS', 'HUNDREDS OF PROPOSED SOLUTIONS', 'ORANCHAK: PRACTICALLY IMPOSSIBLE', 'TO TELL IF ANY IS CORRECT'], hi: [2], size: 50},
    {a: 4, b: 5, T: 'kpu', rows: [{name: 'KNOWN', color: '#9be15d', what: 'Z340 · 3 KRYPTOS MESSAGES · BEALE PAGE 2', l: 4, w: 'known'}, {name: 'PROPOSED', color: pal().active, what: 'WEBB (SOMERTON MAN) · A HOAX (BEALE)', l: 4, w: 'proposed'}, {name: 'UNSOLVED', color: pal().alt, what: 'VOYNICH · DORABELLA · K4 · PHAISTOS · 2 SHORT ZODIAC CODES', l: 4, w: 'unsolved'}]},
    {a: 5, b: null, T: 'quote', head: 'RULE 7', lines: ['SAY “UNKNOWN”', 'OUT LOUD.', 'THAT IS HOW THE NEXT PERSON', 'KNOWS WHERE TO LOOK.'], hi: [1], size: 82},
  ],
  OUTRO: [
    {a: 0, b: 1, T: 'note', head: 'FILE 006 · FIELD NOTES', lines: ['WAIT FOR THE RIGHT TOOL.', 'TEST THE PAPER. SHARE IT.', 'CHECK THE CLUE. QUESTION THE STORY.', 'RESPECT THE LENGTH.', 'SAY WHAT YOU DO NOT KNOW.'], hi: [4], typeSecs: 9},
    {a: 1, b: null, T: 'end', subscribeAt: {l: 1, o: 1.2}, title: 'ANOTHER FILE OPENS SOON', sub: 'FILE 006 CLOSED'},
  ],
};

const RuleHud = ({id}) => {
  const n = id.startsWith('CH') ? parseInt(id.slice(2), 10) : 0; const f = useCurrentFrame(); const {fps} = useVideoConfig();
  if (!n) return null;
  const k = spring({frame: f, fps, config: {damping: 12, stiffness: 150}}); const out = Math.min(1, Math.max(0, (f - FR(3.0)) / 8));
  return <>
    {f < FR(3.4) && <div style={{position: 'absolute', left: 0, right: 0, top: 360, height: 300, background: 'rgba(4,6,12,0.88)', borderTop: `6px solid ${pal().active}`, borderBottom: `6px solid ${pal().active}`, opacity: 1 - out, transform: `scaleY(${0.2 + 0.8 * Math.min(1, k)})`, textAlign: 'center'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 56, color: pal().active, letterSpacing: 8, marginTop: 28, ...STROKE(8)}}>FILE 006 · RULE {n}</div>
      <div style={{fontFamily: 'Lilita One', fontSize: RULES[id].length > 30 ? 66 : 118, color: '#fff', marginTop: 12, lineHeight: 1.05, padding: '0 80px', ...STROKE(14)}}>{RULES[id]}</div>
    </div>}
    <div style={{position: 'absolute', right: 96, top: 52, textAlign: 'right'}}>
      <div style={{fontFamily: 'Lilita One', fontSize: 30, color: pal().active, letterSpacing: 5, ...STROKE(6)}}>FILE 006</div>
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
