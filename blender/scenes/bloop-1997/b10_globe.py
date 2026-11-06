"""bloop-1997 b10_globe (WIDE 35 mm, orbit; VO 'NOAA kept listening.').
3D globe, NASA Blue Marble (PD): hydrophone pins in the equatorial Pacific, source pin near 50S 100W (approximate, per NOAA/Wikipedia); chip "~50S 100W"
NF default 42 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 42, int)
random.seed(10)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
space_world(stars=0.6)
earth('Earth', atmo=True)
pin('Src', -100, -50, color=(0.75, 0.95, 1.0))
for k, (lo, la) in enumerate(((-110, 0), (-95, 8), (-125, -8), (-105, -8))):
    pin('Hyd%d' % k, lo, la, color=(1.0, 0.95, 0.8), r=0.45)
cam = C.Cam(clip_end=5000)
cam.shot(0, NF, C.orbit(tuple(lonlat(-105, -25)), r=80, a0=245, a1=262, h=(-36, -40), look_h=0.0), lens=35, fstop=11, focus=88.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
