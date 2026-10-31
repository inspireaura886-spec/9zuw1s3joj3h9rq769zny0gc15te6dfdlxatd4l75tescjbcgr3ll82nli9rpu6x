# NOIR kit (look "noir", built + approved 2026-10-30)

Shadow / silhouette look for whole IA Shorts: black rim-lit figures, sodium-amber and cold-blue volumetric light, fog walls,
rain with splash rings, venetian-blind light sheets, swinging bulbs, headlight sweeps, city blocks whose windows die.
Everything is a pure function of the frame (no Math.random, no clocks). Re-uses lowpoly/kit (ShotCam, Post, Particles,
LightCone, FogLayer, GrabProp) so Grab3D props and the camera presets work here too.

Demo: `src/noir/demo/` (comp `NoirDemo`, 240 f): rainy street push-in to a walking silhouette, then an office lit through blinds
with a swinging bulb that dies. MP4 `reels/bench/looks/noir_demo.mp4`, contact sheet `reels/bench/looks/noir_contact.jpg`.

## Use in a Short
```jsx
import {NOIR, NoirStage, Silhouette, Streetlamp, Blinds, BlindsFloor, NoirRain, CityRow, NoirCar, HangingBulb, FogWall, WetStreet, NoirFinish, NoirTitle, NoirFonts, flicker} from '../../../noir/NoirKit.jsx';
import {ShotCam, Post, Particles} from '../../kit/index.js';   // from a story under src/lowpoly/stories/<slug>/
<NoirFonts />                                   // once at comp root (Lilita, DM Serif italic, Special Elite)
<NoirStage density={0.03} overlay={<><NoirTitle lines={[{text:'1 WITNESS.'},{text:'0 FOOTPRINTS.', red:true, at:12}]} /><WordCaption .../><NoirFinish /></>}>
  <ShotCam preset="push" from={[2.6,8.5,7]} to={[0.9,1.25,1.5]} look={[[0,0.5,-16],[0,1.7,-8]]} start={0} end={130} ease="out" />
  <WetStreet /> <CityRow side={-1} x={-6} frame={f} offAt={70} /> <Streetlamp position={[-3.6,0,-6]} frame={f} light />
  <Silhouette position={[0,0,z]} pose="walk" phase={f*0.2} rim={NOIR.sodium} rimK={1.1} />
  <NoirRain center={[0,0,-10]} frame={f} /> <FogWall position={[0,3,-36]} frame={f} />
  <Post bloom={1.25} threshold={0.42} vignette={0.5} />   // LAST 3D child
</NoirStage>
```
| export | what |
|---|---|
| `NoirStage` | dark CSS backdrop + ThreeCanvas (exp fog `density`, faint cold ambient) + DOM overlay; 1 px projector gate weave |
| `Silhouette` | coat + fedora figure, black body + fresnel rim (`rim`, `rimK` 1.0-1.3 looks best; higher = cartoon glow). poses walk / stand / turn / raise, `skirt`, `hat=false` |
| `Streetlamp` | pole + hood + LightCone + glow + ground pool; `flick`, `dropout` (dying lamp), `light` = real spot (max 1-2 per shot) |
| `Blinds` + `BlindsFloor` | slatted window with light sheets along `dir`, striped floor patch. Put the camera across the room looking at the window with a silhouette in front = the money shot |
| `NoirRain` | instanced rain (1 draw call) + splash rings |
| `CityRow` | building row with instanced lit windows; `offAt`/`offRate` kills windows one by one |
| `NoirCar` | car silhouette + headlight cones + tail glows; animate `position` |
| `HangingBulb` | swinging bulb + cone + point light; `dieAt` pops it out |
| `FogWall` | backlit drifting mist behind figures |
| `WetStreet` | dark glossy street + kerbs |
| `NoirFinish` | grain, vignette, exposure flicker, faint scratches/specks, split tone (CSS, ~0 cost) |
| `NoirTitle` | white Lilita caps + red DM Serif italic accent line, typewriter sub-line |
| `flicker(frame, seed, depth, dropout)` | deterministic light flicker 0..1 |

## Measured (2026-10-30, 2 CPU arm64, lavapipe Vulkan via tools/gl_flags.sh, 1080x1920, CONC=1, JPEG q95)
- Heaviest stills (street f40/f100 rain+4 lamps+3 city rows+car; office f230 with 2 Grab3D props): 6.0-10.1 s wall incl. browser start, peak tree RAM 883-908 MiB, 0 crashes.
- 30-frame chunks: street f60-89 35.6 s = 1.19 s/frame wall (~0.99 excl. ~6 s start), 947 MiB; office f180-209 33.1 s = 1.10 s/frame (~0.90), 951 MiB. 0 crashes.
- Full 240 f demo rendered in 5 foreground chunks, 0 crashes. Motion: 100 % of frame pairs change (median diff 3.75).

## Rules / gotchas
- Weight caps from FACTORY.md CRASH-PROOF still apply: per shot max 3 real lights (Streetlamp light + HangingBulb point count), NoirRain <= 800, 1 FogLayer, Post bloom+FXAA only.
- Never put a kit FogLayer sheet at figure height (it slices the figure into a light/dark seam); keep it at y <= 0.2 or above 2.5.
- Kit Particles dust near the camera turns into big hexagons: size 0.012-0.02 and keep the box away from the lens.
- Frame-0 claim still applies: open on the subject large and mid-event (silhouette in the light, the object in the beam), not on an empty street.
- Captions: WordCaption (lowpoly kit) at y ~1310 works on the dark frames; keep NoirTitle at y 230-620.
