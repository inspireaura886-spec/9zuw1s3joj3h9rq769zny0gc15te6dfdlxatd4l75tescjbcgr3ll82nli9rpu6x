// src/timing.ts
export interface SceneTiming {
  id: string;
  index: number;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
  scriptContext: string;
  description: string;
}

export const FPS = 30;
export const TOTAL_FRAMES = 1530; // 51.00s

// Exact scene cuts in seconds from prompt:
// 0, 2.34, 4.22, 5.91, 10.16, 12.48, 13.64, 15.69, 18.13, 21.22, 23.86, 26.09, 29.54, 31.76, 34.2, 35.98, 37.77, 41.33, 47.45 (to 51.0)
export const SCENE_CUT_SECONDS = [
  0, 2.34, 4.22, 5.91, 10.16, 12.48, 13.64, 15.69, 18.13, 21.22, 23.86, 26.09,
  29.54, 31.76, 34.2, 35.98, 37.77, 41.33, 47.45, 51.0,
];

// Exact HITS in seconds from prompt:
// 13.64, 17.37, 21.22, 27.34, 31.14, 37.77, 44.09
export const HIT_SECONDS = [13.64, 17.37, 21.22, 27.34, 31.14, 37.77, 44.09];
export const HIT_FRAMES = HIT_SECONDS.map((s) => Math.round(s * FPS));
// [409, 521, 637, 820, 934, 1133, 1323]

export interface OnScreenTextSpec {
  id: string;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  line1: string;
  line2: string;
  yPos: number;
  accentColor?: string;
}

export const ON_SCREEN_TEXTS: OnScreenTextSpec[] = [
  {
    id: 'text-1',
    startSec: 0.0,
    endSec: 2.3,
    startFrame: 0,
    endFrame: 69,
    line1: '2 AGENTS.',
    line2: 'ZERO SOUND.',
    yPos: 230,
    accentColor: '#FFB84D',
  },
  {
    id: 'text-2',
    startSec: 21.22,
    endSec: 23.8,
    startFrame: 637,
    endFrame: 714,
    line1: 'A DRONE 1 MILE AWAY',
    line2: 'WOULD BE LOUD.',
    yPos: 240,
    accentColor: '#64D2FF',
  },
  {
    id: 'text-3',
    startSec: 44.09,
    endSec: 47.4,
    startFrame: 1323,
    endFrame: 1422,
    line1: 'FBI: 3 SEC',
    line2: 'PENTAGON: 30+ SEC',
    yPos: 240,
    accentColor: '#FF3B4E',
  },
];

