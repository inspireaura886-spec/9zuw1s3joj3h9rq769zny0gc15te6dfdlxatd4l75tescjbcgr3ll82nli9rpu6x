# Short QA: final.mp4

- [x] Size is 1080x1920: 1080x1920
- [x] Frame rate is 30: 30 fps
- [x] Length <= 59.0 s (motto): 51.40 s
- [x] Has audio: yes
- [x] Audio and video lengths match within 2 frames: video 51.400, audio 51.400
- [x] Loudness -15 to -13 LUFS: -14.0 LUFS
- [x] True peak <= -1.0 dBFS: -1.4 dBFS
- [x] No dark stretch (YAVG<45 > 0.2 s): none
- [x] No frozen stretch > 1.5 s: none
- [x] Video bitrate >= 6 Mbps (full-quality master): 13.4 Mbps
- [x] No yellow/red template caption colours (tools/palette_check.py): pixel check ok (51 frames, no template yellow in text bands)
- [x] No camera shake/wobble (tools/shake_check.py, osc_frames <= 300): osc_frames=0
- [x] Exposure per shot (tools/shot_exposure.py: no clipping, no washed blacks, <= 2 bad shots): 1 of 18 shots hard-fail
- [i] Jev frame checks (advisory): 18 shots, flagged [2, 4, 6, 10, 15, 16] (readable/exposure, caption box in x 162-918 / y<=1560), mean visual interest 5.8/10

LOOK at contact.jpg, opening.jpg and cuts/*.jpg, then answer every check yes/no; fix any no before scoring:
1. Hook lands in the first 3 s, and the opening makes sense with the sound off (opening.jpg).
2. The Short answers (or squarely poses) the question its hook raises; the ending question names only theories explained earlier.
3. Every shot moves (camera or subject); no static slide or repeated filler prop/slab between scenes.
4. Each visual shows something the words do not already say (not just a picture of the noun).
5. Every line of on-screen text is whole: nothing clipped at a frame edge, nothing outside x 90-990 / y 230-1480.
6. Every number, name and date on screen is one the narration says or the source shows.
7. Every cut lands on the right word; no blank, frozen or stretched frames around cuts (cuts/*.jpg).
8. Captions: max 3 words / 18 chars per chunk, split at punctuation and pauses, word-exact timing from the voice word timestamps, y <= 1480; emphasis box only on a rare name, number or main claim.
9. Text and details readable at phone size (contact.jpg tiles are ~phone-thumbnail scale).
10. Sources on screen; no realistic AI faces/imagery (AI_TAG=false).
Then give the harsh score (hook, clarity, animation, overall). Post only at >= 7/10.
