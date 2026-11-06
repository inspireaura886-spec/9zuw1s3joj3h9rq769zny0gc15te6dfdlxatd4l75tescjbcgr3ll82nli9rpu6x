"""s09 MEDIUM 35 mm TWIST 'Turn one crank, and they move the Sun and Moon around a dial,' The reconstructed mechanism on a
dark table (illustrative, after Freeth 2021): the crank turns, the Sun and Moon pointers sweep the front rings. Dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
anti_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.03, bg_strength=0.0)
boxm('Table', (0, 0, 0.74), (1.4, 0.9, 0.04), M.texture_set('TableW', 'wood_table_worn', scale=1.0, tint=(0.35, 0.24, 0.15)))
root, crank, ptr = mechanism('Mech', (0, 0, 0.76), scale=1.0, crank_keys=[(0, 0.0), (NF, 1.5)], NF=NF)
Wd.spot('Key', (-0.5, -0.8, 1.6), (0, 0, 0.95), color=(1.0, 0.82, 0.6), power=120, size_deg=40)
Wd.area('Fill', (0.8, -0.6, 1.2), (0, 0, 0.95), color=(0.7, 0.8, 1.0), power=10, size=0.6)
cam = C.Cam(clip_end=20)
wide(cam, NF, C.dolly((-0.35, -0.85, 1.05), (-0.18, -0.78, 1.0), look=(0, 0, 0.96), look1=(0.02, 0, 0.96)), lens=35, fstop=4,
     focus=Vector((0, -0.05, 0.96)))
go(cam, NF, a, sc, meter=NF // 2)
