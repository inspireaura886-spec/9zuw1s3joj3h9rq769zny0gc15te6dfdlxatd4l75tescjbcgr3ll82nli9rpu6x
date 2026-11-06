"""Look-still batch for andree-balloon-1897 (one GitHub stills run, many scenes; pattern from mh370 look_batch.py): the --stills list
carries JOB INDICES; each runs one scene in a child Blender at --lpct / --lspp with its own look frames and --nf.
Use (ONLY after the render hold lifts): STILLS=0,1,.. gh_blender.sh <name> scenes/andree-balloon-1897/look_batch.py <n> <parts>"""
import sys, os, json, subprocess, shutil, glob, time
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:]
def g(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT, ASSETS, ST = g('--out'), g('--assets'), g('--stills', '')
PCT, SPP = g('--lpct', '50'), g('--lspp', '16')
JOBS = [('b02_drift', '22,52', 66), ('b03_danes', '52,126', 158), ('b04_aloft', '29,71', 89), ('b05_route', '22,52', 66), ('b06_kvitoya', '64,154', 193), ('b07_camp', '41,98', 123), ('b08_ship2', '64,154', 193), ('b09_darkroom', '25,61', 77), ('b10_crash', '41,98', 123), ('b11_trek', '45,108', 135), ('b12_floe', '37,89', 112), ('b13_island', '37,89', 112), ('b14_question', '29,71', 89), ('b15_loop', '14,35', 44)]
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
