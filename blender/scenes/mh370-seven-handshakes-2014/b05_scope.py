"""mh370 b05 (CLOSE 50 mm, accent 1 of 2; VO 'Two minutes later, the transponder went dark.'): the hero screen's
radar picture: the MAS370 label + blip blink out at 'dark' (~f56); the sweep continues. Slow push 3 %. NF default 91."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 91, int)
OFF = arg(a, '--off', 56, int)
sc = core.reset(); look(sc, vol=False, glare=0.5, vignette=0.3)
Wd.hdri('moonless_golf', strength=0.02)
vis = [(0, 1.0), (OFF - 6, 1.0), (OFF - 5, 0.0), (OFF - 3, 1.0), (OFF, 0.0), (NF, 0.0)]
control_room(NF, blips_hero=[((0.25, 0.10), (0.27, 0.15), 3.2, vis)], size=(16, 16, 3.4), haze=0.0, t0=0.6)
scr = bpy.data.objects['R0Scr2_0']
tm = M.emission('LabelM', (0.45, 1.0, 0.55), 5.0)
lab = text_obj('Label', 'MAS370\nFL350', (0, 0, 0), size=0.016, mat=tm)
lab.parent = scr
lab.location = (0.062, -0.003, 0.03)
lab.rotation_euler = (math.radians(90), 0, 0)
lead = curve_poly('Leader', [(0.052, -0.003, 0.024), (0.061, -0.003, 0.034)], bevel=0.0007, mat=tm)
lead.parent = scr
for o in (lab, lead):
    for f, h in ((0, False), (OFF - 5, True), (OFF - 3, False), (OFF, True)):
        o.hide_render = h; o.keyframe_insert('hide_render', frame=f)
c = scr.matrix_world.translation.copy()
cam = C.Cam()
cam.shot(0, NF, C.push_in(c + Vector((-0.12, -0.62, 0.12)), c + Vector((0.01, 0, 0.0)), amount=0.05), lens=50, fstop=2.8,
         focus=c)
go(cam, NF, a, sc, meter=OFF - 10, target=0.2)
