"""mh370 b11 (WIDE 35 mm, VO 'Each reply gave only a distance: a ring on the map.'): orbit view of Earth over the
Indian Ocean; distance rings 1..6 draw one by one around the satellite's sub-point (illustrative BTO rings; the real
Inmarsat arc figure is inset in Remotion). Eased 20 deg orbit. NF default 113."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 113, int)
sc = core.reset(); look(sc, vol=False, glare=0.5, vignette=0.22)
Wd.hdri('qwantani_night_puresky', strength=0.0, bg_strength=0.18, rot=30)
earth('Earth')
P0 = lonlat(SUB_LON, 0)
CN.sun(elev=-12, az=95, warmth='noon', strength=5.0, check=False)
sm = M.emission('SubPt', (0.7, 0.95, 1.0), 12.0)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.7, location=lonlat(SUB_LON, 0, EARTH_R * 1.004))
bpy.context.active_object.data.materials.append(sm)
for k in range(6):
    m = glow_mat('RingM%d' % k, (0.55, 0.9, 1.0), 5.0)
    o = curve_poly('Ring%d' % k, small_circle(P0, RING_RHO[k]), bevel=0.22, mat=m)
    f0 = 8 + k * 14
    grow_curve(o, [(0, 0.0), (f0, 0.0), (f0 + 13, 1.0)])
    key_fac(m, [(0, 1.0), (f0 + 13, 1.0), (f0 + 30, 0.55)])
cam = C.Cam(clip_end=5000)
cam.shot(0, NF, C.orbit((0, 0, 0), r=300, a0=62, a1=82, h=(-120, -110), look_h=-32), lens=35, fstop=11,
         focus=lonlat(78, -25))
go(cam, NF, a, sc, meter=NF - 10, target=0.2)
