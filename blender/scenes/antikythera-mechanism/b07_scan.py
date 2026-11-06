"""s07 MEDIUM 35 mm 'Then X-rays and CT scans looked inside.' A lab: the fragment on a scanner turntable between a source
housing and a glowing blue detector panel (chips 1971 PRICE & KARAKALOS; 2005 CT). Slow orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
anti_mats()
Wd.hdri('kloppenheim_02_puresky', strength=0.03, bg_strength=0.0)
boxm('LabFloor', (0, 0, -0.02), (8, 8, 0.04), M.texture_set('LabFloorM', 'concrete_floor_worn_001', scale=0.5))
boxm('Bench', (0, 0, 0.45), (1.6, 0.8, 0.9), M.texture_set('LabSteel', 'metal_plate', scale=0.5, tint=(0.6, 0.62, 0.64)))
t = cyl('Turntable', (0, 0, 0.9), (0, 0, 0.94), 0.16, bpy.data.materials['Felt'], 32)
fr = lump('FragA', (0, 0, 0.95), seed=7)
spin(t, 'Z', 0.6, NF)
boxm('Source', (-0.6, 0, 1.1), (0.3, 0.3, 0.4), M.principled('SourceM', base=(0.7, 0.7, 0.68), rough=0.4))
boxm('Detector', (0.6, 0, 1.1), (0.04, 0.5, 0.5), glow_mat('DetM', color=(0.45, 0.7, 1.0), strength=3.0))
Wd.area('Fill', (0, -1.5, 2.2), (0, 0, 1), color=(0.7, 0.8, 1.0), power=40, size=1.5)
Wd.fog(center=(0, 0, 1.4), size=(4, 4, 2.8), density=0.04, color=(0.8, 0.9, 1.0), anisotropy=0.5)
cam = C.Cam(clip_end=100)
wide(cam, NF, C.orbit((0, 0, 1.0), r=2.0, a0=-110, a1=-80, h=0.45, look_h=0.05), lens=35, fstop=4, focus='FragA')
go(cam, NF, a, sc, meter=NF // 2)
