"""mccormick b03 (L3 'found in a Missouri cornfield. Cause of death: undetermined.'): night cornfield, light ground fog,
low eased dolly down a furrow to an EMPTY patch of flattened stalks (no body, no figure), then a slow crane up over it."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 150, int)
sc = core.reset()
setup(sc, exposure=1.15, vol=True, glare=0.55, vignette=0.42, lift=(0.98, 1.0, 1.07), gain=(1.02, 1.0, 0.96))
Wd.hdri('qwantani_night', strength=0.10, bg_strength=0.30, rot=160, tint=(0.75, 0.85, 1.1))
Wd.moon(direction=(0.15, 0.95, 0.22), strength=1.3, color=(0.62, 0.72, 1.0))        # moon AHEAD: leaves rim-lit
Wd.area('Fill', (0, -6, 6), (0, 10, 0), color=(0.5, 0.6, 0.85), power=900, size=12)   # soft sky fill from behind
soil(size=(30, 80), center=(0, 25, 0))
CL = (0.0, 15.5, 1.7)
cornfield(rows=(-9, 8), y=(-3, 55), lane=0.0, clearing=CL, flattened=(CL[0], CL[1], 1.2), seed=11)
Wd.fog(center=(0, 20, 0.9), size=(30, 60, 2.4), density=0.035, color=(0.72, 0.78, 0.95), anisotropy=0.5,
       noise=0.45, noise_scale=0.25, height_falloff=1.6)
cut = int(NF * 0.56)
cam = C.Cam()
cam.shot(0, cut, C.dolly((0.0, 0.5, 1.12), (0.0, 7.2, 1.02), look=(0.0, 16.0, 0.55), look1=(0.0, 15.6, 0.25)),
         lens=(30, 33), fstop=4.0, focus=(0, 13, 0.6))
cam.shot(cut, NF, C.crane((2.6, 11.8, 1.35), (0.0, 15.5, 0.05), dz=1.1, dlook=0.0), lens=(32, 30), fstop=5.6,
         focus=(0, 15.5, 0.05))
finish_cam(cam, NF, a, sc)
