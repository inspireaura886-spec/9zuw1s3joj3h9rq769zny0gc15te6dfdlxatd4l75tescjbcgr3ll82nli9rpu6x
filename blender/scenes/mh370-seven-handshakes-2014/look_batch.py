"""Look-still batch for mh370 (one GitHub stills run, many scenes): the workflow's --stills list carries JOB INDICES
(not frames); each index runs one scene in a child Blender at --pct 50 / 16 spp with its own look frames and --nf,
then copies the PNGs to <out>/<scene>_<frame>.png (+ cine reports). Use: STILLS=0,1,..,13 gh_blender.sh <name>
scenes/mh370-seven-handshakes-2014/look_batch.py 14 7"""
import sys, os, json, subprocess, shutil, glob, time
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:]
def g(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT, ASSETS, ST = g('--out'), g('--assets'), g('--stills', '')
PCT, SPP = g('--lpct', '50'), g('--lspp', '16')
JOBS = [('b02_cruise', '30,100', 127), ('b03_atc', '50', 102), ('b04_console', '46', 93), ('b05_scope', '40,70', 91),
        ('b06_milradar', '37', 74), ('b08_strait', '20', 89), ('b09_dish', '28', 57), ('b10_sat', '30', 88),
        ('b11_globe', '80', 113), ('b12_ring7', '60', 120), ('b13_ocean', '60', 175), ('b14_beach', '20,110', 129),
        ('b15a_ship', '42', 84), ('b15b_seafloor', '54', 108)]
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
