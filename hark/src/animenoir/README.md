# ANIME-NOIR kit (look "anime-noir", built 2026-10-31 for pursue-07-triangle)

Cel-shaded 2D/2.5D anime look made only of SVG + CSS (no WebGL, no three.js): ink outlines, flat cel colour + one hard shadow
tone, warm rim light from the key side, painted gradient dusk/morning skies, parallax layers under a moving camera, animated
faces (blink, head turn/tilt, eyes widening, mouth/talk, breath, sweat drop), running/walking figures, haze motes, grain +
light-leak flashes on cuts. Everything is a pure function of the frame. First Short: `src/lowpoly/stories/pursue-07-triangle/Tri.jsx` (comp TRI).

## Use
```jsx
import {AN, Cam, Layer, Svg, DuskSky, Ridge, Triangle, Agent, Figure, ObsPost, Shrub, Motes, Haze, AnimeFinish, RecTag, Slam, QuoteStrip, AnimeFonts} from '../../../animenoir/AnimeNoirKit.jsx';
<AnimeFonts />  // once at comp root (Lilita, DM Serif italic, Special Elite, Fredoka)
<Cam from={{s:1, x:0, y:0}} to={{s:1.2, y:-50}} d={dur} mode="out" shake={0}>
  <Layer depth={0}><DuskSky horizon={1180} glowX={420} /></Layer>          // sky locked to infinity
  <Layer depth={0.15}><Ridge seed={3} base={1210} amp={170} fill={AN.ridgeFar} /></Layer>
  <Layer depth={0.3}><Svg><Triangle x={540} y={900} w={760} /></Svg></Layer>
  <Layer depth={1}><Svg><Agent x={540} y={1020} scale={2.5} tilt={-16} widen={1} /></Svg></Layer>
</Cam>
<AnimeFinish leaks={cutFrames} />   // vignette + grain PNGs (public/animenoir/grain0-3.png) + light leak around each cut
```
| export | what |
|---|---|
| `Cam` / `Layer` | camera (x, y px, s scale, r deg; eased) + parallax layers (`depth` 0 = sky, 1 = full move, >1 foreground) |
| `DuskSky` | night->violet->afterglow gradient, sun glow at `glowX`, twinkling stars, drifting lit cloud streaks; `morning` variant |
| `Ridge` | fbm ridge silhouette, ink outline, rim-lit top edge, optional hatching |
| `Triangle` | matte featureless black delta (no lights), thickness band, one cel facet, `trail` motion streaks, `bank`, `tilt` |
| `Agent` | anime bust (3/4 left; `flip`), hair spike/crop/cap, `look`, `tilt`, `widen`, `mouth`/`talk`, `binos` raise 0..1, `radio` 0..1, `earpiece`, `sweat` |
| `Figure` | small inked full-body figure: run / walk / stand / point / kneel (kneel reads badly, prefer stand + lookUp<0) |
| `ObsPost`, `Shrub` | hilltop post (rocks, tripod sensor, mast), desert shrub |
| `Motes`, `Haze` | drifting particles, horizontal haze band |
| `Slam`, `QuoteStrip`, `RecTag` | text slam (frame-0 aware), typewriter exact-quote strip, RECREATION tag |

## Measured (2026-10-31, 2 CPU arm64, CONC=1, 1080x1920, JPEG q95, CRF 12; GL irrelevant: pure DOM/SVG)
- Stills (every scene): 7-16 s wall incl. browser start; heaviest (dash scene, speed lines + trails) 20.3 s cold, peak tree RSS 597 MiB.
- Final render 1569 f in 30-frame chunks: 16-64 s per chunk = ~0.6-1.9 s/frame depending on box load (median ~0.9). 0 crashes.
- Output 12.4 Mbps; shortqa machine checks all pass (no dark stretch, no frozen stretch).

## Gotchas
- Put chunks on /workspace (e.g. /workspace/work/<x>_chunks): /tmp is wiped on a sandbox restart (lost 39 chunks on 2026-10-31).
- Never dispatch render steps in parallel tool calls (they all render the same chunk and overload the box).
- RecTag sits at x 64 and QuoteStrip spans x 70-1010: shift to x >= 90 / width <= 900 for the strict 90-990 text box.
- Faces are simple vector anime: keep them big (scale 1.5-2.6) with motion (tilt + widen + blink); figures are stick-like, keep them small/backlit.
