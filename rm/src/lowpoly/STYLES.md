# NEW ANIMATION STYLES (2026-10-30, user: "gimme some new kinds of animations in between them also")

Nine reusable full-frame scene components for 1080x1920 Shorts, each usable as a 2-4 s **interstitial** between 3D scenes or as a
5-8 s **full scene**. Code: `kit/styles/` (exported from `kit/index.js`, so `import {RouteGlobe, ...} from '../../kit/index.js'`).
Status + cost registry: `kit/styles/registry.json` (read by `R/tools/style_next.py`). Every frame is a pure function of the frame
number (no clocks, no Math.random). All free / own code; the only new data is the Natural Earth 110m land mask (public domain).

Each component reads `useCurrentFrame()`, so put it in a `<Sequence from={...} durationInFrames={dur}>` and pass the same `dur`.
Put `<FontFaces />` once at the comp root (already there in every story) and your own `WordCaption` on top as usual.

## Measured cost (2026-10-30 22:50-23:00 IST, lavapipe Vulkan, CONC=1, JPEG q95, 1080x1920; box shared with a TTS job, load ~1.2-2.3)
s/frame = 30-frame chunk wall / 30, INCLUDING ~5-6 s browser start (so the pure per-frame cost is ~0.2 s lower). RAM = peak summed RSS of the whole render process tree (bench/tree_time.py). 0 crashes in 9 stills + 10 chunks.

| id | style (slug) | component | heaviest-frame still | 30-frame chunk | s/frame | peak RAM | status |
|---|---|---|---|---|---|---|---|
| a | route-globe | `RouteGlobe` | f80 5.3 s (cold 9.1-11.6 s), 843 MiB | f50-79 27.7 s | 0.92 | 907 MiB | approved |
| b | blueprint-xray | `BlueprintXray` | f75 5.0 s (cold 10.4 s), 784 MiB | f50-79 35.8 s | 1.19 | 879 MiB | approved |
| c | pov-walk | `PovWalk` | f62 7.6 s, 968 MiB | f50-79 30.8 s | 1.03 | 1130 MiB | approved |
| d | tilt-shift | `TiltShift` | f60 8.6 s, 861 MiB | f40-69 40.4 s | 1.35 | 934 MiB | approved |
| e | found-footage | `FoundFootage` / `PaperCollage` / `VhsOverlay` | f40 5.3 s, 573 MiB | f40-69 51.7 s | 1.72 | 661 MiB | approved (v2) |
| f | shadow-puppet | `ShadowPuppet` | f85 7.3 s, 687 MiB | f60-89 32.3 s | 1.08 | 738 MiB | approved |
| g | particle-figure | `ParticleFigure` | f60 5.6 s, 776 MiB | f45-74 20.2 s | 0.67 | 858 MiB | approved |
| h | timeline-clock | `TimelineClock` | f80 4.5 s, 552 MiB | f60-89 15.2 s | 0.50 | 616 MiB | approved |
| i | face-closeup | `FaceCloseUp` | f50 5.0 s, 812 MiB | f40-69 28.3 s | 0.94 | 867 MiB | approved |

Retests / caveats: route-globe's FIRST chunk ran 71.9 s (2.40 s/f) while the box was loaded right before a sandbox restart; the rerun on
the fresh box was 27.7 s, so 0.92 is the number to plan with but expect up to ~2x on a busy box. found-footage v1 (per-frame SVG
feTurbulence noise + blend modes) was 2.30 s/f -> simplified once (static noise PNGs in public/styles/, no blend modes on noise,
flat clipping shadows) -> 1.72 s/f. The 2D DOM styles are NOT free: Chrome rasterises every layer per frame in software.
A sandbox restart happened at ~22:49 IST during the blueprint-xray chunk (uptime reset, /tmp + apt packages gone); peak RAM was
< 0.9 GB so it is not attributed to the render, but cause unknown. After a restart: reinstall lavapipe (FACTORY.md GRAB3D GOTCHAS)
and rebundle (cold bundle of this entry ~100 s).

Test comps: `stories/styles-demo/entry.jsx` -> `StylesDemo` (all 9, 105 f each = 945 f) and `StyleA`..`StyleI` (one each, 105 f).
Bundle: `npx remotion bundle src/lowpoly/stories/styles-demo/entry.jsx --out-dir /tmp/stb`. Stills: `R/bench/stills/styles_<slug>.jpg`
(f25 + heaviest frame side by side) and `styles_contact.jpg` (all 9).

## The styles

