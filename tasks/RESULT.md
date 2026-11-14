# Self-healing daily-shorts: RESULT (Hark task, 2026-11-14)

## What was built

1. **`daily/heal.py <slug> <workdir> <sqa_dir>`** (stdlib only)
   - Reads `sqa/report.json` (new machine-readable output from `shortqa.py`) plus the Jev frame flags.
   - Applies cheapest first, re-runs the **unchanged** shortqa hard gate after every round, max 3 rounds:
     - **dark ranges**: ffmpeg `eq` gamma+brightness only inside each failing `between(t,a,b)` window, with 0.2 s half-strength ramps. Gamma is solved from the measured per-frame YAVG so it lifts to ~56; it re-measures and re-grades up to 2x inside the round so the result is not guessed.
     - **frozen stretches**: with `--rerender` + Blender it re-renders the missing plates and the Remotion comp once; otherwise it covers the stretch with a slow centred Ken Burns push-in (5 % max, no shake) and re-cuts around it.
     - **"text not readable"/safe-area Jev flags**: draws a darker caption backing over the caption band (inside x 162-918, above y 1560) for the flagged shots.
     - **audio**: only if the gate failed it, two-pass loudnorm to -14 LUFS / TP -1.0.
   - Writes `sqa/heal.json` with every round, before/after LUFS, TP, dark and frozen ranges.
   - Also keeps each pre-round cut as `sqa/heal/round<k>.mp4` and the round's full shortqa report.
