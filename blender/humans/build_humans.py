"""Build the IA REAL3D human characters (WITNESS + PILOT) with MPFB 2 (MakeHuman Plugin For Blender, GPL code used
only as a build tool) and the CC0 MakeHuman system assets. Run once on GitHub (workflow ia-blender, stills mode):

    STILLS=0 bash R/gh_blender.sh humans-build humans/build_humans.py 1 1

The workflow calls this with --factory-startup, so this wrapper (1) downloads MPFB v2.0.18 + the CC0 system asset
pack, (2) installs MPFB as a Blender extension in a child process, (3) runs _mpfb_build.py in a child Blender that
loads the user prefs (MPFB enabled), which saves humans.blend (both characters, textures packed) + preview PNGs into
--out. The workflow uploads the PNGs and humans.blend; copy humans.blend to R/blender/humans/humans.blend.
Render scenes never need MPFB: kit/humans.py appends the characters from humans.blend.
"""
import bpy, os, sys, subprocess, urllib.request, zipfile, tarfile, io, shutil, time, json

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[argv.index('--out') + 1] if '--out' in argv else os.path.abspath('frames')
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
BL = bpy.app.binary_path
W = os.path.expanduser('~/mpfb_build')
os.makedirs(W, exist_ok=True)
MPFB_TAG = 'v2.0.18'
MPFB_URL = 'https://codeload.github.com/makehumancommunity/mpfb2/tar.gz/refs/tags/' + MPFB_TAG
ASSETS_URL = 'http://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip'
# only the CC0 system assets the two characters use (licence checked per asset in packs/makehuman_system_assets.json)
USE = ['skins/young_caucasian_male2', 'skins/middleage_caucasian_male', 'eyes/high-poly', 'eyes/materials',
       'eyebrows/eyebrow001', 'eyebrows/eyebrow010', 'eyelashes/eyelashes01', 'hair/short02', 'hair/short04',
       'clothes/male_casualsuit05', 'clothes/male_elegantsuit01', 'clothes/shoes01', 'clothes/shoes04', 'packs']
T0 = time.time()


def get(url, dst):
    if os.path.exists(dst) and os.path.getsize(dst) > 0:
        return dst
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'ia-real3d/1.0'}), timeout=300) as r:
                open(dst + '.tmp', 'wb').write(r.read())
            os.replace(dst + '.tmp', dst)
            print('IA3D got', url, os.path.getsize(dst), flush=True)
            return dst
        except Exception as e:
            print('retry', url, e, flush=True)
            time.sleep(5 * (k + 1))
    raise RuntimeError('download failed ' + url)


# 1. MPFB source -> extension zip (manifest at zip root)
tgz = get(MPFB_URL, os.path.join(W, 'mpfb.tgz'))
src = os.path.join(W, 'mpfb_src')
if not os.path.isdir(src):
    with tarfile.open(tgz) as t:
        t.extractall(src)
pkg = [os.path.join(src, d, 'src', 'mpfb') for d in os.listdir(src)][0]
ezip = os.path.join(W, 'mpfb-%s.zip' % MPFB_TAG)
if not os.path.exists(ezip):
    with zipfile.ZipFile(ezip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk(pkg):
            for f in files:
                p = os.path.join(root, f)
                z.write(p, os.path.relpath(p, pkg))
r = subprocess.run([BL, '-b', '--command', 'extension', 'install-file', '--repo', 'user_default', '--enable', ezip],
                   capture_output=True, text=True)
print('IA3D install rc', r.returncode, r.stdout[-1500:], r.stderr[-1500:], flush=True)

# 2. CC0 system assets -> MPFB user data dir (extension_path_user of bl_ext.user_default.mpfb)/data
az = get(ASSETS_URL, os.path.join(W, 'sysassets.zip'))
cfg = bpy.utils.resource_path('USER')
udata = os.path.join(cfg, 'extensions', '.user', 'user_default', 'mpfb', 'data')
os.makedirs(udata, exist_ok=True)
with zipfile.ZipFile(az) as z:
    for n in z.namelist():
        if any(n.startswith(u + '/') for u in USE) and not n.endswith('/'):
            z.extract(n, udata)
print('IA3D assets in', udata, sorted(os.listdir(udata)), flush=True)
lic = json.load(open(os.path.join(udata, 'packs', 'makehuman_system_assets.json')))

# 3. build in a child Blender with user prefs (MPFB enabled)
env = dict(os.environ, IA_HUM_OUT=OUT, IA_HUM_UDATA=udata, IA_HUM_PKG=pkg)
r = subprocess.run([BL, '-b', '-noaudio', '-P', os.path.join(HERE, '_mpfb_build.py')], capture_output=True, text=True,
                   env=env)
log = r.stdout + '\n' + r.stderr
open(os.path.join(OUT, 'build_log.txt'), 'w').write(log)
print('\n'.join(l for l in log.splitlines() if 'IA3D' in l or 'Error' in l or 'Traceback' in l or 'rror:' in l)[-6000:],
      flush=True)
print('IA3D build rc', r.returncode, flush=True)
used = {}
for u in USE:
    k = u.split('/')[-1]
    if k in lic:
        used[k] = lic[k]['license']
json.dump({'mpfb': MPFB_TAG, 'assets_used_license': used}, open(os.path.join(OUT, 'build_info.json'), 'w'), indent=1)
pngs = [f for f in os.listdir(OUT) if f.endswith('.png')]
if not pngs:  # workflow needs a PNG; write a tiny black one so the log/blend still upload
    img = bpy.data.images.new('fail', 8, 8)
    img.filepath_raw = os.path.join(OUT, '00000.png')
    img.file_format = 'PNG'
    img.save()
json.dump({'frames': 1, 'render_s': round(time.time() - T0, 1), 'wall_s': round(time.time() - T0, 1)},
          open(os.path.join(OUT, 'timing.json'), 'w'))
print('IA3D done', os.listdir(OUT), flush=True)