### a. route-globe - `RouteGlobe`
Low-poly globe (33.6k flat faces) coloured by the REAL Natural Earth 110m land mask (`kit/styles/landmask.js`), great-circle arcs drawn
leg by leg, pins pop with a pulse ring, the globe turns to keep the travelling head centred, auto-zoom from the whole globe to the
route's region, stop label + red date stamp (DOM). Cap-safe: 3 lights, bloom+FXAA.
```jsx
<Sequence from={s} durationInFrames={90}><RouteGlobe dur={90} title="USS CYCLOPS, 1918"
  stops={[{lat: -22.9, lon: -43.2, label: 'RIO DE JANEIRO', date: 'FEB 1918'}, {lat: 13.1, lon: -59.6, label: 'BARBADOS', date: '4 MAR 1918'},
          {lat: 39.29, lon: -76.61, label: 'BALTIMORE?', date: 'NEVER ARRIVED'}]} /></Sequence>
```
Props: `stops` [{lat, lon, label, date}], `dur`, `title`, `zoom` [start, end] (auto if omitted), `lift` (arc height), `colors` {sea, land, land2, ice}, `palette`.
Fits: voyages, flights, train trips, vanishings with a known last route, sky-object tracks between towns. Stops/dates must come from sources.txt.
Short routes (< ~5 deg) zoom to a ~50 deg region, so the arc is small: still reads as "where", not as a street map.

### b. blueprint-xray - `BlueprintXray`
Blueprint grid, the object's edges draw in bottom-up as glowing struts with a bright drawing head, then a scan plane rises and the solid
flat-shaded body fills in below it (clipping plane), slow orbit, FIG counter + % HUD. Default `parts` = lighthouse + keeper's cottage
(`LIGHTHOUSE_PARTS`); pass your own: `{type: 'box'|'cyl'|'cone'|'roof', args, position, rotation, color}`.
```jsx
<BlueprintXray dur={90} parts={MY_SHIP_PARTS} target={[0, 2, 0]} radius={20} label="THE CYCLOPS" />
```
Fits: lighthouses (Flannan), ships (Cyclops, Mary Celeste), craft (Kecksburg acorn), buildings, machines/inventions (Le Prince camera).
Keep parts <= ~20 (each adds ~12-30 strut meshes).