2. **`shortqa.py`** now also writes `sqa/report.json` (duration, LUFS, TP, bitrate, each dark range with min/mean YAVG, each frozen range, Jev flags, all checks). Thresholds are untouched.
3. **`daily/plate_guard.py`** measures each rendered plate PART right after encode. If any YAVG < 45 or mean < 55 it re-renders that part **once** with +1 EV (pinned from the scene's own auto-exposure) and re-encodes it.
4. **Prevention at the source**
   - `assemble_plates.py` now records `missing`, `missing_scenes` and `replaced` in `<slug>.plates.json`; `finalize.py` carries `plates_missing` into `qa.json`.
   - plates job retries a failed Blender part once inside the same step (clears partial frames first).
   - kit auto-exposure now enforces a **0.24 display-luma floor** (≈ YAVG 61) so no new plate is metered into the dark gate.
   - The exact dark-scene culprits were found from the four reports + plans + cues:
     | Short | shot | scene | fix |
     |---|---|---|---|
     | high-aim-6 | s07 | `teignmouth.../b15_ship.py` | target 0.28, sea/sun 4.4, steamer lit 0.3 |
     | high-aim-6 / stephenville / oakville | s12 / s10 / s08 | `vela.../b04_scope.py` | target 0.17→0.27, desk key 60→90 |
     | jim-thompson | s01 | `percy.../b16_where.py` | target 0.28, sun 15→18, haze 0.02→0.012 |
     | jim-thompson | s02 | `vela.../b16_loop.py` | target 0.15→0.27, night key 0.06→0.14 |
     | jim-thompson | s03 | `percy.../b02_z.py` | target 0.30 |
     | stephenville | s12-13 | `battle.../b04_ascope.py` | target 0.18→0.26, green CRT spill 12→25 |
     | oakville | s09 | `vela.../b09_nothing.py` | target 0.20→0.27 |
5. **`daily/heal_artifact.sh <run_id> <slug>`**: downloads `short-<slug>`, `case-<slug>` and `plan` (optionally `p-<slug>-*` with `HEAL_FETCH_PLATES=1`), runs the same shortqa gate, heals, refreshes the report and writes `out/<date>/<slug>/` via `finalize.py` (including `heal.json`). `--post` is used only when the healed cut re-passes shortqa.
6. **Workflow patches for Hark** (not edited under `.github/workflows/`):
   - `tasks/WORKFLOW_PATCH/daily-shorts.yml` — full replacement, only three changes: plates retry + YAVG guard (+ `daily` sparse checkout), and the final job runs heal after a shortqa failure, refreshes shortqa, then finalises with `--post` when healed.
   - `tasks/WORKFLOW_PATCH/heal.yml` — `workflow_dispatch` with `run_id` + `slug`, runs `heal_artifact.sh`, uploads artifact `healed-<slug>`.

## Real test results (artifacts from the actual failed runs)

Both were downloaded with the GitHub API (`gh run download`), then passed through `shortqa.py` → `heal.py` → `shortqa.py`; no thresholds were changed.

| | high-aim-6 (run 43338760199) | jim-thompson (run 43534163443) |
|---|---|---|
| duration / size / fps | 51.40 s, 1080x1920, 30 fps | 47.10 s, 1080x1920, 30 fps |
| **before** LUFS / TP | -14.0 / -1.4 | -14.1 / -1.3 |
| **after** LUFS / TP | -14.0 / -1.4 | -14.1 / -1.3 |
| **before** dark ranges | 19.667-20.133 s (min 42.9), 31.667-34.033 s (min 28.7, mean 34.9) | 0.233-2.667 s (43.1), 3.233-5.067 s (42.5), 6.733-7.200 s (44.5), 8.400-8.633 s (44.5) |
| **before** frozen | none | 5.967-7.800 s (1.833 s) |
| **after** dark / frozen | none / none | none / none |
| heal rounds | 1 | 2 |
| after min YAVG in former ranges | 47.1; 40.0 (one isolated frame, mean 57.4; no sub-45 stretch >0.2 s) | 46.6-53.9 (overall min 44.1, no sub-45 stretch >0.2 s) |
| bitrate before → after | 12.7 → 13.4 Mbps | 8.8 → 9.8 Mbps |
| plates | replaced none | replaced s01←s02, s03←s02, s11←s10, s12←s10, s13←s14; marked `healed`, missing [] |
| **shortqa / qa.post** | **PASS / true** | **PASS / true** |

Round detail: high-aim needed only the two dark lifts; jim needed four dark lifts + the Ken Burns cover for the 1.833 s freeze, then one extra short lift at 7.43-7.73 s created by the re-cut (round 2). Contact sheets are in `tasks/heal_test/` (`*-before.jpg`, `*-after.jpg`, `*-before-after.jpg`).

Also validated `plate_guard.py` on a real dark part (`p-high-aim-6-s12-1` from run 43338760199): min YAVG 41.7 / mean 45.1 → correctly flagged for the +1 EV retry. Blender is not installed in this workspace, so the retry itself was not executed here.

## What is still broken / needs Hark

- **Apply the two workflow files**: copy `tasks/WORKFLOW_PATCH/daily-shorts.yml` to `.github/workflows/daily-shorts.yml` and `tasks/WORKFLOW_PATCH/heal.yml` to `.github/workflows/heal.yml`.
- The Blender scene-lighting fixes are syntax-compiled but **not re-rendered here** (no Blender/assets in this workspace). Their effect should be confirmed by the first nightly plates run; the kit floor is the safety net.
- Frozen-plate repair in the daily `final` job uses the **Ken Burns fallback**, because that job has no Blender. True plate re-rendering is available with `heal.py --rerender` (rescue environment with Blender) and via the new plates-job retry.
- Jev **"subject unclear" / "badly exposed"** frames are still advisory and cannot be repaired by ffmpeg. Heal only darkens the caption backing for "text not readable"/safe-area. Per the task, once a healed cut re-passes shortqa it is finalised `post=true` (the Jev subject flags are recorded but no longer veto a healed Short).
- Heal does not move already-burned text; the generated comp already places captions at x 162-918 / y 1290, and heal adds the darker backing. A genuine safe-area bug in chips/heads would still need a Remotion re-render.
- The large high-aim dark range still has one isolated frame at YAVG 40 (not a >0.2 s stretch, so the hard gate passes); the range mean is 57.4. Every single frame is not forced to 55 because that would wash the shot.
- No healed mp4 was committed; they exist only as local test artifacts / would be workflow artifacts (`healed-<slug>`).
