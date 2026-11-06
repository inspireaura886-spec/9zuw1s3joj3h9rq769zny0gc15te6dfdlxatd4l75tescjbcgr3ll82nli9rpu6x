"""yonaguni b05_sharks (WIDE 28 mm, orbit; VO 'In nineteen eighty-six, a diver looking for hammerhead sharks off Yonaguni, Japans westernmost island,'). MOMENT: a faceless diver over the reef edge, hammerheads gliding overhead against the bright surface. Orbit.
NF default 168 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 168, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.22)
underwater(NF, depth=28, half=220, sun_az=40, sun_elev=62, sun_strength=6.0, density=0.028, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
terraces('T', origin=(0, 0, -26), steps=6, rise=2.0, tread=2.6, width=14.0, seed=3)
faceless_diver('Diver', loc=(-6.0, -6.0, -12.0), yaw=40, NF=NF)
for k, (p0, v, ph) in enumerate((((-30, 4, -6), (0.09, 0.0, 0.0), 0), ((-38, 9, -4.5), (0.085, 0.004, 0.0), 13), ((-24, 14, -7.5), (0.1, -0.003, 0.0), 27))):
    s = hammerhead('Shark%d' % k, NF=NF, beat=36 + 4 * k)
    s.rotation_euler = (0, 0, math.radians(180))
    move_line(s, NF, p0, v)
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.orbit((-5, 0, -11), r=17, a0=232, a1=256, h=(-5.5, -4.5), look_h=1.5), lens=28, fstop=6.3, focus=17.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
