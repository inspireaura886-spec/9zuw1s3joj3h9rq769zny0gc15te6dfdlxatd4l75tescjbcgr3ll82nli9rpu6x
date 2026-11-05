"""b02 (WIDE 24 mm, 'from Alcatraz'): the island and its cellhouse across the dark bay, lighthouse sweeping, SF glow beyond. Slow crane up."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 105, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.26)
sea_night(NF, moon_dir=(0.5, 0.8, 0.28), moon=1.5, half=1800, wave_scale=0.8)
island(NF)
sf_lights(center=(1400, 1500, 10), radius=1300, n=1100, seed=3)
CN.haze(center=(0, 0, 25), size=(1300, 1300, 70), density=0.0011, color=(0.7, 0.78, 0.95), anisotropy=0.5, noise=0.3, noise_scale=0.01, height_falloff=0.4)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.crane((-430, -380, 16), (0, 0, 18), dz=22, dlook=2), lens=24, fstop=9, focus=620.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.19)
