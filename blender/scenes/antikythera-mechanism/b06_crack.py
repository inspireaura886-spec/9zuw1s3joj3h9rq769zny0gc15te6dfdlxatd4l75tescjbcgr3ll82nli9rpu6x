"""s06 CLOSE 50 mm accent REVEAL 'In the cracks: tiny teeth. A gear.' Raking light across the corroded surface; inside a
crack the teeth of a wheel catch the light. Push-in."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
anti_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.02, bg_strength=0.0)
boxm('Felt', (0, 0, -0.005), (0.6, 0.6, 0.01), bpy.data.materials['Felt'])
crumple('CrustL', (-0.05, 0, 0.0), (0.12, 0.16), bpy.data.materials['Patina'], seed=6, amp=0.03, res=7)
crumple('CrustR', (0.07, 0.01, 0.0), (0.10, 0.15), bpy.data.materials['Patina'], seed=7, amp=0.03, res=7)
g = gear('Wheel', (0.008, 0, 0.004), r=0.03, teeth=48, thick=0.003, mat=M.principled('PatinaTeeth', base=(0.30, 0.36,
         0.26), rough=0.55, metal=0.6, grime=0.4))
Wd.area('Rake', (0.5, -0.1, 0.06), (0, 0, 0), color=(1.0, 0.9, 0.75), power=8, size=0.1)
cam = C.Cam(clip_end=10)
wide(cam, NF, C.push_in((0.05, -0.32, 0.22), (0.008, 0, 0.006), amount=0.35), lens=50, fstop=5.6, focus='Wheel')
go(cam, NF, a, sc, meter=NF // 2)
