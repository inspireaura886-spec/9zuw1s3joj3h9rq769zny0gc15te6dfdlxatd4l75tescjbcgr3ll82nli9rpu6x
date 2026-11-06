"""Look-still batch for mars-methane-spikes-curiosity-2014 (code batch 2026-11-05; copied from mh370 look_batch.py). One GitHub stills run,
many scenes: --stills carries JOB INDICES. Use (when the render hold is lifted): STILLS=0,..,15 gh_blender.sh <name>
scenes/mars-methane-spikes-curiosity-2014/look_batch.py 16 8"""
import sys, os, json, subprocess, shutil, glob, time
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:]
def g(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT, ASSETS, ST = g('--out'), g('--assets'), g('--stills', '')
PCT, SPP = g('--lpct', '50'), g('--lspp', '16')
JOBS = [('b01_graph', '6,112', 225), ('b02_crater', '6,26', 52), ('b03_trace', '6,84', 168), ('b04_spike', '6,21', 42), ('b05_orbiter', '6,72', 144), ('b06_nothing', '6,21', 42), ('b07_wheels', '6,89', 179), ('b08_real', '6,26', 52), ('b09_june', '6,55', 110), ('b10_ppb', '6,26', 52), ('b11_pass', '6,32', 64), ('b12_sol', '6,101', 202), ('b13_night', '6,21', 42), ('b14_day', '6,37', 75), ('b15_planet', '6,101', 202), ('b16_fast', '6,49', 98)]
os.makedirs(OUT, exist_ok=True)
tim = []
for idx in [int(x) for x in ST.split(',') if x.strip()]:
    sc, fr, nf = JOBS[idx]
    sub = os.path.join(OUT, '_' + sc)
    os.makedirs(sub, exist_ok=True)
    t0 = time.time()
    cmd = [bpy.app.binary_path, '-b', '--factory-startup', '-noaudio', '-P', os.path.join(HERE, sc + '.py'), '--',
           '--start', '0', '--end', '0', '--out', sub, '--assets', ASSETS, '--stills', fr, '--pct', PCT, '--samples', SPP,
           '--nf', str(nf)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    log = (r.stdout + r.stderr).splitlines()
    keep = [l for l in log if 'Sample' not in l and 'Path Tracing' not in l]
    open(os.path.join(OUT, sc + '_log.txt'), 'w').write('\n'.join(keep[-250:]))
    print('\n'.join(keep[-60:]), flush=True)
    for p in glob.glob(os.path.join(sub, '*.png')):
        shutil.copy(p, os.path.join(OUT, '%s_%s' % (sc, os.path.basename(p))))
    for p in glob.glob(os.path.join(sub, '*.txt')):
        shutil.copy(p, os.path.join(OUT, os.path.basename(p)))
    tim.append({'scene': sc, 'wall_s': round(time.time() - t0, 1), 'rc': r.returncode})
    shutil.rmtree(sub, ignore_errors=True)
json.dump({'frames': len(tim), 'render_s': sum(t['wall_s'] for t in tim), 'wall_s': sum(t['wall_s'] for t in tim),
           'jobs': tim}, open(os.path.join(OUT, 'timing.json'), 'w'))
print('LOOKBATCH', json.dumps(tim), flush=True)
