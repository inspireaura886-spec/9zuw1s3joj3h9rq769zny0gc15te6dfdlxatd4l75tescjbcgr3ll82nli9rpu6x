# PAPERCUT kit (look "papercut", built + approved 2026-10-30)

2.5D paper-cutout / archival collage look for whole IA Shorts. Every layer is a torn-edge paper cut-out (canvas-drawn shape,
pale torn core rim, fibre grain, sheen) standing in real 3D space and lit by ONE moving shadow spot, so cut-outs throw real soft
shadows on the layers behind. Elements move in 12 fps stop-motion steps with paper "boil"; the camera moves smoothly (true parallax).
Archival photos become taped, sepia-graded cut-outs; case-board pieces (clippings, typed notes, pins, red string) are built in.
Pure functions of the frame. Not to be confused with the 2D `PaperCollage` interstitial in lowpoly/kit/styles (other task):
this is a full 3D look for a whole Short.

Demo: `src/papercut/demo/` (comp `PaperDemo`, 240 f): night-sea collage (stars, moon, drifting clouds, ridges, lighthouse with a
sweeping LightCone, 3 bobbing wave layers, boat, grass) then a case board (photo, clippings slapping in, note, pins, red string
drawing itself, swinging lamp moving every shadow, falling paper flecks). MP4 `reels/bench/looks/paper_demo.mp4`, contact sheet
`reels/bench/looks/paper_contact.jpg`.

## Use in a Short
```jsx
import {PAPER, usePaperFonts, usePaperImages, CutLayer, SHAPES, PhotoCut, Clipping, Note, Pin, RedString, Board, PaperStage, PaperFinish, PaperTitle, PaperGlow} from '../../../papercut/PaperKit.jsx';
const fonts = usePaperFonts(); const imgs = usePaperImages(['flannan/IMG1.jpg']);   // at comp root; render scenes only when both true
<PaperStage keyPos={(f)=>[-9+f*0.05,10,10]} keyTarget={[0,2,-8]} overlay={<><PaperTitle lines={[{text:'3 KEEPERS VANISHED.'},{text:'One left his coat.', red:true, at:16}]} /><PaperFinish /></>}>
  <ShotCam preset="push" from={[3.6,3.4,15.5]} to={[-0.9,2.6,9.6]} look={[[0,2.9,-8],[-1.1,3.3,-8]]} start={0} end={125} />
  <CutLayer shape="ridge" opts={{base:0.5, amp:0.4}} size={[44,9]} position={[0,1.2,-12]} color={PAPER.ridge} seed={5} frame={f} />
  <CutLayer shape="waves" size={[34,4]} position={[0,-0.6,-4]} color={PAPER.sea2} frame={f} bob={0.12} />
  <PhotoCut src="flannan/IMG1.jpg" size={[3,4]} position={[-1.2,1.5,0.06]} frame={f} />
</PaperStage>
```
| export | what |
|---|---|
| `PaperStage` | CSS backdrop + ThreeCanvas with shadows; warm ambient + ONE moving key spot (`keyPos`/`keyTarget` may be fns of frame) |
| `CutLayer` | one cut-out plane. `shape` = SHAPES key or your own `(g,w,h,r,opts)=>fill` fn; `bob`/`sway`/`drift`/`wrapX` stop-motion at 12 fps; `emissive` for moon/windows; `details(g,w,h,r)` paints on top (source-atop) |
| `SHAPES` | ridge, pines, moon, cloud, waves, lighthouse, figure, boat, rect, grass (add more: any canvas fill) |
| `PhotoCut` | public image as torn, taped, sepia photo (preload with `usePaperImages`) |
| `Clipping` | newspaper clipping: masthead, date, headline, grey text bars (never invented body text), optional red circle |
| `Note`, `Pin`, `RedString` (draws on over `start..start+len`), `Board` (cork) | case-board pieces |
| `PaperTitle` | headline lines on torn paper strips that slap in on 12 fps steps (red strip = DM Serif italic accent) |
| `PaperFinish` | paper grain (multiply), warm vignette, 12 fps exposure flutter, specks, light leak |
| `PaperGlow` | additive glow sprite (moon, lantern) |

## Measured (2026-10-30, 2 CPU arm64, lavapipe Vulkan, 1080x1920, CONC=1, JPEG q95)
- Heaviest stills (f0 first frame builds all canvas textures; sea f20/f110; board f160/f235): 7.1-12.4 s wall incl. browser start, peak tree RAM 929-1007 MiB, 0 crashes.
- 30-frame chunks: sea f60-89 40.1 s = 1.34 s/frame wall (~1.13 excl. start, includes the first-frame texture build), 987 MiB; board f180-209 30.8 s = 1.03 s/frame (~0.83), 1019 MiB. 0 crashes.
- Full 240 f demo in 5 foreground chunks, 0 crashes. Motion: 87 % of frame pairs change > 0.5 (stop-motion holds every other frame by design; camera never stops).

## Rules / gotchas
- Fonts/images must be loaded before any canvas texture is drawn: mount scenes only when `usePaperFonts()` and `usePaperImages()` are both true (else the first frames draw fallback fonts and the cache keeps them).
- Canvas textures are cached by key; keep `px` <= 2048 per side (RAM). Typical Short: <= 25 cut layers per scene.
- One shadow spot per scene (the look depends on it); `ambient` 0.4-0.6. Layers 1.5-3 units apart in z give visible parallax + shadows.
- Board scenes: keep pinned items within about x -3..3 so the push-in does not crop them (demo crops the right clipping a little).
- Clippings: headline/date must be real and sourced (archival style is not a licence to invent quotes); body copy stays grey bars.
- Frame-0 claim: open on the impossible thing large (the empty lighthouse lit, the photo with the circled number), title strip at frame 0.