export const SCENES: SceneTiming[] = [
  {
    id: 'S01-HookRise',
    index: 1,
    startSec: 0.0,
    endSec: 2.34,
    startFrame: 0,
    endFrame: 70,
    durationInFrames: 70,
    scriptContext: 'Two federal agents watched a black triangle rise over a ridge...',
    description: 'Frame 0 matches loop end: huge matte-black triangle already large and rising over dusk desert ridge with two cel-shaded agent silhouettes in foreground.',
  },
  {
    id: 'S02-ZeroSound',
    index: 2,
    startSec: 2.34,
    endSec: 4.22,
    startFrame: 70,
    endFrame: 127,
    durationInFrames: 57,
    scriptContext: '...and it made no sound at all.',
    description: 'Close over-the-shoulder angle on the two agents in hard purple-blue shadow; flat dead-line acoustic meter & wind-blown dust emphasize eerie silence.',
  },
  {
    id: 'S03-SilentShadow',
    index: 3,
    startSec: 4.22,
    endSec: 5.91,
    startFrame: 127,
    endFrame: 177,
    durationInFrames: 50,
    scriptContext: '(Pause / atmospheric beat before 5.91s)',
    description: 'Low angle looking up past agents coats fluttering in dusk wind as the monolithic black triangle eclipses the amber-purple sky.',
  },
  {
    id: 'S04-HilltopPostThermal',
    index: 4,
    startSec: 5.91,
    endSec: 10.16,
    startFrame: 177,
    endFrame: 305,
    durationInFrames: 128,
    scriptContext: 'Twenty twenty-six. A guarded hilltop post, eight twenty-three p.m.',
    description: 'Green thermal-scope view: hilltop post perimeter, SUV & antenna warm signatures, 2026 / 20:23 PM HUD stamp, scanning toward the ridge.',
  },
  {
    id: 'S05-ThirdAgentScopeCall',
    index: 5,
    startSec: 10.16,
    endSec: 12.48,
    startFrame: 305,
    endFrame: 374,
    durationInFrames: 69,
    scriptContext: "A third agent's thermal scope called it in.",
    description: 'Split/inset green thermal optic & third agent silhouette holding thermal monocular on ridge; radio wave pulse as scope locks onto cold triangular anomaly.',
  },
  {
    id: 'S06-ThermalLockTriangle',
    index: 6,
    startSec: 12.48,
    endSec: 13.64,
    startFrame: 374,
    endFrame: 409,
    durationInFrames: 35,
    scriptContext: '(Thermal scope lock zoom before 13.64s climb hit)',
    description: 'Full green thermal scope magnification locking onto the razor-sharp pitch-black triangle rising above the glowing heat-signature ridge.',
  },
  {
    id: 'S07-StraightUpClimb',
    index: 7,
    startSec: 13.64,
    endSec: 15.69,
    startFrame: 409,
    endFrame: 471,
    durationInFrames: 62,
    scriptContext: 'It climbed straight up for ten seconds.',
    description: 'HIT at 13.64s. Anime-noir vertical tracking shot with downward speed lines and altitude ticks (01s..10s) as matte-black triangle ascends straight up.',
  },
  {
    id: 'S08-NoTiltNoWobbleNoLights',
    index: 8,
    startSec: 15.69,
    endSec: 18.13,
    startFrame: 471,
    endFrame: 544,
    durationInFrames: 73,
    scriptContext: 'No tilt. No wobble. No lights.',
    description: 'Precision geometric orthographic lock on the rising triangle: 0.0° tilt gyroscope, zero-oscillation line, and HIT at 17.37s highlighting pure lightless hull.',
  },
  {
    id: 'S09-StoppedDeadHang',
    index: 9,
    startSec: 18.13,
    endSec: 21.22,
    startFrame: 544,
    endFrame: 637,
    durationInFrames: 93,
    scriptContext: 'Then it stopped dead, and hung there for twenty seconds.',
    description: 'Abrupt halt in mid-air above the canyon dusk sky; 20-second radial timer sweeps around the motionless black triangle while dusk clouds drift past.',
  },
  {
    id: 'S10-DroneOneMileLoud',
    index: 10,
    startSec: 21.22,
    endSec: 23.86,
    startFrame: 637,
    endFrame: 716,
    durationInFrames: 79,
    scriptContext: 'But on that hilltop, they said, even a small drone a mile away would be loud.',
    description: 'HIT at 21.22s + ON-SCREEN TEXT. Distant 1-mile quadcopter diagram emitting jagged red acoustic shockwaves across the canyon toward the hilltop.',
  },
  {
    id: 'S11-AcousticContrast',
    index: 11,
    startSec: 23.86,
    endSec: 26.09,
    startFrame: 716,
    endFrame: 783,
    durationInFrames: 67,
    scriptContext: '(Contrast between loud distant drone and silent giant craft right overhead)',
    description: 'Dual waveform comparison above the two agents: small drone noisy red spikes vs massive overhead black triangle at 0.0 dB flatline.',
  },
  {
    id: 'S12-ShotSidewaysJetSpeed',
    index: 12,
    startSec: 26.09,
    endSec: 29.54,
    startFrame: 783,
    endFrame: 886,
    durationInFrames: 103,
    scriptContext: 'From a dead stop, it shot sideways, fast as a fighter jet...',
    description: 'Instantaneous lateral acceleration with intense horizontal anime speed lines, Mach vapor cone, and HIT at 27.34s as craft streaks across the dusk sky.',
  },
  {
    id: 'S13-BankedAndDoveCanyon',
    index: 13,
    startSec: 29.54,
    endSec: 31.76,
    startFrame: 886,
    endFrame: 953,
    durationInFrames: 67,
    scriptContext: '...banked, and dove into a canyon.',
    description: 'Dynamic diagonal speed lines as the matte-black triangle banks sharply on its edge and plunges into the deep purple-shadowed canyon gorge; HIT at 31.14s.',
  },
  {
    id: 'S14-LeftThermalView',
    index: 14,
    startSec: 31.76,
    endSec: 34.2,
    startFrame: 953,
    endFrame: 1026,
    durationInFrames: 73,
    scriptContext: "So fast it left the thermal scope's view.",
    description: 'Green thermal scope reticle wildly panning and flashing TARGET LOST / VELOCITY EXCEEDED as the black triangle blurs right out of the circular FOV.',
  },
  {
    id: 'S15-StillTotalSilence',
    index: 15,
    startSec: 34.2,
    endSec: 35.98,
    startFrame: 1026,
    endFrame: 1079,
    durationInFrames: 53,
    scriptContext: 'Still, total silence.',
    description: 'Wide shot of the empty canyon rim and two motionless agent silhouettes; dust motes settle in the purple dusk air with a 0.0 dB flatline.',
  },
  {
    id: 'S16-NextMorningCanyonSearch',
    index: 16,
    startSec: 35.98,
    endSec: 37.77,
    startFrame: 1079,
    endFrame: 1133,
    durationInFrames: 54,
    scriptContext: 'Next morning, they searched the canyon.',
    description: 'Amber-violet morning light shafts piercing the deep canyon floor as the two agent silhouettes walk along the rocky gorge inspecting the ground.',
  },
  {
    id: 'S17-NoWreckageNoScarredGround',
    index: 17,
    startSec: 37.77,
    endSec: 41.33,
    startFrame: 1133,
    endFrame: 1240,
    durationInFrames: 107,
    scriptContext: 'No wreckage. No scarred ground. Not one damaged plant.',
    description: 'HIT at 37.77s. Close inspection of untouched canyon rock and intact desert sage/agave swaying gently in the breeze with forensic negative scan markers.',
  },
  {
    id: 'S18-FbiVsPentagonRecord',
    index: 18,
    startSec: 41.33,
    endSec: 47.45,
    startFrame: 1240,
    endFrame: 1424,
    durationInFrames: 184,
    scriptContext: "And the agents' own FBI statement says it lasted three seconds. The Pentagon's record: over thirty. So who's right...",
    description: 'Anime-noir split dossier comparison: FBI Statement (3 SEC) vs Pentagon Record (30+ SEC) with HIT at 44.09s and ON-SCREEN TEXT.',
  },
  {
    id: 'S19-LoopPullbackToFrameZero',
    index: 19,
    startSec: 47.45,
    endSec: 51.0,
    startFrame: 1424,
    endFrame: 1530,
    durationInFrames: 106,
    scriptContext: '...the Pentagon, or the two federal agents?',
    description: 'Camera pulls back from high canyon/pentagon-emblem framing to arrive at the exact Frame 0 geometry (triangle rising over ridge + two agents) for a 100% seamless loop.',
  },
];
