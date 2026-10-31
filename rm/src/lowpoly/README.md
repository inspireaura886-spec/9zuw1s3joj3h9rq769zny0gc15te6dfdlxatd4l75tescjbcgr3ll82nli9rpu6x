# Low-poly 3D scene kit (Remotion + three.js)

Flat-shaded "toy diorama" look for Shorts: low-poly terrain, CSS sky gradients, box houses with pitched roofs and window
rectangles, round huts, blocky people / ghosts / cows, motorcycles and cars, water, gas/smoke clouds, fountains, rain,
cutaway diagrams, keyframed cameras, and the caption layer (yellow one-word pops, top headline cards, date/place pills).
Built 2026-10-15 for the Lake Nyos test Short (stories/nyos). Everything renders headless on this aarch64 2-CPU box.

## Install (already done in reels/remotion)
`npm i @remotion/three@<same as remotion> three@0.169.0 @react-three/fiber@8.17.10` (React 18 => fiber v8).
Fonts (OFL) in public/fonts: LilitaOne-Regular.ttf (headlines/pills), Fredoka-Variable.ttf (captions).

## Render
```
cd reels/remotion
npx remotion bundle src/lowpoly/index.jsx --out-dir /tmp/lpb          # ~15 s, once per code change
npx remotion still  /tmp/lpb Nyos /tmp/f.png --frame=500 --gl=swangle  # QA still, ~4-5 s incl. browser start
npx remotion render /tmp/lpb Nyos out.mp4 --gl=swangle --concurrency=2 --codec=h264 --crf=16 --muted
```
`--gl=swangle` (SwiftShader via ANGLE, software WebGL) works; no GPU needed. Mux audio afterwards with ffmpeg.

## Kit (src/lowpoly/kit, import from '../../kit/index.js')
| file | exports |
|---|---|
| Stage.jsx | `<Stage palette fog overlay background>` = sky gradient + transparent ThreeCanvas + lights + DOM overlay. One per shot. |
| Sky.jsx | `PALETTES` (day, dusk, night, dawn, blueprint), `mixPalette`, `SkyGradient`, `Lights`, `Stars`, `Orb` (moon/sun) |
| Terrain.jsx | `makeHeight({seed,amp,freq,shape})` height fn (shape carves craters/valleys), `<Terrain height colorFn bands tint>` flat-shaded jittered mesh |
| Building.jsx | `Building` (box + pitched roof + windows, `lit` 0..1 night windows), `RoundHut`, `Tree` (round/pine), `Fence` |
| Characters.jsx | `Person` (pose stand/walk/lie/sit/ride, `phase` walk cycle, eyes), `Ghost` (translucent, bobbing), `Cow` (standing/lying) |
| Vehicles.jsx | `Motorcycle` (with rider), `Car` (sedan/pickup), `Raft`; wheels spin from `dist` |
| Effects.jsx | `Water` (low-poly rippling disc/plane, animatable colour), `PuffCloud` (gas/smoke that flows along a path and hugs the ground), `Fountain` (eruption / jet), `Bubbles`, `Rain`, `Road` (dirt strip along a centre-line) |
| CameraRig.jsx | `<CameraRig keys=[{f,pos,look,fov}]>` eased dolly, or `orbit={{center,radius,height,from,to,start,end}}`, optional `shake` |
| Overlay.jsx | `FontFaces`, `WordCaption` (one-word pop from vo.json words), `Headline` (stacked all-caps lines, white/yellow/green/red), `Pill` (date/place tag; red = rotated stamp), `Finish` (vignette + grain), `Dip`, `EndCard` (IA @ia.unfolds + sources) |
| noise.js | deterministic `fbm`, `rng`, easing helpers (no Math.random => no flicker between frames) |

## Making a new Short (about 2-3 h of agent time)
1. Case dir with case.json + vo.json from the scary-reels pipeline (`vo.py` gives word timings).
2. Copy `stories/nyos/` to `stories/<slug>/`: `world.jsx` = height function + set dressing; `<Slug>.jsx` = one component per
   scene (cut on line starts from vo.json), each a `<Stage>` with a `<CameraRig>`, the world, and overlay cards.
3. Register it in `src/lowpoly/index.jsx`, bundle, render QA stills, fix, full render, mux audio.
Rules that matter: keep headlines between y 230-620 and captions at y ~1310 (Shorts UI safe zone); keep everything
deterministic (use `rng(seed)`, never Math.random); objects inside an extruded cutaway must sit on its front face (z) or
they are hidden; avoid `-x ** 2` (esbuild error) - write `-(x ** 2)`.

