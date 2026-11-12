# IA (@ia.unfolds) daily mystery Shorts: PLAYBOOK (GitHub Actions edition)

Condensed from the factory rulebooks (FACTORY.md, REEL_RULES.md, REAL3D.md, NIGHTLY_SHORT_RUNBOOK.md, CRITIC_RUBRIC.md,
STORY_BANK.md) on 2026-11-12. This file is the single source of rules for `.github/workflows/daily-shorts.yml`.
Where an old rule and this file disagree, this file wins for the daily workflow.

Channel motto (never deviate): **"True mysteries science can't fully explain, in under 60 seconds."**

---------------------------------------------------------------------------------------------------------------------
## 0. Hard rules (break one = the Short is not made)
1. NO REPEATS, EVER. A case that was posted, banked, rendered or binned is done for good, in any look, title, cut or
   narrator. Before writing anything:
   - the slug must not be in `daily/used_slugs.txt`;
   - `python3 daily/dedupe_check.py <slug> "<case name>" [alias ...]` must exit 0 (exit 1 = repeat, pick another).
   - `titanic-californian-rockets-1912` is off limits (never read, render, edit or post it).
2. TRUE + VERIFIED. Every spoken or on-screen claim has 2 fetched reliable sources (Wikipedia + a primary/official
   or major-press source). No ghost legends as fact, no graphic violence against children, no sexual violence.
   Soften to what sources say ("most likely", "said"); drop any claim you cannot match on the fetched page.
3. NOTHING IS POSTED by the workflow. It only produces files. Hark uploads to Drive and schedules on Buffer.
4. Never commit keys, tokens, account names or personal data. The repo is public.
5. Two Shorts a day, alternating narrators: Short 1 = `narrator_m` (seed 41), Short 2 = `narrator_f` (seed 51).

---------------------------------------------------------------------------------------------------------------------
## 1. Format (machine-checked by shortqa)
| item | rule |
|---|---|
| length | 45-55 s target (hard max 59.0 s). Let the story decide; never pad or stretch. |
| script | 120-145 words, 6-12 lines, ~2.6 words/s. Numbers and years spelled out in words for the voice. |
| shots | 14-18 shots, mostly WIDE/MEDIUM (24-35 mm), close-ups only as accents; cut every 2-4 s on a voice word. |
| video | 1080x1920, 30 fps, H.264 CRF 12, >= 6 Mbps; plates Cycles 20-24 spp + OpenImageDenoise, AgX, `--pct 67` upscaled. |
| audio | -14 LUFS integrated (-15..-13 passes), true peak <= -1.0 dBFS; voice always on top. |
| motion | smooth eased dollies / push-ins / orbits / cranes only. NO shake, kicks, handheld jitter, wobble, flashes to white. |
| safe box | all text inside x 162-918; nothing below y 1560 (IA mark y 1468, label y 1522); captions at y 1290. |
| captions | one muted palette per Short from: sage, dusty-teal, slate, clay, lavender, sand, dusk-rose, fog-blue, stone. Never neon yellow or pure red. Never the same palette as the previous Short. |
| frames | no dark stretch (YAVG < 45 for > 0.2 s), no freeze > 1.5 s, no black dips between plates. |

---------------------------------------------------------------------------------------------------------------------
## 2. Topic choice (in this order)
1. Unused verified packs in `daily/ready/<slug>/` (factpack.md + VERIFY.md + draft packaging). Use their facts and
   sources; rewrite the script to this playbook. A pack is unused when its slug is not in `daily/used_slugs.txt`.
2. Otherwise a fresh row of `daily/STORY_BANK.md` whose status is not USED, verified with webfetch (2 sources/claim).
3. Otherwise a new case of the same kind found by search, verified the same way.
Topic priority: (1) UFO / sky lights / radar / signals with an official record or hard number; (2) aviation and
maritime vanishings with a PHYSICAL CLUE; (3) mass environmental anomalies with one hard number; (4) entity encounters
only with several witnesses and a concrete object; (5) true crime rarely. Avoid medical cases and vague "something".
Slug: lowercase-hyphenated, place/name + year, e.g. `shag-harbour-1967`. Folder name = slug.

