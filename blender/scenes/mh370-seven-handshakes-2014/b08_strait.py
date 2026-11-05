"""mh370 b08 (WIDE 24 mm, VO 'An hour later, it slipped off radar.'): night sea from high altitude, a peninsula
coast with town lights on the right; a tiny aircraft light heads out over the dark sea and fades. Slow crane up/back.
NF default 89."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=True, glare=0.55, vignette=0.26)
Wd.hdri('qwantani_night_puresky', strength=0.25, bg_strength=0.5, rot=60)
Wd.moon(direction=(0.2, 0.9, 0.25), strength=1.2, color=(0.62, 0.72, 1.0), angle=0.55)
Wd.sea_plane(size=200000, z=0.0, color=(0.004, 0.007, 0.012), rough=0.3, wave=0.1, frames=NF)
land = M.principled('LandM', base=(0.02, 0.025, 0.018), rough=0.9, bump=0.3, bump_scale=0.002)
Wd.terrain('Peninsula', size=30000, res=180, height=320, scale=0.00011, center=(15000, 9000, -60), seed=3, mat=land, island=0.9)
Wd.terrain('FarCoast', size=40000, res=120, height=380, scale=0.00008, center=(-26000, 30000, -80), seed=8, mat=land, island=0.9)
import random as _r
rnd = _r.Random(5)
for k in range(9):
    t = math.radians(150 + k * 14 + rnd.uniform(-4, 4))
    cx, cy = 15000 + 5600 * math.cos(t), 9000 + 5600 * math.sin(t)
    Wd.city_lights('Town%d' % k, center=(cx, cy, 160), radius=rnd.uniform(500, 1300), count=rnd.randint(250, 700), seed=k,
                   strength=40, size=6, cluster=0.65)
for k in range(5):
    Wd.city_lights('Far%d' % k, center=(-26000 + 7000 * math.cos(k), 30000 - 8000 + k * 900, 220), radius=900, count=180,
                   seed=20 + k, strength=30, size=8)
Wd.fog(center=(0, 10000, 600), size=(90000, 90000, 1400), density=0.000035, color=(0.7, 0.78, 0.95), anisotropy=0.3)
# the aircraft: a blinking red beacon + white tail light seen from far above, flying out to sea, fading out
jet = Md.empty('JetLights')
V = 250.0 / 30
fly_line(jet, NF, (2600, 2500, 10700 - 9000), (-V * 0.6, V * 0.8, 0))
mr = glow_mat('BeaconM', (1.0, 0.08, 0.04), 60.0); mw = glow_mat('TailM', (1.0, 0.95, 0.9), 40.0)
for nm, off, m in (('Bcn', (0, 0, 0), mr), ('Tl', (0, -30, 0), mw)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=9, location=off)
    o = bpy.context.active_object; o.name = nm; o.parent = jet; o.data.materials.append(m); o.visible_shadow = False
key_fac(mr, [(0, 1.0), (30, 1.0), (42, 0.35), (44, 1.0), (60, 0.2), (72, 0.0), (NF, 0.0)])
key_fac(mw, [(0, 0.9), (40, 0.7), (66, 0.0), (NF, 0.0)])
cam = C.Cam(clip_end=200000)
cam.shot(0, NF, C.dolly((-600, -5200, 4200), (-900, -6400, 5000), look=(1800, 4200, 0), look1=(1600, 4600, 0)), lens=24,
         fstop=11, focus=8000.0)
go(cam, NF, a, sc, meter=NF // 3, target=0.19)
