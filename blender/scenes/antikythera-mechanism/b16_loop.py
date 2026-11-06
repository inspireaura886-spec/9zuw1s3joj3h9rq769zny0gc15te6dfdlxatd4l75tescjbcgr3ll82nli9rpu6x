"""s16 MEDIUM 35 mm LOOP 'Nobody explained it.' Over the fragment on black felt, the framing of the s01 museum photo;
push-in ends on the big wheel for the dissolve into s01."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
anti_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.02, bg_strength=0.0)
boxm('Felt', (0, 0, -0.005), (0.8, 0.8, 0.01), bpy.data.materials['Felt'])
lump('FragA', (0, 0, 0.0), seed=1)
Wd.spot('Down', (0.1, -0.2, 1.2), (0, 0, 0), color=(1.0, 0.88, 0.72), power=40, size_deg=30)
cam = C.Cam(clip_end=20)
wide(cam, NF, C.push_in((0, -0.45, 0.55), (0.01, 0, 0.02), amount=0.18), lens=35, fstop=5.6, focus='FragA')
go(cam, NF, a, sc, meter=NF // 2)
