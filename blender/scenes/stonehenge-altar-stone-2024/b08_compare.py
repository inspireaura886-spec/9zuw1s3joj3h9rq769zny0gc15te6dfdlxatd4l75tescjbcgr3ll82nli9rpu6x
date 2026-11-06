"""stonehenge-altar-stone-2024 b08_compare (WIDE 35 mm, orbit; VO 'Geologists compared those ages with rocks across Britain.').
3D globe, NASA Blue Marble (PD, earth_bluemarble_2048.jpg); two pins: Stonehenge and the Orcadian Basin (NE Scotland)
NF default 98 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
random.seed(8)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
space_world(stars=0.6)
earth('Earth', atmo=True)
pin('Henge', -1.83, 51.18)
pin('Orcadia', -3.4, 58.4, color=(0.75, 1.0, 0.8))
cam = C.Cam(clip_end=5000)
cam.shot(0, NF, C.orbit(tuple(lonlat(-2.5, 55.0)), r=36, a0=-12, a1=10, h=(78, 74), look_h=0.0), lens=35, fstop=11, focus=80.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
