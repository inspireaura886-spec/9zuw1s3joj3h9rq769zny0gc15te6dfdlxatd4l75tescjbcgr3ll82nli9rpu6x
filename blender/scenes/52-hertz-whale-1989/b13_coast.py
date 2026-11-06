"""52hz b13_coast (WIDE 24 mm, eased dolly; VO 'Then, in twenty ten, sensors off California heard the same strange song'). Dusk sea off a dark coastline; an instrument buoy light blinks; slow dolly toward it. Chip "2010, off California".
NF default 144 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.24)
dawn_world(sun_az=250, elev=5, strength=3.0, hdri_strength=0.8)
swell_ocean(NF, half=3000, wave_scale=1.2, wind=10, color=(0.008, 0.018, 0.024))
Wd.terrain('Coast', size=3000, res=120, height=140, scale=0.0016, center=(600, 2400, -20), seed=4,
           mat=M.principled('CoastM', base=(0.05, 0.05, 0.045), rough=0.9))
b = buoy('Buoy', (20, 140, 0.2))
lm = bpy.data.materials['BuoyLampM']
key_strength(lm, [(0, 30.0), (10, 30.0), (12, 0.0), (40, 0.0), (42, 30.0), (60, 30.0), (62, 0.0), (90, 0.0), (92, 30.0), (NF, 30.0)])
CN.haze(center=(0, 600, 30), size=(3000, 3000, 80), density=0.0008, color=(1.0, 0.85, 0.75), anisotropy=0.6, noise=0.2, height_falloff=0.6)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-30, -60, 6), (-22, -36, 5.4), look=(20, 140, 2.0), look1=(20, 140, 1.6)), lens=28, fstop=8, focus=180.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
