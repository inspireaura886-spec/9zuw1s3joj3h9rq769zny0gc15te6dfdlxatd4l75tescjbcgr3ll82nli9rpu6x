"""s08 WIDE 28 mm MOMENT 'Kalapalo villagers, a local tribe, watched their campfire smoke rise above the trees.' A Xingu
village plaza at dusk: large thatched oval houses round a swept plaza, a few faceless villagers looking east; far over the
canopy a thin thread of smoke. Crane UP to reveal the smoke."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
jungle(NF, seed=8, n_trees=70, n_palms=14, area=(-160, 160, -60, 260), lane=lambda x, y: x * x + y * y < 70 * 70, sun_elev=15, az=250, warmth='late', haze=0.006, under=False)
CN.ground('Plaza', 'farm_soil', (150, 150), center=(0, 0, 0.02), tile_m=6.0, tint=(0.55, 0.45, 0.35))
th = M.principled('Thatch', base=(0.42, 0.33, 0.18), rough=0.95, bump=0.8, bump_scale=90, grime=0.3)
for k in range(9):
    ang = math.radians(200 + 160 * k / 8)
    sphere('House%d' % k, (52 * math.cos(ang), 52 * math.sin(ang), 0), 1.0, th, 24, scale=(5.5, 10.0, 6.0))
for k in range(5):
    figure('V%d' % k, (-6 + 3 * k, -12 + (k % 2), 0), yaw=270, mat=M.principled('Skin%d' % k, base=(0.20, 0.12, 0.08), rough=0.6))
smoke_column('Smoke', (260, 120, 28), NF, n=22, rise=70, spread=8, seed=8)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-22, -30, 1.8), (60, 40, 6), dz=9, dlook=26), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
