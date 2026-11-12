"""AYGRAMM TECHNIQUES 2026-10-23: verify the master with ffmpeg loudnorm (EBU R128 measure pass).
usage: python3 master_check.py <final.mp4|wav>   -> exit 0 when -14 +/- 0.5 LUFS integrated AND true peak <= -1.0 dBTP, else exit 1.
If it fails: re-run mix_story_audio.py (it targets -14 / limiter -1.6), then remux the audio without re-encoding the picture
(ffmpeg -i video.mp4 -i raw/final_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k out.mp4)."""
import sys, json, subprocess
r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', sys.argv[1], '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(r[r.rindex('{'):r.rindex('}') + 1]); I = float(j['input_i']); TP = float(j['input_tp']); LRA = float(j['input_lra'])
ok = abs(I + 14) <= 0.5 and TP <= -1.0
print(f'loudnorm: I {I:.1f} LUFS, TP {TP:.1f} dBTP, LRA {LRA:.1f} -> {"PASS" if ok else "FAIL"}')
sys.exit(0 if ok else 1)
