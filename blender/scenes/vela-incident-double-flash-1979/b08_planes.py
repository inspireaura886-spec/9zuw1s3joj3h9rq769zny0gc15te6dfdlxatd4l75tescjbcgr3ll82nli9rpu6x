"""s08 WIDE 28 mm 'Air Force planes flew twenty-five sampling flights.' A grey jet low over the ocean at dawn (generic
model; chip 25 SORTIES). Lateral dolly with the aircraft."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
CN.hdri_sun('qwantani_dawn_puresky', sun_az=80, strength=0.9)
CN.sun(elev=7, az=80, warmth='golden', strength=4.0, check=False)
Wd.sea_plane(size=90000, z=0.0, color=(0.008, 0.016, 0.022), rough=0.12, wave=0.2, wave_scale=0.06, frames=max(NF, 60))
pl = Md.airliner('Sampler', (0, 0, 300), cabin_glow=0.0, livery=(0.35, 0.37, 0.4), seed=5, f1=NF, lights=True)
Md.fly(pl, [(0, (0, 0, 300), None), (NF, (0, 260, 300), None)])
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.dolly((-90, -40, 306), (-90, 200, 306), look=(0, 0, 300), look1=(0, 250, 300)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
