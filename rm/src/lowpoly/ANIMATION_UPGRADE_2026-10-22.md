# Animation upgrade 2026-10-22: research, swangle tests, what went into the kit

Goal (user, 2026-10-22 20:18 IST): "superb animation" for the IA low-poly 3D mystery Shorts. Free/open-source only.
Box: 2 aarch64 CPUs, software WebGL (`--gl=swangle`), Remotion 4.0.534, React 18, @react-three/fiber 8.17, three 0.169.

## 1. Installed (all MIT, in reels/remotion/package.json)
@react-three/postprocessing 2.16.6 + postprocessing 6.36.4, @react-three/drei 9.122.0, @remotion/motion-blur 4.0.534,
@remotion/transitions 4.0.534. Rollback copy of the old package.json: none needed (additive only; nyos/flannan untouched).

## 2. What renders under swangle (measured, 1080x1920, --concurrency=2)
| thing | result | cost |
|---|---|---|
| EffectComposer + Bloom(mipmapBlur) + Vignette | WORKS, keeps the transparent canvas, so the CSS sky survives | ~+0.22-0.26 s/frame (resolution-bound) |
| + SMAA | works | +0.41 s/frame: too expensive, do not use |
| + FXAA (kit default) | works | see TOOLS_AND_ASSETS line / below |
| DepthOfField | renders | ~3.6 s/frame: REJECTED (fake depth with fog layers + foreground props instead) |
| ChromaticAberration | works | cheap; impact frames only |
| drei `<Outlines>` | no visible outline on flat-shaded geometry here: REJECTED, kit uses inverted-hull outlines (OutlineScope) |
| drei `<Sparkles>` / `<Cloud>` / `<Float>` | clock-driven (not frame-deterministic) and tiny under swangle: REJECTED, kit has frame-driven Particles |
| meshToonMaterial + NearestFilter gradientMap | works | ~0 |
| inverted-hull outlines (OutlineScope on Person) | works | ~0.13 s/frame for 3 figures |
| FogLayer (4 drifting noise sheets) | works | ~0.2 s/frame when it covers the frame (software fill-rate) |
| @remotion/motion-blur CameraMotionBlur samples=4 | works with ThreeCanvas | ~3 s/frame: only on 6-10 frame whips/crashes |
| InstancedMesh particles / Burst / Shockwave / LightCone / GodRays shaders | work | small (one draw call each) |
Demo shot costs (all effects on, SMAA): storm-cliff shot 1.13 s/frame, night-village shot 1.4 s/frame; same village shot with no post/fog/outline 0.58 s/frame.
Rule of thumb: software GL is FILL-RATE bound. Every full-screen pass or big transparent sheet costs ~0.1-0.25 s/frame; extra
triangles are nearly free. So: many small objects good, many big transparent layers bad.

## 3. Hunt notes (sources)
- Remotion ThreeCanvas renders on demand via advance(); useFrame subscribers (EffectComposer) still run, so postprocessing works:
  https://www.remotion.dev/docs/three-canvas , https://react-postprocessing.docs.pmnd.rs/effect-composer
- Remotion motion blur (CameraMotionBlur = N sub-frame renders blended): https://www.remotion.dev/docs/motion-blur/
- Toon = MeshToonMaterial + 2-4 step NearestFilter gradient map; inverted hull = cheap robust outline; rim light lifts silhouettes:
  https://masterallarts.com/learn/threejs-from-zero/s4-09-stylized-npr , https://polyfork.dev/threejs-shaders , https://threejs.org/docs/pages/MeshToonMaterial.html
- Stylised water: shallow/deep colour by height/depth + crest colour + shore/intersection foam (Gerstner-style sum of waves):
  https://masterallarts.com/learn/threejs-from-zero/s12-06-stylized-water-foam/ , https://genex.games/stylized-water
- repos/awesome-opus5-5-videos (MIT, cloned 2026-10-22). Most 3D prompts are one-liners; the useful technique wording came from:
  * op7418-814408 (mobile-game reward VFX): toon 3-4 step gradient + THREE lights (key, sky, coloured rim); outlines thick outside /
    thin inside; anticipation -> squash -> burst -> settle; burst = screen-blend radial flash capped at 0.8 (never full white),
    camera push + shake, MULTI-LAYER shockwave (wide-faint, medium, thin-bright), long thin streak sparks, each spark with a faint
    halo; light shafts = 5-7 soft fanned beams with slight individual flicker + soft core at the root + dust drifting up in the light;
    glow BEHIND the hero, not over it; soft contact shadow under the subject that changes with its height.
    -> kit: Shockwave (3 rings), Flash (cap 0.8), Burst sparks (streaks), GodRays (5-7 beams + core + dust), ContactShadow / Person shadow.
  * techhalla-498547 + 0xkarmi-129839: every frame a pure function of the frame number (no clocks, no random) => any frame renders
    identically, seam/loop check frame 0 vs last; render one QA still per major beat BEFORE the full render; motion blur by sub-frame
    blending; camera moves only on beats (punch-in, smash pan), never random. -> already our rule (rng(seed)); runbook checklist.
  * daniel-haida-636937 (Remotion product film): one shot = one idea; premium easing, never linear; overlapping motion (elements
    never start/stop on the same frame); object-driven transitions (match cuts); "no effect exists only because it looks cool",
    no particle spam, no constant zooming. -> checklist "restraint" lines.
  * mdaman010-207866 / thusatharan-433543 / youwareai-300653: procedural diorama + water/smoke/lava + day/night switch that lights every
    window + choreographed camera journey + clouds below a hero. -> FogLayer as a cloud sea, mixPalette day->night with Building lit.
  * fleyta88-443662: step frame-by-frame, compare stills, patch only what fails. -> QA stills at every cut before the full render.

## 4. Added to the kit (src/lowpoly/kit, exported from kit/index.js; see README table)
Post.jsx, Toon.jsx, Particles.jsx, Light.jsx, Sea.jsx, Rock.jsx, Camera.jsx, Fx2D.jsx + Characters.jsx action poses/props/shadow/outline.
SFX: tools/cut_sfx.py (+ optional raw/sfx.wav layer in scary-reels/pipeline/mix_story_audio.py; backup mix_story_audio.py.pre-sfx.bak).
Demo: stories/kit-demo (KitDemo, 246 frames).

## >>> GRAB3D PROPS 2026-10-30 <<<
Grab3D Cozy Horror Props (34 CC0 GLBs, haunted-house / hospital / nursery / crypt set dressing) recoloured to IA palettes: kit/Props.jsx `GrabProp`, docs in PROPS.md, test comp stories/props-test.
