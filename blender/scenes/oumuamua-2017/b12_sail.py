"""s12 MEDIUM 35 mm 'Harvard astronomer Avi Loeb suggested a thin light sail, built by someone.' A paper-thin reflective
disc tumbling in sunlight, catching glints (chip HYPOTHESIS: BIALY & LOEB, 2018). Orbit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a, NF, sc = start(__file__, vol=False)
space(NF, seed=12)
s = cyl('Sail', (0, 0, -0.05), (0, 0, 0.05), 18, bpy.data.materials['SailFoil'], 64)
s.rotation_mode = 'XYZ'
s.keyframe_insert('rotation_euler', frame=0)
s.rotation_euler = (math.radians(70), math.radians(25), 0)
s.keyframe_insert('rotation_euler', frame=NF)
cam = C.Cam(clip_end=90000)
wide(cam, NF, C.orbit((0, 0, 0), r=75, a0=-120, a1=-90, h=(14, 10)), lens=35, fstop=16, focus='Sail')
go(cam, NF, a, sc, meter=NF // 2)
