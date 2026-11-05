"""s09 v2 (50 mm, 'DNA showed a hair found in that car was his'): evidence bag with a hair strand in a hard warm desk-lamp pool, steep top-down-ish push-in so the bag fills the frame."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hc import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.26)
lab()
# thicker, brighter hair + bigger warm key on the bag so the evidence reads at a glance
hair = bpy.data.objects.get('Hair')
if hair: hair.data.bevel_depth = 0.0017
for _o in bpy.data.objects:
    if _o.name.startswith('LampHead'):
        for _m in _o.data.materials:
            for _n in _m.node_tree.nodes:
                if _n.bl_idname == 'ShaderNodeEmission': _n.inputs['Strength'].default_value = 1.2
Wd.spot('BagKey', (0.12, -0.28, 1.45), (0.0, 0.0, 0.962), color=(1.0, 0.88, 0.68), power=260, size_deg=22, blend=0.5, radius=0.03)
Wd.spot('BagRim', (-0.1, 0.35, 1.2), (0.0, 0.0, 0.962), color=(0.8, 0.9, 1.0), power=60, size_deg=30, blend=0.7, radius=0.03)
cam = C.Cam()
cam.shot(0, NF, C.dolly((0.28, -0.42, 1.38), (0.07, -0.20, 1.17), look=(0.0, 0.01, 0.962), look1=(0.0, 0.01, 0.962)), lens=50, fstop=4.0, focus=Vector((0.0, 0.0, 0.965)))
go(cam, NF, a, sc, meter=NF // 2, target=0.24)
