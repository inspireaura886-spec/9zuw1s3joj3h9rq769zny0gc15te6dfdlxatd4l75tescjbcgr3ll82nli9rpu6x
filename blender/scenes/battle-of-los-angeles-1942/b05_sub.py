"""s05 WIDE 28 mm 'Two days before, a Japanese submarine had shelled the coast.' Dusk sea, a generic surfaced
submarine (no markings) broadside, oil derricks on the far shore; deck-gun flashes, a burst on the shore. Lateral dolly."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
mats()
Wd.hdri('qwantani_dawn_puresky', strength=0.25, bg_strength=0.55, rot=250, tint=(0.95, 0.8, 0.95))
CN.sun(elev=2.5, az=250, warmth='late', strength=2.0)
Wd.ocean_wide(center=(0, 200, 0), half=5000, time_frames=NF)
Wd.sea_plane(size=60000, z=-0.6, rough=0.1, frames=NF)
shore = M.texture_set('Shore', 'dry_ground_rocks', scale=0.03, tint=(0.25, 0.22, 0.18), box=True)
Wd.terrain('Shore', size=9000, res=140, height=90, scale=0.0009, center=(0, 4200, -20), seed=6, mat=shore)
for k in range(9):
    derrick('Der%d' % k, (-500 + k * 120, 1900 + (k % 3) * 30, 6))
sub = submarine('Sub', (0, 320, 0.2), yaw=90)
bpy.context.view_layer.update()
mz = sub.matrix_world @ Vector((0, 26.5, 4.5))
L = Wd.point('GunFlash', mz, color=(1.0, 0.7, 0.4), power=0, radius=0.5)
key_energy(L, [(0, 0), (int(NF * 0.3) - 1, 0), (int(NF * 0.3), 8e5), (int(NF * 0.3) + 3, 0),
               (int(NF * 0.7) - 1, 0), (int(NF * 0.7), 8e5), (int(NF * 0.7) + 3, 0)])
B = Wd.point('ShoreBurst', (60, 1890, 20), color=(1.0, 0.65, 0.35), power=0, radius=6)
key_energy(B, [(0, 0), (int(NF * 0.45) - 1, 0), (int(NF * 0.45), 6e7), (int(NF * 0.45) + 6, 0)])
Wd.fog(center=(0, 1500, 60), size=(9000, 6000, 160), density=0.0007, color=(0.85, 0.75, 0.8))
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.dolly((-120, -40, 9), (-40, -46, 10), look=(0, 330, 4), look1=(30, 340, 6)), lens=28, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
