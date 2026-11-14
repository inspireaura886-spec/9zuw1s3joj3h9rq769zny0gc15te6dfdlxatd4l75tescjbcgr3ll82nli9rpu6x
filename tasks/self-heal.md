# Task from Hark (director): make daily-shorts heal itself

The problem: nights 2026-11-13 and 2026-11-14 produced 4 finished Shorts (high-aim-6, stephenville-lights-2008, jim-thompson, oakville-blobs-1994), and all 4 failed the shortqa hard gate. The details are in reports/2026-11-13.json and reports/2026-11-14.json. The causes were:
- dark stretches (YAVG < 45 for more than 0.2 s), e.g. 0.23-2.67 s, 3.23-5.07 s;
- frozen stretches over 1.5 s, because failed Blender plates were replaced by a neighbour's plate (plates_replaced in the report; the plates job failed);
- Jev frame flags: "subject unclear" and "text not readable".
Nothing was posted, and the channel went silent. The owner wants this fixed so it never needs a human: the pipeline must detect these failures and fix itself.

## Build this
1. `daily/heal.py <slug> <workdir> <sqa_dir>`: read shortqa's report (sqa/report.md plus any JSON it writes; extend shortqa.py to also write sqa/report.json with machine-readable failures: each dark range, each frozen range, LUFS, true peak, duration, and safe-area problems) and the Jev frame flags. Apply fixes in order, cheapest first, then re-run shortqa after each round. At most 3 rounds.
   a. Dark: lift only the failing time ranges (with a ~0.2 s ramp so there's no visible pop). Use ffmpeg eq/curves gamma and brightness with `enable='between(t,a,b)'`, or better, re-grade the shot plate before compositing. Aim for YAVG of at least 55 on those frames without clipping highlights or adding banding. Keep the IA look (moody, never washed out).
   b. Frozen or replaced plates: first re-render the missing plate once (the plates job is a matrix, so find why it failed in the job log and retry). If that's impossible, cover the stretch with a slow push-in or pan on the still (Ken Burns, no shake, osc_frames <= 300) or trim the hold to under 1.2 s by stretching the neighbouring shots. Never leave a frame frozen for 1.5 s or more.
   c. "Text not readable" or a safe-area failure: re-layout the caption inside x 162-918 and above y 1560, with a darker caption backing.
   d. Audio: re-normalise to -14 LUFS, TP <= -1.
   Write sqa/heal.json listing each round, what it changed, and the before/after numbers.
2. Prevent it at the source, so heal.py rarely has to act:
   - plates: retry each failed Blender shot once inside the plates job (or a follow-up job), and record which plates are still missing;
   - Blender/scene kit: raise the default exposure and key light for the dark scenes, so new renders land at YAVG 55-120. Find which SCENES.tsv scenes produced the dark plates in these 4 Shorts and fix their lighting.
   - add a quick pre-check that measures each plate's YAVG right after render and re-renders a plate once with +1 EV if it's too dark.
3. Wire heal.py into the final job: after shortqa fails, run heal.py, and if it then passes, finalize with post=true. Because you cannot edit .github/workflows, write the full new daily-shorts.yml to tasks/WORKFLOW_PATCH/daily-shorts.yml (change only what's needed), and Hark will apply it.
4. Add `daily/heal_artifact.sh <run_id> <slug>`: download that run's `short-<slug>` and `case-<slug>` artifacts (and plates if needed), run heal, and write out/<date>/<slug>/ like finalize.py does. Write tasks/WORKFLOW_PATCH/heal.yml as a workflow_dispatch workflow (inputs run_id and slug) that runs it and uploads an artifact `healed-<slug>`, so Hark can rescue past Shorts.
5. TEST on the real failures: run heal on at least jim-thompson (run 43534163443) and high-aim-6 (run 43338760199). Download their artifacts with the API, run heal.py and shortqa, and report the before/after numbers in tasks/RESULT.md. Commit the healed mp4s to nothing (artifacts only; they're big). Just report the numbers, and put contact sheets in tasks/heal_test/.

## Hard rules
- shortqa stays the hard gate: never loosen its thresholds to make something pass.
- Output: 1080x1920, 30 fps, 45-55 s, -14 LUFS, TP <= -1, no shake.
- Keep it cheap (free runners), and use no paid services.
- Read PLAYBOOK.md first.
