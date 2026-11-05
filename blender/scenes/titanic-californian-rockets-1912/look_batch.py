"""Look-still batch for titanic-californian-rockets-1912: one GitHub stills run, many plates (job indices in --stills).
Each index runs plates.py --plate <name> in a child Blender at --lpct / --lspp. Use:
STILLS=0,1,2,... bash R/gh_blender.sh <name> scenes/titanic-californian-rockets-1912/look_batch.py 16 8"""
import sys, os, json, subprocess, shutil, glob, time
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:]
def g(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT, ASSETS, ST = g('--out'), g('--assets'), g('--stills', '')
PCT, SPP = g('--lpct', '50'), g('--lspp', '16')
JOBS = [('b01_bridge', '30', 68), ('b02_horizon', '25', 54), ('b03_sky', '50', 106), ('b04_steamer_ice', '70', 160),
        ('b05_iceaerial', '20', 61), ('b06_cabin', '35', 71), ('b07_bunk', '18', 37), ('b08_bridge2', '70', 150),
        ('b09_eight', '40', 63), ('b10_lamp', '30', 85), ('b11_bridge_lamp', '30', 93), ('b12_corridor', '50', 107),
        ('b13_dawn', '35', 73), ('b14_room', '80', 182), ('b15a_chart', '50', 104), ('b15b_empty', '50', 122)]
os.makedirs(OUT, exist_ok=True)
tim = []
for idx in [int(x) for x in ST.split(',') if x.strip()]:
    sc, fr, nf = JOBS[idx]
    sub = os.path.join(OUT, '_' + sc)
    os.makedirs(sub, exist_ok=True)
    t0 = time.time()
    cmd = [bpy.app.binary_path, '-b', '--factory-startup', '-noaudio', '-P', os.path.join(HERE, 'plates.py'), '--',
           '--start', '0', '--end', '0', '--out', sub, '--assets', ASSETS, '--stills', fr, '--pct', PCT, '--samples', SPP,
           '--nf', str(nf), '--plate', sc]
    r = subprocess.run(cmd, capture_output=True, text=True)
    log = (r.stdout + r.stderr).splitlines()
    keep = [l for l in log if 'Sample' not in l and 'Path Tracing' not in l]
    open(os.path.join(OUT, sc + '_log.txt'), 'w').write('\n'.join(keep[-250:]))
    print(sc, 'rc', r.returncode, '\n'.join(keep[-25:]), flush=True)
    for p in glob.glob(os.path.join(sub, '*.png')):
        shutil.copy(p, os.path.join(OUT, '%s_%s' % (sc, os.path.basename(p))))
    for p in glob.glob(os.path.join(sub, '*.txt')):
        shutil.copy(p, os.path.join(OUT, os.path.basename(p)))
    tim.append({'scene': sc, 'wall_s': round(time.time() - t0, 1), 'rc': r.returncode})
    shutil.rmtree(sub, ignore_errors=True)
json.dump({'frames': len(tim), 'render_s': sum(t['wall_s'] for t in tim), 'wall_s': sum(t['wall_s'] for t in tim),
           'jobs': tim}, open(os.path.join(OUT, 'timing.json'), 'w'))
print('LOOKBATCH', json.dumps(tim), flush=True)
