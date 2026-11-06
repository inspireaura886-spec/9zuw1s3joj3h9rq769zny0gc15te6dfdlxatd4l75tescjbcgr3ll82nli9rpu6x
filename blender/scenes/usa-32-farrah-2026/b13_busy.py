"""usa-32-farrah-2026 b13_busy (24 mm, slow orbit; VO 'in one of the busiest orbits above Earth.'): WIDE: a swarm of small bright satellites on the shell around the Earth, one amber marker with a ring around it among them.
NF default 100 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 100, int)
sc = core.reset(); look(sc, vol=False, glare=0.5, vignette=0.26)
space(sun_az=130, sun_elev=20); earth()
rnd = random.Random(41)
dm = glow_mat('DotM', (0.8, 0.9, 1.0), 6.0)
for i in range(190):
    u, v = rnd.uniform(0, 6.283), math.acos(rnd.uniform(-0.15, 1.0))
    rr = EARTH_R + rnd.uniform(160, 230)
    p = EARTH_C + Vector((math.sin(v) * math.cos(u) * rr, math.sin(v) * math.sin(u) * rr, math.cos(v) * rr))
    sphere('Dot%d' % i, p, rnd.uniform(1.2, 2.0), dm, seg=8)
marker('Hero', (0, 0, 0), r=2.6)
rg = ring_mesh('HeroRing', 9.0, 0.5, 96)
rg.rotation_euler = (math.radians(90), 0, 0)
rg.data.materials.append(glow_mat('HeroRingM', (1.0, 0.72, 0.3), 4.0))
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.orbit((0, 0, -120), r=280, a0=-112, a1=-72, h=(30, 70), look_h=0.0), 24, fstop=11, focus=280.0)
go(cam, NF, a, sc, meter=NF // 2)