---------------------------------------------------------------------------------------------------------------------
## 3. Script (lines[] in plan.json)
- LINE 1 = FRAME-1 HOOK, inside 2.5 s: an exact number or named subject + the impossible physical evidence + a concrete
  setting. No date/place preamble ("In 1954, at a quiet airport..." is banned), no vague pronoun hooks.
- Line 2: date and place. Then facts in story order, a NEW mini-reveal every 10-12 s, no dead stretch.
- SECONDARY TWIST at ~15-18 s: a "But..." line with a new concrete fact.
- ENDING = REVEAL INTO LOOP: the last line carries the strongest unexplained detail and ends exactly with
  **"Nobody explained it."** No moral, no wrap-up, no "comment below" / follow CTA.
- Plain spoken English, short sentences, active verbs. Max 32 words per line. Spell numbers out
  ("nineteen forty-seven", "thirty-one years"); digits only in heads/chips/titles.
- Nothing in the script that VERIFY.md does not support.

---------------------------------------------------------------------------------------------------------------------
## 4. Shots (shots[] in plan.json)
Each shot = one Blender plate rendered from an EXISTING scene script listed in `daily/SCENES.tsv` (180 tested REAL3D
scenes from earlier Shorts: skies, radar rooms, cockpits, ships, oceans, archives, desks, roads, forests, ice, labs...).
Read the description column and pick the scene whose picture best fits the words at that moment. Generic settings work
for any story because the head text and captions carry the specifics; avoid scenes whose description names a different
real place/person on screen (route maps, labelled documents). Max 2 repeated scene files per Short.
- `line` = index of the script line where the shot starts; `word` = word index inside that line (0 = line start).
  Shot 0 starts at line 0 word 0; shots strictly in order; each shot lasts >= 4 words (~1.5 s), ideally 6-10 words.
- `head` = 1-2 short lines (<= 22 chars each) shown at the top of the shot: the fact of that beat ("31 years", "of quiet").
- `chip` (optional, <= 28 chars) = a name/date/place label, e.g. "NEW MEXICO RANCH · 1947". 3-5 chips per Short.
- Frame 0 must be the most striking image of the story (the hook evidence), never a slow establishing shot.
- Plate frame counts come from the voice timing automatically (shot length + 8 handle frames).

---------------------------------------------------------------------------------------------------------------------
## 5. Packaging files (in daily/work/<slug>/, copied to out/<date>/<slug>/)
| file | rule |
|---|---|
| `yt_title.txt` | <= 100 chars total and ends with ` #shorts`. Body 38-48 chars, Title Case, two clauses "Fact. Twist." with a concrete number/object; never the answer, never "| Case Name". e.g. `3 Keepers Vanished. One Left His Coat. #shorts` |
| `yt_desc.txt` | 2-4 factual sentences; the loop question; `Sources:` block with >= 2 URLs (one per line, "- Publisher, "Title": URL"); the line `Visuals: original 3D reconstruction by IA (@ia.unfolds), rendered in Blender (CC0 assets); not real footage. Narration is an AI voice.`; 3-5 hashtags ending `#shorts`. |
| `x_text.txt` | <= 280 chars, standalone hook + key fact, 1 hashtag, no YouTube link. |
| `x_thread.json` | JSON list of 1-3 strings, each <= 280 chars, "1/2 ..." style, last one carries a source URL. |
| `VERIFY.md` | table: claim | source URLs (>= 2) | ok/dropped. Every number/name/date on screen or in the voice. |
| `plan.json` | see section 6. |

---------------------------------------------------------------------------------------------------------------------
## 6. plan.json schema
```json
{
  "slug": "shag-harbour-1967",
  "case_name": "Shag Harbour UFO incident",
  "aliases": ["shag harbour", "nova scotia 1967"],
  "narrator": "narrator_m",
  "scheme": "fog-blue",
  "credit": "",
  "lines": ["Four orange lights dropped into the sea off Nova Scotia, and divers found nothing.", "..."],
  "shots": [
    {"line": 0, "word": 0, "scene": "blender/scenes/<dir>/bNN_name.py", "head": ["Four lights", "into the sea"]},
    {"line": 0, "word": 8, "scene": "blender/scenes/<dir>/bNN_name.py", "head": ["Divers found", "nothing"], "chip": "SHAG HARBOUR · 1967"}
  ]
}
```
`scheme`: pick one that suits the plates' colours and differs from the other Short of the day.
Validate: `python3 daily/validate.py daily/work/<slug1> daily/work/<slug2>` must print PASS for both.

