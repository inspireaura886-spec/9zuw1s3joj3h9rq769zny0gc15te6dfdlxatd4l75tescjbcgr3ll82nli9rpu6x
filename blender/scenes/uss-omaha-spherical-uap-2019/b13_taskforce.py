"""uss-omaha-spherical-uap-2019 b13_taskforce (35 mm, lateral dolly; VO 'and passed it to its team for unexplained sightings.'): Briefing room: a closed folder and a monitor with the IR frame (recreation) under a desk lamp.
NF default 112 = 9 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 112, int)
sc = core.reset(); look(sc, vol=True, glare=0.3)
tm = thermal_screen_mat('Thermal', NF, x0=0.45, x1=0.45, stop=0.01, sink=0.99)
c = artifact_set('artifact.jpg', 'monitor', warm=(1.0, 0.85, 0.65), h=0.9)
bpy.data.objects['ArtPrint'].data.materials[0] = tm
fold = mat_once('Folder', base=(0.45, 0.33, 0.18), rough=0.7)
boxm('Folder', (0.4, 2.2, 0.77), (0.42, 0.32, 0.02), fold)
cam = C.Cam(clip_end=50)
ease_cam(cam, NF, C.dolly(c + Vector((-0.9, -2.6, -0.2)), c + Vector((0.5, -2.5, -0.25)), look=c - Vector((0, 0, 0.3))), 35, fstop=5.6, focus=2.6)
go(cam, NF, a, sc, meter=NF // 2)
