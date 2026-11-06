"""stonehenge-altar-stone-2024 b11_distance (WIDE 35 mm, orbit; VO 'the stone travelled at least seven hundred and fifty kilometres.').
3D globe: a straight glowing line Orcadian Basin -> Stonehenge draws on (distance, not a route); chip "750+ km"
NF default 121 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 121, int)
random.seed(11)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
space_world(stars=0.6)
earth('Earth', atmo=True)
pin('Henge', -1.83, 51.18)
pin('Orcadia', -3.4, 58.4, color=(0.75, 1.0, 0.8))
sea_route([(-3.4, 58.4), (-2.6, 54.8), (-1.83, 51.18)], NF=NF)
cam = C.Cam(clip_end=5000)
cam.shot(0, NF, C.orbit(tuple(lonlat(-2.5, 55.0)), r=30, a0=12, a1=28, h=(70, 66), look_h=0.0), lens=35, fstop=11, focus=75.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
