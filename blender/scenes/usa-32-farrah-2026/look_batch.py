"""Look-still batch for usa-32-farrah-2026 (copied from the omaha look_batch) (one GitHub stills run, many scenes): the workflow's --stills list carries JOB INDICES
(not frames); each index runs one scene in a child Blender at --pct 50 / 16 spp with its own look frames and --nf,
then copies the PNGs to <out>/<scene>_<frame>.png (+ cine reports). Use: STILLS=0,1,..,14 gh_blender.sh <name>
scenes/usa-32-farrah-2026/look_batch.py 15 8"""
import sys, os, json, subprocess, shutil, glob, time
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:]
def g(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT, ASSETS, ST = g('--out'), g('--assets'), g('--stills', '')
PCT, SPP = g('--lpct', '50'), g('--lspp', '16')
JOBS = [('b01_artifact', '62', 100), ('b02_shatter', '70', 112), ('b03_tracking', '100', 123), ('b04_altitude', '47', 77), ('b05_nocause', '62', 100), ('b06_name', '55', 89), ('b07_launch', '83', 135), ('b08_farrah', '83', 135), ('b09_actress', '55', 89), ('b10_shotdown', '90', 181), ('b11_battery', '120', 169), ('b12_debris', '80', 112), ('b13_busy', '62', 100), ('b14_cloud', '90', 146), ('b15_loop', '46', 75)]
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
