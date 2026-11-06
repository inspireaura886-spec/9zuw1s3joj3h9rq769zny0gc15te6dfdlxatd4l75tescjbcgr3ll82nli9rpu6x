"""52hz b08_route (WIDE 35 mm, orbit; VO 'Every autumn it swam from the Aleutian Islands to California, alone,'). Globe of the North Pacific (NASA Blue Marble); the seasonal route Aleutians -> Kodiak -> California draws on.
NF default 133 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 133, int)
sc = core.reset(); look(sc, vol=False, glare=0.35, vignette=0.2)
space_world(stars=0.6)
earth('Earth', atmo=True)
CN.sun(elev=20, az=210, warmth=(1.0, 0.97, 0.92), strength=4.0, check=False)
route = [(-175, 51.5), (-165, 53.5), (-155, 56.5), (-150, 55), (-140, 50), (-132, 44), (-126, 39), (-122, 35.5)]
pts = []
for i in range(len(route) - 1):
    for k in range(12):
        u = k / 12
        lo = route[i][0] + (route[i + 1][0] - route[i][0]) * u
        la = route[i][1] + (route[i + 1][1] - route[i][1]) * u
        pts.append(tuple(lonlat(lo, la, EARTH_R * 1.006)))
pts.append(tuple(lonlat(*route[-1], EARTH_R * 1.006)))
rm = glow_mat('RouteM', (0.65, 0.95, 1.0), 6.0)
ro = curve_poly('Route', pts, bevel=0.22, mat=rm)
grow_curve(ro, [(0, 0.0), (8, 0.02), (NF - 12, 1.0)])
dot = cyl('Dot', tuple(lonlat(-122, 35.5, EARTH_R * 1.004)), tuple(lonlat(-122, 35.5, EARTH_R * 1.02)), 0.5, M.emission('DotM', color=(0.7, 0.95, 1.0), strength=12.0), 16)
c = lonlat(-148, 47, EARTH_R)
cam = C.Cam(clip_end=5000)
cam.shot(0, NF, C.dolly(c * 2.65 + Vector((0, -14, -6)), c * 2.45 + Vector((0, 10, -8)), look=c * 0.98, look1=c * 1.0), lens=35, fstop=11, focus=EARTH_R * 1.5)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
