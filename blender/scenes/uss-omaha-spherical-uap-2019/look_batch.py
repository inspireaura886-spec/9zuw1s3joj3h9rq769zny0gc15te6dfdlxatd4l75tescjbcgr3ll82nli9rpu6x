"""Look-still batch for uss-omaha-spherical-uap-2019 (copied from mh370 look_batch) (one GitHub stills run, many scenes): the workflow's --stills list carries JOB INDICES
(not frames); each index runs one scene in a child Blender at --pct 50 / 16 spp with its own look frames and --nf,
then copies the PNGs to <out>/<scene>_<frame>.png (+ cine reports). Use: STILLS=0,1,..,15 gh_blender.sh <name>
scenes/uss-omaha-spherical-uap-2019/look_batch.py 16 8"""
import sys, os, json, subprocess, shutil, glob, time
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:]
def g(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT, ASSETS, ST = g('--out'), g('--assets'), g('--stills', '')
PCT, SPP = g('--lpct', '50'), g('--lspp', '16')
JOBS = [('b01_artifact', '56', 112), ('b02_pentagon', '44', 89), ('b03_sea_night', '39', 78), ('b04_thermal', '62', 124), ('b05_glide', '62', 124), ('b06_cic', '62', 124), ('b07_screen_vs', '50', 101), ('b08_sub', '79', 158), ('b09_seafloor', '44', 89), ('b10_size', '62', 124), ('b11_hour', '56', 112), ('b12_pentagon_night', '67', 135), ('b13_taskforce', '56', 112), ('b14_surface', '33', 66), ('b15_empty', '33', 66), ('b16_loop', '37', 75)]
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
