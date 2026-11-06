"""s05 WIDE 28 mm 'Then the trail went cold.' Illustrative route over the ice (no real coastline data): a warm line grows
north leg by leg and stops; a small ring marks where it ends. Two clocks are Remotion overlays. Crane DOWN along the line."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
arctic(NF, sun_elev=7, az=200, haze=0.0010, seed=4, floes=40)
r = rng(4)
pts = [(-600 + 70 * k + r.uniform(-25, 25), -200 + 110 * k, 3.0) for k in range(10)]
line = curve_poly('Route', pts, bevel=2.2, mat=glow_mat('RouteM', color=(0.98, 0.86, 0.76), strength=5.0))
grow_curve(line, [(0, 0.0), (int(NF * 0.6), 1.0)])
ring = sphere('EndMark', pts[-1], 9.0, glow_mat('EndM', color=(0.98, 0.86, 0.76), strength=4.0), 24, scale=(1, 1, 0.08))
key_fac(bpy.data.materials['EndM'], [(0, 0), (int(NF * 0.6), 0), (int(NF * 0.7), 1.0)])
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-420, -900, 760), (-250, 500, 0), dz=-320, dlook=0), lens=28, fstop=16)
go(cam, NF, a, sc, meter=NF // 2)