## Speed on this box (2 aarch64 CPUs, swangle)
Nyos (2199 frames, 12 scenes): 0.47 s/frame wall with --concurrency=2 (~17.5 min total, 11 chunks of 200 frames at 71-117 s each). QA stills ~4-5 s each incl. browser start. Bundle ~15 s. CRF 16 gave only ~4 Mbps on flat-shaded frames; render_chunks.sh now defaults to CRF 12 so masters land closer to the channel full-quality rule.

## ANIMATION UPGRADE 2026-10-22 ("superb" mode) - new kit parts
Research, swangle measurements and sources: ANIMATION_UPGRADE_2026-10-22.md. Showcase: stories/kit-demo (`KitDemo`, entry stories/kit-demo/entry.jsx; render out/2026-10-22_kit-demo_animation-upgrade.mp4). Bench harness: fxtest/ (FxTest, `variant` prop).
All frame-driven and deterministic. Costs are extra wall time per frame at 1080x1920, --concurrency=2, swangle.
| file | export | one-line usage | cost |
|---|---|---|---|
| Post.jsx | `Post` | `<Post bloom={1.1} threshold={0.5} vignette={0.45} />` LAST child inside `<Stage>`: real bloom (windows, fire, beams, foam glow) + vignette + FXAA. `aa`: 'fxaa' (default) / 'none' / 'smaa' (slow) / 'msaa' (slow). `ca={0.0015}` = chromatic aberration on impact shots | +0.38 s/f (bloom+vig 0.22, FXAA 0.16) |
| Toon.jsx | `toonGradient`, `ToonMat`, `ToonMesh`, `OutlineScope`, `ink` | `<OutlineScope thickness={0.03}>...people...</OutlineScope>` ink outlines on every kit Box (Person/Cow) inside; `<ToonMesh type="ico" args={[1,0]} color="#ff5a4e" outline={0.05} />` cel-shaded prop with outline | ~0.04 s/f per figure |
| Particles.jsx | `Particles` | `<Particles kind="embers" center={[0,0.3,0]} area={[2,7,2]} count={60} frame={f} />` kinds embers / sparks / dust / snow / ash / spray / motes (wraps, never empties) | small |
| Particles.jsx | `Burst` | `<Burst kind="debris" position={[0,1,0]} start={34} frame={f} count={36} floorY={0} />` one-shot ballistic sparks / debris / splash / embers | small |
| Particles.jsx | `Shockwave` | `<Shockwave position={[0,0.1,0]} start={34} frame={f} radius={7} />` 3 rings (wide-faint, mid, thin-bright) | ~0 |
| Light.jsx | `LightCone` | `<LightCone position={[0,6,0]} dir={[1,-0.12,0]} length={34} radius={5} frame={f} />` soft volumetric beam (lighthouse, torch, UFO, searchlight); animate `dir` to sweep | small |
| Light.jsx | `GodRays` | `<GodRays position={[-5,10,-9]} dir={[0.3,-1,0.55]} length={15} count={6} frame={f} />` 5-7 fanned soft shafts + core + dust motes. Keep the origin INSIDE the frame | small |
| Light.jsx | `FogLayer` | `<FogLayer y={0.2} size={70} layers={4} thickness={1.6} opacity={0.15} frame={f} />` drifting mist / cloud sea sheets | ~0.2 s/f when full-frame: max 2-3 shots |
| Light.jsx | `ContactShadow` | `<ContactShadow position={[x, y+0.02, z]} radius={0.8} />` (Person has `shadow` prop) | ~0 |
| Sea.jsx | `Ocean`, `seaHeight` | `<Ocean size={[110,70]} frame={f} amp={0.8} choppy={1.4} foamAt={0.86} groundFn={height} />` flat-shaded swell, foam crests, shore foam band. foamAt >= 0.8 or it turns white | ~0.05 s/f at seg 60 |
| Sea.jsx | `BreakingWave` | `<BreakingWave position={[-5,-0.4,8]} rotation={[0,Math.PI,0]} width={22} height={4.6} t={interpolate(f,[0,60],[0.25,1])} frame={f} />` curling barrel that peels along x, lip spray, whitewater on impact. Travels +z locally (rotate to aim at the cliff); film it from the SIDE (camera angle ~1.2 rad) or the curl is invisible | small |
| Rock.jsx | `Rock` | `<Rock position={[2,0,1]} size={1.2} seed={4} color="#8a6a4a" moss="#7a9a3a" />` lumpy flat-shaded rock with face colour variation | ~0 |
| Rock.jsx | `Cliff` | `<Cliff footprint="wall" width={46} height={13} depth={14} layers={8} seed={7} />` or `footprint="island" radius={6}`: strata bands, ledges, overhangs, cracks, grass/snow cap, boulders at the foot | ~0 |
| Camera.jsx | `ShotCam`, `shotPose` | `<ShotCam preset="crane" target={[0,2,0]} h0={1} h1={12} r0={16} r1={30} angle={1.2} start={0} end={66} />` presets push / crane / orbit / dollyZoom / whip / track; `ease`: inout / ramp (speed ramp) / out / linear; `shake` like CameraRig | 0 |
| Characters.jsx | `Person` new poses | `<Person pose="recoil" actT={t} shadow prop="lantern" />` poses run / point / recoil / dig / climb / crouch / cower / lookup / carry (actT 0..1 eases into point/recoil/lookup); props lantern / torch / shovel / book / camera; head pitch + run head-bob + squash = secondary motion | 0 |
| Fx2D.jsx | `Grade` | `<Grade look="night" />` in the Stage overlay: one look per Short (tealOrange, cold, warm, horror, night, golden) | ~0 |
| Fx2D.jsx | `Flash` | `<Flash at={34} y="58%" max={0.7} />` impact bloom, screen blend, never a full white frame | ~0 |
| Fx2D.jsx | `WhipStreaks` | `<WhipStreaks from={0} to={10} dir="h" />` speed lines over a whip pan | ~0 |
| Fx2D.jsx | `MotionBlur` | `<Sequence ... durationInFrames={10}><MotionBlur samples={4}><Shot/></MotionBlur></Sequence>` real sub-frame motion blur | ~3 s/f: whips/crashes of <= 10 frames only |
| Fx2D.jsx | `LightLeak` | `<LightLeak from={0} len={45} />` warm flare sweep (golden hour, scene openers) | ~0 |
| tools/cut_sfx.py | SFX layer | case dir: write sfx.json `[{"t": cut_s, "kind": "whoosh"}, {"t": hit_s, "kind": "impact"}]`, run `python3 ../../../tools/cut_sfx.py sfx.json raw/sfx.wav <dur>` (after `source P/env.sh`); mix_story_audio.py mixes raw/sfx.wav automatically when present | 0 render |
Rejected under swangle: DepthOfField (3.6 s/f), SMAA (+0.41 s/f), drei Outlines (invisible here), drei Sparkles/Cloud/Float (clock-driven, not deterministic).
Gotchas: FogLayer sheets are flat planes - on hilly terrain they slice through the hills and draw visible curved seams: use them over sea, flat moor, valleys or a cloud sea below a peak, or raise them above the ground. pointLight `distance` cut-offs (Campfire, lantern) draw faint circles on big flat-shaded ground under bloom: keep the camera from framing a lot of flat ground right around a fire. Keep `Post` the last 3D child; `Sequence` inside a ThreeCanvas needs layout="none"; never put Math.random/Date in a component;
bright = glows (bloom threshold 0.4-0.6), so keep big white areas (foam, snow caps, sky-lit walls) below the threshold or raise it.

