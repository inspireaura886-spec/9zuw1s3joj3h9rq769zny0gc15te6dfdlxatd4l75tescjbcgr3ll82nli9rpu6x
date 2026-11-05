"""b12 (WIDE 24 mm, 'north of the Golden Gate Bridge'): generic suspension bridge at dawn, Marin headlands and a small cove in the foreground. Slow crane up. Bridge along y, camera east of it."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 75, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.26)
dawn_world(sun_az=70, elev=7, strength=3.2, hdri_strength=0.9)
swell_ocean(NF, half=2800, wave_scale=0.7, wind=8, color=(0.012, 0.025, 0.034), rough=0.1)
orange = M.principled('BrOrange', base=(0.42, 0.07, 0.03), rough=0.45, metal=0.35, grime=0.15)
deck_m = M.principled('BrDeck', base=(0.10, 0.10, 0.11), rough=0.6, metal=0.5)
ZD, ZT, ZC = 67.0, 227.0, 76.0
for sy in (-640.0, 640.0):
    for sx in (-13.7, 13.7):
        boxm('TwL%d%d' % (sy, sx * 10), (sx, sy, ZT / 2), (5.5, 9.0, ZT), orange, 0.3)
    for z in (95, 135, 175, 215):
        boxm('Strut%d_%d' % (sy, z), (0, sy, z), (27.4 - 5.5, 7.0, 9.0), orange, 0.3)
boxm('Deck', (0, 0, ZD), (26.0, 2000.0, 4.0), deck_m, 0.2)
boxm('Truss', (0, 0, ZD - 4.5), (24.0, 2000.0, 5.0), orange, 0.3)
for sx in (-12.0, 12.0):
    for (ya, yb, za, zb, sag) in ((-640, 640, ZT, ZT, None), (-1000, -640, ZC + 2, ZT, 'L'), (640, 1000, ZT, ZC + 2, 'R')):
        pts = []
        for k in range(61):
            t = k / 60
            y = ya + (yb - ya) * t
            if sag is None:
                z = ZC + (ZT - ZC) * ((y / 640.0) ** 2)
            else:
                z = za + (zb - za) * t - 40 * math.sin(math.pi * t)
            pts.append((sx, y, z))
        curve_poly('Cable%d_%d_%d' % (sx, ya, yb), pts, bevel=0.5, mat=orange)
    for y in [-640 + 15.2 * k for k in range(1, 84)]:
        zc = ZC + (ZT - ZC) * ((y / 640.0) ** 2)
        boxm('Sus%d_%d' % (sx, y), (sx, y, (ZD + 2 + zc) / 2), (0.25, 0.25, zc - ZD - 2), orange)
# Marin headlands + SF presidio (hills) and the cove foreground
hill = M.texture_set('Hills', 'dry_ground_rocks', scale=0.02, tint=(0.22, 0.2, 0.12), box=True)
Wd.terrain('Marin', size=3600, res=170, height=170, scale=0.0018, center=(-250, 2350, -20), seed=7, mat=hill, island=0.0)
Wd.terrain('Presidio', size=3000, res=120, height=90, scale=0.0016, center=(-300, -2400, -25), seed=3, mat=hill, island=0.0)
sand = M.texture_set('CoveSand', 'damp_beach_sand', scale=0.2, tint=(0.35, 0.3, 0.24), box=True)
slab('Cove', [(700 + 120 * math.cos(t), 360 + 90 * math.sin(t)) for t in [2 * math.pi * k / 20 for k in range(20)]], -2.0, 3.0, sand)
CN.haze(center=(0, 0, 70), size=(3200, 3600, 220), density=0.0007, color=(1.0, 0.9, 0.78), anisotropy=0.6, noise=0.3, noise_scale=0.004, height_falloff=0.5)
cam = C.Cam(clip_end=30000)
cam.shot(0, NF, C.crane((880, 330, 6), (0, 560, 120), dz=34, dlook=18), lens=24, fstop=9, focus=900.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.22)
