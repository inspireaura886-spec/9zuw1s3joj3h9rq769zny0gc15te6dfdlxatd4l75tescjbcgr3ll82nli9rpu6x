# Build the GTA 6 clipping machine (gta/)
Goal: automatically turn GTA 6 gameplay into vertical Short clips (YouTube Shorts / X) for clip campaigns. GTA 6 launches 2026-11-19 (PS5/Xbox).
Take inspiration from existing open-source clippers instead of starting from zero; read their code with curl from GitHub and reuse what fits (respect licences, credit them in gta/README.md):
- cclank/jevclip (MIT, Python stdlib + ffmpeg, picks highlight moments with Jev; TYPESAFE_API_KEY env is available as the Jev key)
- misbahsy/jev-shorts-editor (MIT, macOS only: port only its decision logic)
- search GitHub for a popular open-source Twitch/stream auto-clipper (chat-spike or audio-spike highlight detection, vertical 9:16 reframe with facecam on top and gameplay below, burned captions) and borrow its approach.
Build, in gta/:
1. Source: given a list of channels in gta/sources.txt (Twitch VODs/clips, YouTube streams), fetch recent GTA 6 streams or clips with yt-dlp (no login). Start with an empty-safe sources.txt plus 3 example lines commented out.
2. Moment finder: audio loudness spikes + scene changes (+ Twitch chat spikes when available) to shortlist moments, then Jev to rank the best 3 per VOD. 20-45 s clips.
3. Edit: 1080x1920, 30 fps, facecam/gameplay split or centred crop, captions from whisper (faster-whisper tiny/base on CPU), -14 LUFS, no shake. Title + description text per clip, credit the streamer.
4. gta/run.sh: one command that does 1-3 and writes clips to gta/out/<date>/ (not committed; the workflow uploads them as artifacts).
5. Do NOT post anything anywhere: posting needs campaign approval and the user's payout account first. Only produce clips.
Test end to end on one short public clip (any public gaming stream clip if no GTA 6 footage exists yet) and report real numbers in tasks/RESULT.md. If a workflow is needed, put it in tasks/WORKFLOW_PATCH/ (Hark already added .github/workflows/gta-clip.yml which calls gta/run.sh).
