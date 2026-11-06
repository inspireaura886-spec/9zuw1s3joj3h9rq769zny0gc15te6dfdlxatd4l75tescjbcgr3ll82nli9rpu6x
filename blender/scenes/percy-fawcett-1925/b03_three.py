"""s03 WIDE 28 mm 'He took his son Jack and Jack's best friend, Raleigh.' Dry scrub (cerrado) in late sun; three faceless
walkers with packs cross left to right toward the forest wall behind. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=3, n_trees=40, n_palms=8, area=(-140, 140, 40, 220), sun_elev=16, az=200, dry=True, haze=0.006)
CN.scatter('dry_branches_medium_01', 40, (-40, 40, -10, 30), seed=4, scale=(1.0, 2.0))
for k, (x, y) in enumerate([(-6, 8), (-9, 9.5), (-12, 8.6)]):
    w = walker('W%d' % k, (x, y, 0), yaw=-90, h=1.85 - 0.04 * k)
    walk(w, NF, (x, y, 0), (x + 7, y, 0))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-14, -8, 1.6), (-6, -8, 1.6), look=(-7, 9, 1.4), look1=(1, 9, 1.4)), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
