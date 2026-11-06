"""Look-still batch for phoenix-lights-1997 (one GitHub stills run, many scenes; pattern from mh370 look_batch.py): the --stills list
carries JOB INDICES; each runs one scene in a child Blender at --lpct / --lspp with its own look frames and --nf.
Use (ONLY after the render hold lifts): STILLS=0,1,.. gh_blender.sh <name> scenes/phoenix-lights-1997/look_batch.py <n> <parts>"""
import sys, os, json, subprocess, shutil, glob, time
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index('--') + 1:]
def g(k, d=None):
    return argv[argv.index(k) + 1] if k in argv else d
OUT, ASSETS, ST = g('--out'), g('--assets'), g('--stills', '')
PCT, SPP = g('--lpct', '50'), g('--lspp', '16')
JOBS = [('b02_vee', '25,61', 77), ('b03_witness', '45,108', 135), ('b04_tapes', '25,61', 77), ('b05_capitol', '25,61', 77), ('b06_print', '29,71', 89), ('b07_scope', '41,98', 123), ('b08_eyepiece', '25,61', 77), ('b09_snowbird', '41,98', 123), ('b10_steady', '18,43', 54), ('b11_tenpm', '41,98', 123), ('b12_ridge', '48,116', 146), ('b13_behind', '56,136', 170), ('b14_drop', '45,108', 135), ('b15_pilot', '37,89', 112), ('b16_loop', '33,80', 100)]
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
