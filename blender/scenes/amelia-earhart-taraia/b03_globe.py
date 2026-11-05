"""b03 (WIDE 35 mm, VO 'first spotted in 2020'): orbit view of Earth over the central Pacific; Nikumaroro (4.7 S, 174.5 W)
lights up as a small pulsing dot with expanding rings. Eased orbit. Earth texture: NASA Visible Earth Blue Marble (credit in description)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, '--nf', 157, int)
sc = core.reset(); look(sc, vol=False, glare=0.5, vignette=0.22)
space_world(1.0)
earth('Earth')
LON, LAT = -174.5, -4.67
P = lonlat(LON, LAT)
L = lonlat(LON - 40, 14).normalized()
lamp = bpy.data.lights.new('SunL', 'SUN'); lamp.energy = 7.0; lamp.angle = 0.01
lo = bpy.data.objects.new('SunL', lamp); bpy.context.scene.collection.objects.link(lo)
lo.rotation_euler = (-L).to_track_quat('-Z', 'Y').to_euler()
sm = M.emission('NikuPt', (1.0, 0.92, 0.6), 18.0)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.55, location=lonlat(LON, LAT, EARTH_R * 1.004))
pt = bpy.context.active_object; pt.data.materials.append(sm)
for fr, s in ((0, 0.0), (36, 0.0), (44, 1.6), (60, 1.0), (NF, 1.2)):
    pt.scale = (s, s, s); pt.keyframe_insert('scale', frame=fr)
for k, rho in enumerate((1.6, 3.2, 5.0)):
    m = glow_mat('NRingM%d' % k, (1.0, 0.9, 0.6), 5.0)
    o = curve_poly('NRing%d' % k, small_circle(P, rho), bevel=0.18, mat=m)
    f0 = 40 + k * 16
    grow_curve(o, [(0, 0.0), (f0, 0.0), (f0 + 14, 1.0)])
    key_fac(m, [(0, 1.0), (f0 + 14, 1.0), (f0 + 40, 0.5)])
bm = glow_mat('NBeamM', (1.0, 0.9, 0.6), 4.0)
n = P.normalized()
curve_poly('NBeam', [tuple(n * EARTH_R * 1.004), tuple(n * (EARTH_R + 16))], bevel=0.07, mat=bm)
key_fac(bm, [(0, 0.0), (38, 0.0), (50, 0.9), (NF, 0.7)])
cam = C.Cam(clip_end=5000)
lon_d = LON % 360
cam.shot(0, NF, C.orbit((0, 0, 0), r=330, a0=lon_d - 9, a1=lon_d - 1, h=(-24, -26), look_h=-6), lens=35, fstop=11, focus=lonlat(LON, LAT))
go(cam, NF, a, sc, meter=NF - 10, target=0.2)
