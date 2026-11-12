# IA fresh-critic rubric (adopted 2026-11-06, user "Yes")
Adapted from nocodehack/make-short v3 critic (MIT, vendor/make-short). Applies to every NEW Short before banking or posting.

WHO: a FRESH subagent (run_subagent) that did not build the Short. The builder never scores its own film; builders score about 2 points too high. Its score is the QA score of record. The builder's own frame QA still runs first, as a gate.
INPUT: final.mp4; `bash tools/critic_prep.sh <final.mp4> <case>/critic/rNN [ref]` output (1 fps sheets, stats.csv at 4 fps, cuts.txt); script.txt and cues.json; this rubric. Reference = the MH370 Short (scary-reels/cases/mh370-seven-handshakes-2014/final.mp4), the quality bar.
RULES: every lost point names the exact SECOND (or range) and evidence (sheet frame, stats row). Verify a claim at full resolution (ffmpeg -ss T -frames:v 1) before acting on it. Score from this round's frames only.

| # | Criterion | 10/10 means | Test |
|---|---|---|---|
| 1 | Hook (0-3 s) | Real artifact/claim on screen by 1.5 s, frame 0 is a strong image | sheet frames 0-3, script line 1 |
| 2 | Beat on screen | The noun of each line is visible and big at its word +-0.3 s | per line, frame at cue time |
| 3 | Sharpness | Blur only in intended transitions; beat frames sharp | stats.csv blur_flag rows not within 0.3 s of a cue |
| 4 | Shot variety + motion | 14-18 distinct shots, mostly wide/medium, every shot has an eased move, no shake | cuts.txt count, sheets, shake_check.py |
| 5 | Grade + exposure | Motivated moods, nothing crushed or blown, no near-black frames | yavg < 20 or > 235 rows |
| 6 | Captions | Humane muted palette, on the word, inside safe box (x 162-918, nothing below y 1560) | full-res frames |
| 7 | Mini-reveals | A new reveal every 10-12 s, no dead stretch | script + sheets |
| 8 | Sound | -14 LUFS, TP <= -1, hits within +-2 frames, no dead air > 0.4 s in first 10 s | loudnorm print, silencedetect |
| 9 | Ending | Loop ending lands on "Nobody explained it." (or its framed variant), no CTA | last 3 s |
| 10 | Facts on screen | Every on-screen claim matches VERIFY.md; credits chips present where required | script vs VERIFY.md |

Overall = mean. PASS = criteria 1-4 each >= 7 AND mean >= 8.0. Under 7.8 -> fix round (max 3) fixing ONLY the critic's top 3, by frame range. Hard floor 7.5.
REPORT: <case>/critic/critique-rNN.md: score table, then "Top 3 fixes" each with a frame range, criterion and evidence. Under 400 words. Log the score in STATE.json (critic_rNN) and QA.md.
Each fix round's lesson goes as one numbered line in CRITIC_LESSONS.md.
