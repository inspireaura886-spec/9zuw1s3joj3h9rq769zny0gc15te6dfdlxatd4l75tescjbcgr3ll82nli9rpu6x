"""mh370 b10 (WIDE 35 mm, VO 'pinged it by satellite. The jet answered.'): a geostationary relay satellite over the
Indian Ocean (sub-point 64.5 E), Earth's disc behind it; a pulse travels down to the ocean and back up. Slow push.
NF default 88. Earth texture: NASA Visible Earth Blue Marble (credit in description)."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 88, int)
sc = core.reset(); look(sc, vol=False, glare=0.45, vignette=0.22)
space_world(1.0)
earth('Earth')
S = lonlat(SUB_LON, 0, GEO_R)
n = S.normalized()
sat = satellite('Sat', S, scale=0.16)
sat.rotation_euler = (0, 0, math.radians(SUB_LON + 90))
CN.sun(elev=12, az=SUB_LON + 38, warmth='noon', strength=7.0, check=False)
tgt = lonlat(92, -28, EARTH_R * 1.01)
pm = glow_mat('PulseM', (0.6, 0.92, 1.0), 40.0)
bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.09, location=S)
pu = bpy.context.active_object; pu.name = 'Pulse'; pu.data.materials.append(pm); pu.visible_shadow = False
def at(u): return S.lerp(tgt, u)
for f in range(0, NF + 1):
    if f <= 40:  u = C.ease_in(f / 40.0) * 0.999
    elif f <= 48: u = 0.999
    else: u = 0.999 * (1 - C.ease_out((f - 48) / max(1, NF - 48 - 6)))
    pu.location = at(max(0.0, u)); pu.keyframe_insert('location', frame=f)
key_fac(pm, [(0, 0.0), (6, 1.0), (40, 1.0), (44, 0.0), (50, 0.0), (54, 1.0), (NF - 4, 1.0), (NF, 0.3)])
lm = glow_mat('BeamM', (0.5, 0.85, 1.0), 3.0)
beam = curve_poly('Beam', [tuple(S), tuple(tgt)], bevel=0.012, mat=lm)
key_fac(lm, [(0, 0.0), (8, 0.35), (40, 0.5), (48, 0.2), (NF, 0.45)])
side = n.cross(Vector((0, 0, 1))).normalized()
cam = C.Cam(clip_end=5000)
p0 = S + n * 7.5 + Vector((0, 0, 1.6)) + side * 0.35
p1 = S + n * 5.6 + Vector((0, 0, 1.2)) + side * 0.25
lk = S - n * 30 + Vector((0, 0, -6))
cam.shot(0, NF, C.dolly(p0, p1, look=lk), lens=35, fstop=8, focus=S)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
