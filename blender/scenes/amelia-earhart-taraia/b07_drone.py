"""b07 (WIDE 28 mm, VO 'drone, sonar'): small boat and quadcopter over the turquoise lagoon, sonar ping ring spreading on the water. Eased orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ac import *
a = core.args(); NF = arg(a, "--nf", 99, int)
sc = core.reset(); look(sc, vol=False, glare=0.3, vignette=0.2)
day_world(sun_az=230, elev=36, strength=5.0)
at = Atoll(); at.build(NF=NF, palm_n=900)
lx, ly = at.spit_center()
bx, by = lx - 140, ly + 40
boat = Md.boat('Boat', (bx, by, 0.15), length=9.0, cabin_light=False)
boat.rotation_euler = (0, 0, math.radians(35))
for fr in range(0, NF + 1, 3):
    boat.location.z = 0.15 + 0.08 * math.sin(fr / 30.0 * 1.4); boat.keyframe_insert('location', frame=fr)
dr = quadcopter('Drone', (bx + 3, by - 2, 8.0), scale=1.5, NF=NF)
for fr in range(0, NF + 1, 3):
    t = fr / 30.0
    dr.location = (bx + 3 + 2.2 * math.sin(t * 0.5), by - 2 + 1.6 * math.cos(t * 0.45), 8.0 + 0.25 * math.sin(t * 1.2)); dr.keyframe_insert('location', frame=fr)
    dr.rotation_euler = (math.radians(3 * math.sin(t)), math.radians(2 * math.cos(t * 0.8)), math.radians(20 * t)); dr.keyframe_insert('rotation_euler', frame=fr)
for k, f0 in enumerate((6, 40, 74)):
    rm = glow_mat('PingM%d' % k, (0.6, 0.95, 1.0), 4.0)
    ro = ring_mesh('Ping%d' % k, r=1.0, w=0.07, n=160)
    ro.data.materials.append(rm); ro.location = (bx, by, 0.12)
    ro.scale = (0.2, 0.2, 0.2); ro.keyframe_insert('scale', frame=f0 - 1)
    ro.scale = (46, 46, 46); ro.keyframe_insert('scale', frame=f0 + 36)
    key_fac(rm, [(0, 0.0), (f0 - 1, 0.0), (f0, 0.9), (f0 + 34, 0.0)])
cam = C.Cam(clip_end=20000)
cam.shot(0, NF, C.orbit((bx, by, 0), r=58, a0=205, a1=232, h=(21, 26), look_h=4.0), lens=28, fstop=11, focus=Vector((bx, by, 3)))
go(cam, NF, a, sc, meter=NF // 2, target=0.26)
