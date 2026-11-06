"""shroud-of-turin b06_labs (WIDE 24 mm, eased dolly; VO 'split between Oxford, Zurich and Arizona.').
3D: three generic accelerator-lab benches labelled OXFORD, ZURICH, ARIZONA (no real lab layout claimed)
NF default 75 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
random.seed(6)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
for k, (nm, x) in enumerate((('OXFORD', -12), ('ZURICH', 0), ('ARIZONA', 12))):
    lab_bench('Lab%d' % k, (x, 0, 0), rz=0, label=nm)
boxm('LabFloor', (0, 0, -0.05), (60, 30, 0.1), M.texture_set('LabFloorM', 'concrete_floor_worn_001', scale=0.4, tint=(0.4, 0.4, 0.4)))
for x in (-12, 0, 12):
    bpy.ops.object.light_add(type='AREA', location=(x, -2, 5))
    L = bpy.context.active_object
    L.data.energy = 400
    L.data.size = 3
    L.data.color = (0.9, 0.95, 1.0)
Wd.hdri('fireplace', strength=0.03)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.dolly((-18, -14, 3.0), (-10, -16, 3.0), look=(0, 0, 1.2), look1=(4, 0, 1.2)), lens=24, fstop=8, focus=18.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.22)
