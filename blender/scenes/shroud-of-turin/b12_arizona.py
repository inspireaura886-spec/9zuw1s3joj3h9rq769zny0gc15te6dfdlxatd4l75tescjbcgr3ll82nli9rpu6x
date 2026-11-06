"""shroud-of-turin b12_arizona (MEDIUM 35 mm, push-in; VO 'and Arizonas leftover piece looked original.').
3D: the ARIZONA bench, a small leftover sample in a glass dish under the lamp; chip "Arizona re-exam: original cloth"
NF default 75 (--nf). Round-2 code batch 2026-11-06, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 75, int)
random.seed(12)
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
boxm('Dish', (12, -1.0, 1.3), (0.3, 0.3, 0.04), M.principled('DishG', base=(0.9, 0.95, 0.95), rough=0.02, transmission=1.0), 0.01)
boxm('Sample', (12, -1.0, 1.33), (0.06, 0.02, 0.003), linen_mat('SampM'), 0.0)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.push_in((10.5, -4.0, 2.2), (12, -1.0, 1.3), amount=0.3), lens=35, fstop=4.0, focus=3.6)
go(cam, NF, a, sc, meter=NF // 2, target=0.22)
