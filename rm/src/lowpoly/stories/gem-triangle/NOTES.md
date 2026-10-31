# Black Triangle Short — Production Notes (GEMTRI)

Composition: `GEMTRI`  
Resolution: 1080 x 1920 (9:16 vertical Shorts format)  
Frame rate: 30 fps  
Duration: 1569 frames exactly (52.30 s)  
Audio: Pre-recorded voiceover (`triangle/vo.json`), muxed externally on GitHub Actions  
Style: Anime-Noir (SVG + CSS cel-shaded parallax diorama via `src/animenoir/AnimeNoirKit.jsx`)  
Primary Documentation: FBI-UAP-D043 (FD-302) and DOW-UAP-D176 (AARO MFR), PURSUE Release 07, war.gov  

---

## 1. Scene Breakdown & Frame Ranges

| Scene | Time (s) | Frame Range | Duration | VO Script Line / Word Cues | Visual Framing & Action | Kits & Components Used |
|---|---|---|---|---|---|---|
| **00** | 0.00 – 2.34 | `0 – 70` | 70f (2.33s) | *"Two federal agents watched a black triangle"* | Dusk hilltop, western ridge with orange afterglow. Two agent busts (Agent 1 binos raising, Agent 2 watching horizon). Black triangle begins rising over ridge treeline. Slam text. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Triangle`, `Agent`, `RecTag`, `Slam`, `Motes`) |
| **01** | 2.34 – 4.22 | `70 – 127` | 57f (1.90s) | *"rise over a ridge,"* | Tighter tracking shot on western ridge; matte triangle climbs vertically into sunset twilight gradient. Haze layer and drifting motes. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Triangle`, `Haze`, `Motes`), `lowpoly/kit` (`Pill`) |
| **02** | 4.22 – 5.91 | `127 – 177` | 50f (1.67s) | *"and it made no sound at all."* | Close-up on Agent 1 bust (scale 2.5, head tilted up, pupil constricted in shock, earpiece visible). FBI FD-302 typewriter quote strip pops in. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Agent`, `QuoteStrip`, `Motes`), `lowpoly/kit` (`Pill`) |
| **03** | 5.91 – 10.16 | `177 – 305` | 128f (4.27s) | *"Twenty twenty-six. A guarded hilltop post, eight twenty-three"* | Wide panoramic tracking crane of Observation Post 6 (mast, tripod, sandbags); two tactical figures sprinting across summit east-to-west. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `ObsPost`, `Figure`, `Motes`), `lowpoly/kit` (`Pill`) |
| **04** | 10.16 – 12.48 | `305 – 374` | 69f (2.30s) | *"p.m. A third agent's thermal scope"* | Observation Post 2: Source 3 holding thermal sensor rig, radio callout, speaking into tactical handset with glowing earpiece. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `ObsPost`, `Agent`, `Motes`), `lowpoly/kit` (`Pill`) |
| **05** | 12.48 – 13.64 | `374 – 409` | 35f (1.17s) | *"called it in. It"* | FLIR thermal monocular POV (white-hot mode). Target locked in crosshairs; uniform thermal signature, zero exhaust plume detected. | Custom HUD (`ThermalScopeView`), `lowpoly/kit` (`Pill`) |
| **06** | 13.64 – 15.69 | `409 – 471` | 62f (2.07s) | *"It climbed straight up for ten seconds."* | Wide vertical crane shot tracking pure vertical climb (200-300 ft). Matte delta rising dead level with no pitch or roll. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Triangle`, `Motes`), `lowpoly/kit` (`Pill`) |
| **07** | 15.69 – 18.13 | `471 – 544` | 73f (2.43s) | *"No tilt. No wobble. No lights."* | Macro graphic view of seamless featureless matte black surface. Zero rivets, zero lights. Three sequential kinetic stamp pills. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Triangle`, `Motes`), `lowpoly/kit` (`Pill`) |
| **08** | 18.13 – 21.22 | `544 – 637` | 93f (3.10s) | *"Then it stopped dead, and hung there for twenty seconds."* | Motionless stable hover in mid-air over the mountain ridge against twinkling stars. Digital stopwatch HUD counting up to 20 seconds. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Triangle`, `Motes`), Custom HUD (`HoverTimer`), `lowpoly/kit` (`Pill`) |
| **09** | 21.22 – 23.86 | `637 – 716` | 79f (2.63s) | *"But on that hilltop, they said, even a small"* | Two agents standing together on windy peak looking up in disbelief. Wind picking up motes. Slam text (cues.json twist). | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Agent`, `Slam`, `Motes`) |
| **10** | 23.86 – 26.09 | `716 – 783` | 67f (2.23s) | *"drone a mile away would be loud."* | Extreme close-up on Agent 2 (sweat drop, shock). Acoustic spectrum monitor at bottom flatlining at 0.0 dB. Official interview quote strip. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Agent`, `QuoteStrip`, `Motes`), Custom HUD (`AudioFlatline`) |
| **11** | 26.09 – 29.54 | `783 – 886` | 103f (3.43s) | *"From a dead stop, it shot sideways, fast as a fighter jet,"* | Hypersonic horizontal acceleration! The triangle snaps sideways with ghosting silhouettes, speed streaks, and whip-pan camera shake. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Triangle`, `Motes`), `lowpoly/kit` (`Pill`) |
| **12** | 29.54 – 31.76 | `886 – 953` | 67f (2.23s) | *"banked, and dove into a canyon."* | Sharp 60° bank angle into a terrain-hugging dive down between towering canyon cliffs. Camera swoops following dive angle. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Triangle`, `Motes`), `lowpoly/kit` (`Pill`) |
| **13** | 31.76 – 34.20 | `953 – 1026` | 73f (2.43s) | *"So fast it left the thermal scope's view."* | Thermal scope POV loses tracking lock as the craft's acceleration exceeds the sensor's maximum slew rate and field of view. | Custom HUD (`ThermalScopeView`), `lowpoly/kit` (`Pill`) |
| **14** | 34.20 – 35.98 | `1026 – 1079` | 53f (1.77s) | *"Still, total silence."* | Canyon rim falling into deep twilight shadow. Desert shrubs in evening calm. Zero impact signature, complete silence. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Shrub`, `Motes`), `lowpoly/kit` (`Pill`) |
| **15** | 35.98 – 37.77 | `1079 – 1133` | 54f (1.80s) | *"Next morning, they searched the canyon."* | Daylight transition (`morning={true}`); crisp blue-gold canyon floor with two ground survey figures walking with handheld gear. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Figure`, `Shrub`, `Motes`), `lowpoly/kit` (`Pill`) |
| **16** | 37.77 – 41.33 | `1133 – 1240` | 107f (3.57s) | *"No wreckage. No scarred ground. Not one damaged plant."* | Macro ground survey: pristine desert soil, undisturbed shrubs, zero scorch marks. Triple sequential verification stamps. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Shrub`, `Motes`), `lowpoly/kit` (`Pill`) |
| **17** | 41.33 – 47.45 | `1240 – 1424` | 184f (6.13s) | *"And the agents' own FBI statement says it lasted three seconds. The Pentagon's record: over thirty."* | Central contradiction dossier: dual document comparison cards (FBI FD-302 vs AARO Pentagon MFR). Agent looking at camera. Slam reveal text. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Agent`, `QuoteStrip`, `Slam`, `Motes`), Custom Dossier (`DocumentConflict`) |
| **18** | 47.45 – 52.30 | `1424 – 1569` | 145f (4.83s) | *"So who's right, the Pentagon, or the two federal agents?"* | Seamless loop ending! Camera pulls back to exact Scene 0 framing (`s=1.0, x=0, y=0`) while triangle re-emerges over the ridge. Slam question and source cards. | `AnimeNoirKit` (`Cam`, `Layer`, `DuskSky`, `Ridge`, `Triangle`, `Agent`, `Slam`, `Motes`), `lowpoly/kit` (`Pill`, `EndCard`) |