---------------------------------------------------------------------------------------------------------------------
## 7. End-to-end on GitHub Actions (`.github/workflows/daily-shorts.yml`, cron 19:30 UTC = 01:00 IST)
All on free ubuntu-latest runners (4 vCPU). Jobs are chained; each Short flows through by slug.

| job | what it does | key commands |
|---|---|---|
| `write` | jev-1.13-free picks topics; the OpenCode coding agent (section 12) verifies, writes daily/work/<slug>/ and validates; jev reviews the scripts (go/no-go). | `bash daily/write_shorts.sh` -> artifact `plan` |
| `tts` (per slug) | Qwen3-TTS 1.7B voice clone on CPU from the public repo `inspireaura886-spec/qwennyy` (voices d = narrator_m, e = narrator_f), word timings (faster-whisper small.en aligned to the script), cues, horror mix to -14 LUFS. | `python3 daily/tts_job.py W qwen S`; `python tts.py render/join`; `daily/vo_words.py`; `daily/cues.py`; `daily/mix.py` -> artifact `case-<slug>` |
| `plates_plan` | Caches Blender 4.2.9 + CC0 assets; splits every plate into <= 22-frame parts. | `python3 daily/plates_matrix.py case` |
| `plates` (matrix, <= 20 parallel) | Renders each part: `blender -b --factory-startup -noaudio -P <scene> -- --start A --end B --out frames --assets ~/ia3d_assets --pct 67 --nf NF`, lanczos to 1080x1920, x264 CRF 10. | artifact `p-<slug>-<shot>-<i>` |
| `final` (per slug) | Joins parts into plates (missing plate -> nearest neighbour, flagged in qa.json), generates the Remotion comp, renders 1080x1920 CRF 12, muxes audio (AAC 192k), runs the shortqa gate, writes the out folder. | `daily/assemble_plates.py`; `daily/gen_comp.py`; `npx remotion render src/real3d/<slug>/entry.jsx <Comp> v.mp4 --muted --crf=12 --jpeg-quality=95`; `python3 daily/scary-reels/pipeline/shortqa.py final.mp4 sqa --cuts ...`; `daily/finalize.py` |
| `publish` (always) | Collects every finished Short into one artifact and commits rendered slugs to `daily/used_slugs.txt`. Runs even if a Short failed, so whatever passed is still uploaded. | artifact `shorts-<YYYY-MM-DD>` |

Output layout (artifact `shorts-<date>`): `<date>/<slug>/final.mp4, yt_title.txt, yt_desc.txt, x_text.txt,
x_thread.json, qa.json, VERIFY.md, contact.jpg, opening.jpg, report.md`.
`qa.json.pass` = shortqa machine checks all passed AND every plate rendered. Hark posts only `post: true` Shorts
(pass + no model veto, after a look at contact.jpg), at 13:15 IST and 21:30 IST only, YouTube + X via Buffer, never Instagram.

Manual run: Actions -> daily-shorts -> Run workflow (or `apicall github workflow_dispatch ... workflow_id=daily-shorts.yml`).
Hark side: `bash /workspace/work/close2/pull_daily.sh <YYYY-MM-DD>` downloads the newest successful run's artifact.

