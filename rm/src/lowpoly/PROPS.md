# Grab3D Cozy Horror Props (added 2026-10-30)

34 CC0 models from https://grab3d.com/kits/cozy-horror-props/ (LICENSE.txt + INDEX.csv in `public/props/grab3d-cozy-horror/`).
Real-world metres, Y-up, 5k-25k tris each, one 1K texture set per model after recolour.

## Use
```jsx
import {usePreload, GrabProp, grabPaths, grabTris} from '../../kit/index.js';
const NAMES = ['hospital-gurney', 'old-iron-bed', 'hanging-light-bulb', 'cobweb'];
const PATHS = grabPaths(NAMES, 'ia-dark');           // preload BEFORE ThreeCanvas mounts (delayRender-safe)
// console.assert(grabTris(NAMES) <= 200000)
const ready = usePreload(PATHS);
{ready && <ThreeCanvas ...>
  <GrabProp name="hospital-gurney" position={[-1.6, 0, 0.3]} rotation={[0, 1.2, 0]} />
  <GrabProp name="old-iron-bed" height={1.4} position={[2, 0, -1.4]} />   {/* height in m overrides scale */}
  <GrabProp name="hanging-light-bulb" glow={2} position={[0.9, 2.4, 0.4]} /> {/* glow multiplies emissive */}
</ThreeCanvas>}
```
Props: `name` (slug, see INDEX.csv / GRAB_SIZE), `palette` ('ia-dark' default = files in the kit root; any other = subfolder), `position`, `rotation`, `scale` or `height`, `glow`, `shadows`. Emissive parts (bulbs, lamps, TV static, dollhouse window, projector lens) are the scene's natural glowing source: pair them with ONE pointLight.

## Palettes
`node tools/recolor_props.mjs` (default ia-dark, all 34) / `--palette ia-sepia|ia-cold|ia-blood|<path/palette.json>` / `--only a,b` / `--tex 1024` / `--simplify 0.5` (off by default).
Presets live in `tools/props_palettes.json`. A per-Short accent = copy a preset into the Short's folder as `palette.json`, change `tint`, `glow`, or add `overrides: {"<material regex>": {"hex": "#..."}}` (material names look like `<slug>_body_pbr`, `<slug>_cobweb_x`, `<slug>_glow_x`), and run with `--palette path/palette.json` -> `public/props/grab3d-cozy-horror/palette/`. Name the json after the Short (e.g. `westall.json`) so folders don't collide; pass `palette="westall"`.

## Weight cap (2 CPU / 7 GB, see FACTORY.md CRASH-PROOF rule 2)
Per scene max 8 Grab3D instances, max 6 big (>15k tris), <= 200k Grab3D tris, <= 10 distinct GLBs. Test comp: `stories/props-test` (PropsTest; `--props='{"stress":1}'` = ceiling test).
Measured 2026-10-30 (lavapipe vulkan, idle box): 155k tris / 9 instances = ~0.74 s/frame, 1.25 GB; 285k / 15 = ~1.06 s/frame, 1.59 GB, 0 crashes.

## Rules
Never ship the raw pastel originals (`orig/`). Every prop must belong to the story; the same model in max 2 scenes unless it is the key object (ANIMATION QUALITY PUSH).