## AYGRAMM TECHNIQUES (2026-10-23)
- `KineticCard` + `cueLine(words, text, fromSec, accent)` (kit/KineticCard.jsx): bold Lilita caps + one DM Serif Display italic accent word + corner brackets; each word appears only when the voice says it. `cueLine` throws if the text doesn't match vo.json, so times are never typed by hand.
- `WordCaption` no longer shows a word 0.04 s early.
- Audio/QA tools in reels/tools: word_sfx.py (30-50 word-cued SFX), music_drop.py (BPM + drop -> reveal), master_check.py (loudnorm verify), prerender_check.py (draft stills + contrast/overlap/timing). Rules: top of reels/REEL_RULES.md.

## GITGEMS PACK (adopted 2026-10-24, from reels/refs/gitgems/FINDINGS_2026-10-24.md)
- kit/glb.js: `usePreload([...glb paths])` (render ThreeCanvas only when ready), `Prop path=... position scale`, `Rigged path="blocky/character-x.glb" time={t} clips={[{name,from,loop}]} scale={0.42}` (Kenney Blocky Characters, CC0, 18 skins x 27 animations) - REPLACES hand-built Person figures.
- kit/camPath.js: `CamPath frame start end points looks fov roll` spline camera, one per scene; end >= 2.5 units behind the hero.
- kit/remap.js: `timeRemap(frame, fps, segs)` speed ramps; freeze 4-6 frames on each reveal hit, 0.3x on an apex.
- public/blocky, public/graveyard (CC0 Kenney, licence public/KENNEY_CC0_License.txt); City/Nature/Pirate zips in reels/refs/gitgems/assets/zips (unzip Models/GLB format to public/<kit>/ when needed).
- Sample scene: stories/gitgems-sample/Graveyard.jsx. Point lights >= 0.8 units from skin.

## NEW ANIMATION STYLES 2026-10-30
9 reusable style scenes (route-globe, blueprint-xray, pov-walk, tilt-shift, found-footage, shadow-puppet, particle-figure, timeline-clock, face-closeup) in kit/styles/, exported from kit/index.js. Docs, usage and measured cost: STYLES.md. Pick per Short with R/tools/style_next.py.