---------------------------------------------------------------------------------------------------------------------
## 8. shortqa gate (`daily/scary-reels/pipeline/shortqa.py`, exit 0 = pass)
1080x1920 · 30 fps · <= 59 s · has audio · A/V within 2 frames · -15..-13 LUFS · TP <= -1.0 · no dark stretch ·
no freeze > 1.5 s · >= 6 Mbps · no yellow/red template caption colours (`daily/tools/palette_check.py`) ·
no camera shake (`daily/tools/shake_check.py`, osc_frames <= 300) · per-shot exposure (`daily/tools/shot_exposure.py`).
Also writes contact.jpg (2 fps), opening.jpg (first 3 s) and cuts/*.jpg for the human look.
Fresh-critic rubric (CRITIC_RUBRIC, for Hark's look): hook by 1.5 s, beat noun on screen at its word, sharp beat
frames, 14-18 eased shots, motivated grade, muted on-word captions in the safe box, mini-reveal every 10-12 s,
-14 LUFS, loop ending on "Nobody explained it.", every on-screen claim in VERIFY.md. PASS = mean >= 8, hard floor 7.5.

---------------------------------------------------------------------------------------------------------------------
## 9. Audio
- Voice: Qwen3-TTS clone, `narrator_m` seed 41 / `narrator_f` seed 51, 0.2 s between lines, alternate every Short.
- Bed: synthesized only (giant braam + boom in the first 0.5 s, low booms on every 4th cut, heartbeat accelerating
  into the reveal, 0.3 s hush then a hit on "Nobody"), voice on top, -14 LUFS / TP <= -1.5 (`daily/mix.py`).
- Music tracks are NOT used in the daily workflow: tracks need the user's approval (music gate) and licensed audio
  must not be committed to a public repo. Banned SFX: synth risers, comedic stingers.

---------------------------------------------------------------------------------------------------------------------
## 10. Look (REAL3D standard)
Every Short is REAL3D quality: Blender Cycles plates (20-24 spp, adaptive 0.03-0.04, OIDN, AgX), composited in
Remotion with `rm/src/real3d/Real3DKit.jsx` (PlateTrack dip 0, Real3DFinish grain/vignette, R3DHead headlines with a
dark scrim, R3DCaption 1-3 word captions that appear on the spoken word, IAMark y 1468, R3DLabel y 1522).
No low-poly, no stock footage, no AI faces. Never raise CRF, drop the denoiser or render below 1080x1920.

---------------------------------------------------------------------------------------------------------------------
## 11. Failure handling
- write: if validation fails the script re-prompts with the errors, then tries the next free model (3 rounds max).
- tts: a failed slug is skipped; the other Short continues.
- plates: fail-fast is off; a missing plate is replaced by its neighbour and qa.json gets `pass: false`.
- final/publish: publish always runs and uploads whatever finished; Hark posts only `pass: true`.
- Logs: Actions run page; per-Short `report.md` + `qa.json` in the artifact.

## 12. Model roles (keys = repo secrets, never printed or committed: OPENCODE_API_KEY for the OpenCode agent + vision models, JEV_API_KEY for every jev-1.13-free call)
| role | model | where |
|---|---|---|
| coding + script agent | `opencode/glm-5.3-flash-free`, then `opencode/minimax-m3.1-flash-free`, fallback `opencode/deepseek-v4.1-flash-free` (`big-pickle` last) | `write` job, `opencode run` in `daily/write_shorts.sh` |
| decision layer (a) topic choice | `jev-1.13-free` via `https://opencode.ai/inference/systemone/v1/systemone` (Bearer JEV_API_KEY) | `python3 tools/jev.py choose <candidates.json> 2` on `daily/candidates.py` output; picks passed to the agent as a hint |
| decision layer (b) script go/no-go | `jev-1.13-free` | `python3 tools/jev.py review daily/work/<slug>` -> review.json {hook, score, go, fixes}; a NO-GO gets one fix round |
| visual check | `nemotron-3.5-super-vl-free` on contact.jpg + opening.jpg (fallback `mimo-v2.6-flash-free`) via the Zen chat endpoint | `python3 tools/jev.py vision sqa/contact.jpg sqa/opening.jpg` -> visual.json {exposure_ok, captions_readable, inside_safe_box, notes} |
| decision layer (c) post/no-post | `jev-1.13-free` given the shortqa report + visual + review | `python3 tools/jev.py decide sqa/report.md sqa/visual.json review.json` -> decision.json |
Rules: **shortqa stays the hard gate.** `qa.json.pass` = shortqa + every plate rendered. `qa.json.post` = pass AND jev did not
veto; JEV_API_KEY missing = jev steps skipped with a warning; a model that is down or returns junk never blocks (tools/jev.py returns ok:false and the gate falls back to shortqa).
The models can only veto, never override a failed shortqa. Hark posts only `post: true`.

## 13. Files in this repo used by the daily workflow
`tools/jev.py` (model roles), `daily/` (scripts, candidates.py, CRITIC_RUBRIC.md, SCENES.tsv, used_slugs.txt, dedupe corpus, STORY_BANK.md, ready/ packs, tools/, shortqa),
`blender/` (kit + scenes), `rm/` (Remotion project, Real3DKit), `opencode.json`, this file.
