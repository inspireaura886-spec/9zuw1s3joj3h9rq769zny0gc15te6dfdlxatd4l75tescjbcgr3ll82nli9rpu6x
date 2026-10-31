#!/bin/bash
# automated Short QA: specs, freeze, dark, loudness, silence, contact sheet
F=$1; O=$2; mkdir -p $O
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,nb_frames,pix_fmt -of json $F > $O/specs.json
ffmpeg -hide_banner -i $F -vf "freezedetect=n=0.003:d=1.5,blackdetect=d=1.0:pix_th=0.08" -af "ebur128=peak=true,silencedetect=n=-45dB:d=0.8" -f null - 2> $O/raw.log
python3 - "$O" <<'PY'
import json,re,sys
o=sys.argv[1]; log=open(o+'/raw.log').read(); s=json.load(open(o+'/specs.json'))
v=[x for x in s['streams'] if x.get('width')][0]; a=[x for x in s['streams'] if not x.get('width')]
dur=float(s['format']['duration']); issues=[]
if (v['width'],v['height'])!=(1080,1920): issues.append(f"resolution {v['width']}x{v['height']}")
if v['r_frame_rate'] not in ('30/1','30000/1001'): issues.append('fps '+v['r_frame_rate'])
if v.get('pix_fmt')!='yuv420p': issues.append('pix_fmt '+str(v.get('pix_fmt')))
if not a: issues.append('no audio')
if dur>180: issues.append(f'duration {dur:.1f}s > 180')
fr=re.findall(r'freeze_start: ([\d.]+).*?freeze_duration: ([\d.]+)',log,re.S)
bl=re.findall(r'black_start:([\d.]+) black_end:([\d.]+) black_duration:([\d.]+)',log)
si=re.findall(r'silence_start: ([\d.]+).*?silence_duration: ([\d.]+)',log,re.S)
I=re.findall(r'I:\s+(-?[\d.]+) LUFS',log); P=re.findall(r'Peak:\s+(-?[\d.]+) dBFS',log)
lufs=float(I[-1]) if I else None; peak=float(P[-1]) if P else None
for t,d in fr: issues.append(f'freeze {float(t):.2f}s for {float(d):.2f}s')
for t,e,d in bl: issues.append(f'dark {float(t):.2f}-{float(e):.2f}s')
for t,d in si: issues.append(f'silence {float(t):.2f}s for {float(d):.2f}s')
if lufs is not None and not (-17<=lufs<=-11): issues.append(f'loudness {lufs} LUFS (target -14)')
if peak is not None and peak>-1.0: issues.append(f'true peak {peak} dBFS > -1')
r={'pass':not issues,'duration':dur,'frames':v.get('nb_frames'),'lufs':lufs,'true_peak':peak,'issues':issues}
json.dump(r,open(o+'/qa.json','w'),indent=1); print(json.dumps(r,indent=1))
PY
D=$(python3 -c "import json;print(json.load(open('$O/specs.json'))['format']['duration'])")
for i in $(seq 0 11); do ffmpeg -v error -y -ss $(python3 -c "print($D*($i+0.5)/12)") -i $F -frames:v 1 -vf scale=270:-1 $O/f$i.jpg; done
montage $O/f*.jpg -tile 6x2 -geometry +4+4 $O/contact.jpg && rm $O/f*.jpg
