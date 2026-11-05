"""b15b (WIDE 28 mm, 'drowned', cold bay water): grey-blue dawn water of the bay with faint glowing current lines drawing across it. Slow low glide forward."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 55, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.3)
CN.hdri_sun('qwantani_dawn_puresky', sun_az=70, strength=0.5, tint=(0.7, 0.8, 1.0))
CN.sun(elev=6, az=70, warmth=(0.72, 0.84, 1.0), strength=0.9, check=False)
Wd.sea_plane(size=60000, z=-0.6, color=(0.014, 0.03, 0.04), rough=0.3, wave=0.1, frames=max(NF, 60))
Wd.ocean_wide(center=(0, 0, 0), half=1500, wave_scale=0.45, choppy=0.7, wind=8, time_frames=max(NF, 60), color=(0.018, 0.034, 0.045), rough=0.12)
cur = glow_mat('Current', (0.7, 0.92, 1.0), 3.0)
for i in range(7):
    pts = []
    for k in range(40):
        y = -20 + k * 8.0
        pts.append((-30 + i * 10 + 6 * math.sin(k * 0.22 + i), y, 0.3))
    c = curve_poly('Cur%d' % i, pts, bevel=0.07, mat=cur)
    grow_curve(c, [(0, 0.0), (6 + 3 * i, 0.0), (NF - 8, 1.0), (NF, 1.0)])
CN.haze(center=(0, 100, 10), size=(1600, 1600, 40), density=0.0012, color=(0.75, 0.82, 0.95), anisotropy=0.5, noise=0.3, noise_scale=0.01, height_falloff=0.3)
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.dolly((-10, -50, 6.5), (-10, -24, 5.5), look=(-10, 160, 0.5), look1=(-10, 160, 0.5)), lens=28, fstop=9, focus=300.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
