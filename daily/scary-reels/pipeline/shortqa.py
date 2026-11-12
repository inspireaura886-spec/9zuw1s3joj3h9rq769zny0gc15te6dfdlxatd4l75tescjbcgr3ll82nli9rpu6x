"""Final self-QA gate for IA Shorts (adapted 2026-10-21 from petergyang/video-short scripts/qa.py + eval.md, MIT).
usage: python3 shortqa.py VIDEO [OUTDIR] [--cuts t1,t2,...] [--jev]   (--jev: advisory Jev per-shot frame checks, needs JEV_API_KEY)
Measures the render and exports frames for the agent to LOOK AT (read_file) before scoring:
  OUTDIR/contact.jpg  (2 frames/s), OUTDIR/opening.jpg (first 3 s at 6 fps), OUTDIR/cuts/*.jpg (5 frames either side of each scene cut),
  OUTDIR/report.md (machine checks + the eval checklist to answer yes/no).
Exit 0 = every machine check passed (the visual/eval checks and the >= 7/10 harsh score are still required before posting)."""
import json, os, re, subprocess, sys

W, H, FPS, MAXDUR = 1080, 1920, 30, 59.0


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def main():
    args = [a for a in sys.argv[1:]]
    cuts = []
    use_jev = '--jev' in args
    if use_jev: args.remove('--jev')
    if '--cuts' in args:
        i = args.index('--cuts'); cuts = [float(x) for x in args[i + 1].split(',') if x]; del args[i:i + 2]
    if not args:
        sys.exit(__doc__)
    video = args[0]
    out = args[1] if len(args) > 1 else os.path.join(os.path.dirname(os.path.abspath(video)), 'qa')
    os.makedirs(os.path.join(out, 'cuts'), exist_ok=True)
    info = json.loads(run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,width,height,r_frame_rate,duration,bit_rate',
                           '-show_entries', 'format=duration', '-of', 'json', video]).stdout)
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    a = next((s for s in info['streams'] if s['codec_type'] == 'audio'), None)
    n, d = (int(x) for x in v['r_frame_rate'].split('/'))
    dur = float(info['format']['duration'])
    vdur = float(v.get('duration', dur)); adur = float(a.get('duration', 0)) if a else 0.0
    err = run(['ffmpeg', '-i', video, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr
    li = re.findall(r'I:\s+(-?[\d.]+)\s+LUFS', err); tp = re.findall(r'Peak:\s+(-?[\d.]+)\s+dBFS', err)
    lufs = float(li[-1]) if li else None; peak = float(tp[-1]) if tp else None
    # dark-frame scan: YAVG < 45 for > 0.2 s (IA rule) plus ffmpeg blackdetect
    y = run(['ffmpeg', '-i', video, '-vf', 'signalstats,metadata=print:key=lavfi.signalstats.YAVG', '-an', '-f', 'null', '-']).stderr
    vals = [float(x) for x in re.findall(r'YAVG=([\d.]+)', y)]
    dark, start = [], None
    for k, val in enumerate(vals + [255]):
        if val < 45 and start is None: start = k
        if val >= 45 and start is not None:
            if (k - start) / FPS > 0.2: dark.append((start / FPS, k / FPS))
            start = None
    # frozen stretches (no change for > 1.5 s)
    fz = run(['ffmpeg', '-i', video, '-vf', 'freezedetect=n=0.003:d=1.5', '-an', '-f', 'null', '-']).stderr
    frozen = re.findall(r'freeze_start: ([\d.]+)', fz)
    checks = [
        ('Size is 1080x1920', v['width'] == W and v['height'] == H, f"{v['width']}x{v['height']}"),
        ('Frame rate is 30', n / d == FPS, f'{n / d:g} fps'),
        (f'Length <= {MAXDUR} s (motto)', dur <= MAXDUR, f'{dur:.2f} s'),
        ('Has audio', a is not None, 'yes' if a else 'none'),
        ('Audio and video lengths match within 2 frames', abs(vdur - adur) <= 2 / FPS, f'video {vdur:.3f}, audio {adur:.3f}'),
        ('Loudness -15 to -13 LUFS', lufs is not None and -15 <= lufs <= -13, f'{lufs} LUFS'),
        ('True peak <= -1.0 dBFS', peak is not None and peak <= -1.0, f'{peak} dBFS'),
        ('No dark stretch (YAVG<45 > 0.2 s)', not dark, ', '.join(f'{s:.2f}-{e:.2f}s' for s, e in dark) or 'none'),
        ('No frozen stretch > 1.5 s', not frozen, ', '.join(frozen) or 'none'),
        ('Video bitrate >= 6 Mbps (full-quality master)', int(v.get('bit_rate', 0) or 0) >= 6_000_000, f"{int(v.get('bit_rate', 0) or 0) / 1e6:.1f} Mbps"),
    ]
    # HUMANE CAPTION COLOURS (user 2026-11-03): fail on yellow AI-template caption/tag colours in the text bands.
    _pc = run(['python3', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools', 'palette_check.py'), video])
    checks.append(('No yellow/red template caption colours (tools/palette_check.py)', _pc.returncode == 0, (_pc.stdout.strip().splitlines() or ['?'])[-1][:160]))
    # NO SHAKE gate (user 2026-11-02 14:30; Tehran 1976 shook = 1098 osc frames). >300 fails; 100-300 = look at frame strips.
    _sk = run(['python3', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools', 'shake_check.py'), video, '/tmp/shakeqa'])
    try:
        import json as _j; _sv = _j.loads(_sk.stdout.strip().splitlines()[-1]); _of = _sv['osc_frames']
    except Exception:
        _of = -1
    checks.append(('No camera shake/wobble (tools/shake_check.py, osc_frames <= 300)', 0 <= _of <= 300, f'osc_frames={_of}'))
    # EXPOSURE gate (escapement exposure_check, adopted 2026-11-11): per-shot clipping / washed blacks; >2 bad shots fails.
    _ex = run(['python3', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools', 'shot_exposure.py'), video, ','.join(f'{c:.3f}' for c in cuts)])
    try:
        import json as _j2; _ev = _j2.loads(_ex.stdout.strip().splitlines()[-1])
    except Exception:
        _ev = {'ok': False, 'hard_fail': -1, 'shots': 0}
    checks.append(('Exposure per shot (tools/shot_exposure.py: no clipping, no washed blacks, <= 2 bad shots)', bool(_ev.get('ok')), f"{_ev.get('hard_fail')} of {_ev.get('shots')} shots hard-fail"))
    run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-vf', f'fps=2,scale=216:384,tile=8x{int(dur * 2 / 8) + 1}', '-frames:v', '1', os.path.join(out, 'contact.jpg')])
    run(['ffmpeg', '-v', 'error', '-y', '-t', '3', '-i', video, '-vf', 'fps=6,scale=270:480,tile=6x3', '-frames:v', '1', os.path.join(out, 'opening.jpg')])
    for t in cuts:
        run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t - 5 / FPS):.3f}', '-i', video, '-vf', 'scale=162:288,tile=10x1', '-frames:v', '1',
             os.path.join(out, 'cuts', f'cut_{t:.2f}.jpg')])
    L = [f'# Short QA: {os.path.basename(video)}', '']
    L += [f"- [{'x' if ok else ' '}] {nm}: {dt}" for nm, ok, dt in checks]
    # --jev: advisory per-shot frame checks by Jev (tools/jev.py frames). Never changes the exit code; skipped without JEV_API_KEY.
    if use_jev:
        jp = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'tools', 'jev.py'))
        jr = run([sys.executable, jp, 'frames', video, ','.join(f'{c:.3f}' for c in cuts), os.path.join(out, 'jev')])
        try: jv = json.loads(jr.stdout.strip().splitlines()[-1])
        except Exception: jv = {'ok': False, 'error': (jr.stderr or '?')[-200:]}
        json.dump(jv, open(os.path.join(out, 'jev_frames.json'), 'w'), indent=1)
        if jv.get('skipped'): L.append('- [i] Jev frame checks: skipped (JEV_API_KEY not set)'); print('WARNING: --jev skipped, JEV_API_KEY not set', file=sys.stderr)
        elif not jv.get('ok'): L.append(f"- [i] Jev frame checks: error {jv.get('error', '')[:120]}")
        else: L.append(f"- [i] Jev frame checks (advisory): {jv['checked']} shots, flagged {jv['flagged_shots'] or 'none'} (readable/exposure, caption box in x 162-918 / y<=1560), mean visual interest {jv['mean_interest']}/10")
    L += ['', 'LOOK at contact.jpg, opening.jpg and cuts/*.jpg, then answer every check yes/no; fix any no before scoring:',
          '1. Hook lands in the first 3 s, and the opening makes sense with the sound off (opening.jpg).',
          '2. The Short answers (or squarely poses) the question its hook raises; the ending question names only theories explained earlier.',
          '3. Every shot moves (camera or subject); no static slide or repeated filler prop/slab between scenes.',
          '4. Each visual shows something the words do not already say (not just a picture of the noun).',
          '5. Every line of on-screen text is whole: nothing clipped at a frame edge, nothing outside x 90-990 / y 230-1480.',
          '6. Every number, name and date on screen is one the narration says or the source shows.',
          '7. Every cut lands on the right word; no blank, frozen or stretched frames around cuts (cuts/*.jpg).',
          '8. Captions: max 3 words / 18 chars per chunk, split at punctuation and pauses, word-exact timing from the voice word timestamps, y <= 1480; emphasis box only on a rare name, number or main claim.',
          '9. Text and details readable at phone size (contact.jpg tiles are ~phone-thumbnail scale).',
          '10. Sources on screen; no realistic AI faces/imagery (AI_TAG=false).',
          'Then give the harsh score (hook, clarity, animation, overall). Post only at >= 7/10.']
    open(os.path.join(out, 'report.md'), 'w').write('\n'.join(L) + '\n')
    print('\n'.join(L)); print(f'\nfiles in {out}')
    sys.exit(0 if all(ok for _, ok, _ in checks) else 1)


if __name__ == '__main__':
    main()
