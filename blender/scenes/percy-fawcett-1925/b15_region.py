"""s15 WIDE 28 mm 'He was searching in the right region.' Ground level under the trees along a wide ancient ditch: dark soil,
a few pottery shards at the lip, light shafts through haze. Lateral dolly along the ditch."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=15, n_trees=60, n_palms=12, area=(-80, 80, -10, 160), lane=lambda x, y: abs(y - 20) < 10, sun_elev=20, az=120, haze=0.02)
ditch = M.principled('DitchSoil', base=(0.05, 0.035, 0.025), rough=0.95, bump=0.4, bump_scale=20)
Wd.terrain('Ditch', size=200, res=60, height=0.6, scale=0.05, center=(0, 20, -2.2), seed=15, mat=ditch).scale = (1, 0.06, 1)
r = rng(15)
shard = M.principled('Shard', base=(0.45, 0.22, 0.12), rough=0.8, grime=0.4)
for k in range(14):
    crumple('Shard%d' % k, (r.uniform(-12, 12), 14 + r.uniform(-1, 1), 0.05), 0.12, shard, seed=k, amp=0.15)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-14, 6, 1.4), (-4, 6, 1.4), look=(-8, 30, 0.8), look1=(2, 30, 0.8)), lens=28, fstop=8)
go(cam, NF, a, sc, meter=NF // 2)
