"""s03 WIDE 24 mm MOMENT "In nineteen-oh-one, sponge divers worked a Roman-era wreck off Antikythera, forty-five metres down."
A small sailing boat at anchor under the island's cliffs, a diver in a canvas suit and copper helmet at the rail (chip
SYMI SPONGE DIVERS, 1900-01). Crane DOWN to the water."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__)
antikythera_coast(NF, seed=2)
b = Md.boat('Caique', (0, 0, 0.3), length=12.0, cabin_light=False)
cyl('Mast', (0, 1, 0.8), (0, 1, 9), 0.09, bpy.data.materials['CaseWood'], 10)
for k in range(3):
    figure('Crew%d' % k, (-1.2 + k * 1.1, -1.5 + k * 0.6, 1.1), yaw=90 + k * 30,
           mat=M.principled('Wool%d' % k, base=(0.15 + k * 0.05, 0.13, 0.11), rough=0.9))
d = figure('Diver', (1.6, 0.2, 1.1), yaw=-90, mat=M.principled('Canvas', base=(0.55, 0.50, 0.40), rough=0.9), h=1.85)
sphere('Helmet', (1.6, 0.2, 2.75), 0.26, M.principled('Copper', base=(0.75, 0.42, 0.22), rough=0.3, metal=1.0), 20)
cam = C.Cam(clip_end=60000)
wide(cam, NF, C.crane((-38, -46, 16), (0, 0, 3), dz=-12, dlook=-1.5), lens=24, fstop=11)
go(cam, NF, a, sc, meter=NF // 2)
