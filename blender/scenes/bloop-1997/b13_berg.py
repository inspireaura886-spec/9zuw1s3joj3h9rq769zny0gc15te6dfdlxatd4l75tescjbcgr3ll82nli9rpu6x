"""bloop-1997 b13_berg (WIDE 24 mm, crane up; VO 'Tracking one giant iceberg as it broke apart, they heard the Bloops twin again and again.').
3D: a giant tabular iceberg breaking into pieces in open sea (illustrative of iceberg A53a, 2008, near South Georgia); chip "iceberg A53a, 2008"
NF default 191 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 191, int)
random.seed(13)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
dawn_world(sun_az=200, elev=5, strength=3.0, hdri_strength=0.8)
swell_ocean(NF, half=3000, wave_scale=0.8, wind=8, color=(0.008, 0.02, 0.03))
ice = M.principled('BergM', base=(0.82, 0.9, 0.96), rough=0.35, sss=0.25, rough_noise=0.2)
for k, (x, y, rz) in enumerate(((0, 120, 0), (70, 140, 12), (-60, 150, -9), (30, 200, 20))):
    p = megalith('Berg%d' % k, (x, y, 6), (60, 40, 20), ice, rz=rz, bev=1.0, rough=1.5)
    for f, dx in ((0, 0), (NF, (x / 20.0))):
        p.location.x = x + dx
        p.keyframe_insert('location', frame=f)
ice_floes(40, 260)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((-80, -120, 8), (0, 140, 6), dz=40, dlook=-6), lens=24, fstop=8, focus=200.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