### c. pov-walk - `PovWalk`
First-person walk into a haunted room: head-bob steps, look left (photo wall) -> right (cracked mirror) -> centre, handheld flashlight
(the scene's 1 shadow light) with hand jitter, flickering bulb that blacks out at ~80 %, and the mannequin is suddenly 0.8 m in front
when the light returns. Grab3D set `POV_SET`: 8 instances, 2 big, 113k tris, 8 GLBs (inside the cap), 220 dust motes, 3 lights.
```jsx
<PovWalk dur={105} palette="ia-dark" label="ROOM 3 · 01:12" />   // palette = any recoloured Grab3D folder (ia-sepia, a Short's own palette.json)
```
Preloads its own GLBs (`usePreload(POV_PATHS(palette))`). Fits: haunted houses, asylums/hospitals, nurseries, a witness's bedroom.
The jump (mannequin closer) is a scare beat: use it on a reveal line, not as decoration. Run `recolor_props.mjs --only` for the 8 names first if you use a new palette.

### d. tilt-shift - `TiltShift`
Top-down miniature: high camera + 17 deg lens, slow drift, saturated toy grade, blurred top/bottom bands (CSS backdrop-filter + gradient
mask = fake DOF, no 3D DOF pass), stop-motion time (`step`=2). Default scene `VillageDiorama` (5 houses, trees, fences, 4 walkers, a car);
pass `children` to film any diorama (your story's world) in this look.
```jsx
<TiltShift dur={90} label="WOOLPIT, 12TH CENTURY">{/* optional: your own 3D set */}</TiltShift>
```
Props: `target`, `dist`, `angle`, `step`, `blur` (px), `band` (% of frame blurred each side), `sky`. Fits: villages, mass events, crowds,
farms, "the whole town saw it". Cost grows with the blur area: keep `band` <= 30.

### e. found-footage - `FoundFootage`, `PaperCollage`, `VhsOverlay`
`VhsOverlay` = CRT/VHS layer over ANY scene (scanlines, rolling tracking bar, chroma fringe, noise, PLAY/PAUSE or blinking REC, timecode +
date stamp, tracking tear at `glitchAt`). `PaperCollage` = aged newspaper sheets and photos drifting at different depths (parallax),
sliding in one by one, slow push. `FoundFootage` = collage -> VHS tear at mid -> hero photo as a paused tape frame.
```jsx
<FoundFootage dur={105} images={['leprince/IMG1.jpg', 'leprince/IMG2.jpg']} headlines={['REAL HEADLINE 1', 'REAL HEADLINE 2']} hero="leprince/IMG2.jpg" stamp="SEP 16 1890" />
<AbsoluteFill><MyScene /><VhsOverlay stamp="NOV 22 1987" rec glitchAt={40} /></AbsoluteFill>   // VHS over a 3D scene
```
HONESTY: headlines are drawn as newspaper headlines, so only real, sourced headlines (or neutral labels like a date/place); body copy is
grey bars, never invented readable text; images must be public-domain/own (log them in the case source log). Fits: broadcast/signal
intrusions (Max Headroom-type), archive-heavy cases, 1890-1990 press stories. 1.72 s/f: use as a 2-3 s interstitial, not a long scene.

### f. shadow-puppet - `ShadowPuppet`
Backlit paper screen (warm lamp hotspot that drifts and flickers, fibre texture), jointed black silhouettes on visible rods
(poses walk / stand / point / reach / fall, optional top hat or dress), set pieces moon / house (lit windows) / tree / lamppost / gate /
train (rolling, smoke). 2D SVG.
```jsx
<ShadowPuppet dur={90} set={['moon', 'tree', 'train']} label="He boarded the train..."
  actors={[{x0: 160, x1: 640, pose: 'walk', hat: true, to: 70, then: {at: 70, pose: 'reach'}}, {x0: 900, x1: 900, pose: 'stand', dress: true, flip: true}]} />
```
Fits: legends and folklore, medieval/old cases (Woolpit), reenacting a witness account without showing faces. Figures are deliberately
simple; one or two actors read best.

### g. particle-figure - `ParticleFigure`
Up to 400 glowing points (one THREE.Points draw call; CRASH-PROOF cap, raise only after a still test) fly in from a scattered cloud,
assemble bottom-up with overshoot into a figure, shimmer, then blow away on the wind. `shape`: 'person' | 'creature' (tall, thin, long
arms, two eyes) | 'ufo', or `targets` [[x,y,z],...].
```jsx
<ParticleFigure dur={90} shape="person" color="#9fe8ff" label="NEVER SEEN AGAIN" assemble={[0.05, 0.5]} disperse={0.78} />
```
Fits: vanished people (the person dissolving), apparitions, creature sightings (Flatwoods, Mothman), UFOs. Cheapest 3D style (0.67 s/f).

### h. timeline-clock - `TimelineClock`
Split screen: top = analog clock + digital readout racing `from` -> `to` (or a `countdown` in seconds), ticking second hand, red alarm
pulse in the last 15 %; bottom = timeline that scrolls to each event, cards pop with date + 2-4 word label, faint giant date behind.
```jsx
<TimelineClock dur={90} from="21:00" to="23:58" events={[{date: '4 MAR 1918', label: 'LEAVES BARBADOS'}, {date: '13 MAR 1918', label: 'DUE IN BALTIMORE'}]} />
<TimelineClock dur={60} countdown={180} events={[...]} />
```
Fits: "in X hours/minutes" stories, signal cases, multi-year sagas. Cheapest overall (0.50 s/f). Times/dates must be sourced.
Text sits at y 900-1300 (cards ~1030-1160): keep the Short's WordCaption at its usual ~1300 or hide it for this beat.

### i. face-closeup - `FaceCloseUp`
Low-poly head close-up: sculpted flat-shaded head, eyes with deterministic saccades (gaze jumps every 22 f), eyelid blinks every
~2.5-4 s, brows, mouth flaps driven by vo.json word timing (`mouthAt(words, t)`, syllable-ish), slight head sway, key/fill/coloured rim.
`expr="fear"` widens the eyes and lifts the brows.
```jsx
<Sequence from={s} durationInFrames={90}><FaceCloseUp dur={90} words={vo.words} offsetSec={s / 30} expr="fear" skin="#c79a7a" hair="#2a1d16" /></Sequence>
```
`words` = the case vo.json word list `[[w, start, end], ...]` (same as WordCaption); without it the mouth stays shut (or `demoTalk`).
Fits: a witness/keeper/pilot "speaking" a sourced quote line, the narrator-witness beat, fear reaction shots. Never put invented words in a
real person's mouth: mouth flaps only on narration or on a quote that is real and sourced (and the face is generic, not a likeness).

## Rules (FACTORY.md "NEW ANIMATION STYLES 2026-10-30")
- Every new Short: 1-2 approved styles, picked with `python3 tools/style_next.py <topic words>` at stage 3 and logged at once with
  `python3 tools/style_next.py log <slug> <main>[,<second>] <scene_ids>` (STYLE_ROTATION.csv). Never the same MAIN style as the previous Short.
- Styles obey the scene-weight caps (each is built inside them), stills-first + one final render, safe zones, frame-0 claim.
- Compare later: join STYLE_ROTATION.csv with Studio retention per Short (one variable at a time; swings < ~20 points are noise).