---

## 2. Technical Architecture & Rule Compliance

1. **Exact Frame Timing & Sync**:
   - Total frames: exactly `1569` (52.30 s @ 30 fps).
   - Cut boundaries `C` mapped from `cues.json` timestamps (`CS = [0.0, 2.34, 4.22, 5.91, 10.16, 12.48, 13.64, 15.69, 18.13, 21.22, 23.86, 26.09, 29.54, 31.76, 34.2, 35.98, 37.77, 41.33, 47.45]`).
   - Voice captions powered by `WordCaption` from `src/lowpoly/kit/Overlay.jsx`, synced word-for-word to `vo.json` at safe screen position `y=1310`.

2. **No Frozen Shots > 1.5s (45 frames)**:
   - Every single shot features active camera interpolation (`Cam from={{...}} to={{...}} d={d}`) using cubic easing.
   - Continuous particle kinematics via `Motes` drifting on frame `f`.
   - Character busts include deterministic natural breathing (`Math.sin(f * 0.11)`) and periodic blinking (`blink(f)`).
   - Full-body figures run and walk with active cyclic limb animation (`phase={f * 0.35}`).
   - The triangular craft features vertical lift, hypersonic acceleration, banking dives, and motion streaks.

3. **No Black Stretches > 1s (30 frames)**:
   - All transitions between scenes utilize `Dip inFrames={3}` (0.10s) or direct cuts, eliminating any prolonged dark intervals.
   - Global film grain and light-leak cut flares provided by `AnimeFinish leaks={C}`.

4. **Asset & Import Integrity**:
   - All relative imports verified against the repository structure (`../../kit/index.js` and `../../../animenoir/AnimeNoirKit.jsx`).
   - All font files (`LilitaOne-Regular.ttf`, `DMSerifDisplay-Italic.ttf`, `SpecialElite-Regular.ttf`, `Fredoka-Variable.ttf`) and grain textures (`grain0.png` through `grain3.png`) confirmed present in `PUBLIC_FILES.txt`.
   - Zero external network requests; self-contained, pure frame-deterministic rendering.
