"""Look-still batch for jimmy-hoffa: one GitHub stills run, many scenes (job indices in --stills). Same as mh370 look_batch."""
import sys, os, json, subprocess, shutil, glob, time
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:]
def g(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT, ASSETS, ST = g('--out'), g('--assets'), g('--stills', '')
PCT, SPP = g('--lpct', '50'), g('--lspp', '16')
JOBS = [('h02_lot', '40', 96), ('h03_diner', '30,75', 81), ('h04_phone', '40', 116), ('h05_cargone', '50', 104),
        ('h06_garage', '60', 125), ('h07_court', '45', 99), ('h08_court2', '45', 94), ('h09_lab', '50', 101),
        ('h10_field', '60', 122), ('h11_bridge', '45', 91), ('h12_radar', '45', 94)]
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
