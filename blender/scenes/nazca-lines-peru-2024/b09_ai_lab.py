"""nazca-lines-peru-2024 b09_ai_lab (35 mm, lateral dolly; VO 'Then a Japanese team gave aerial photos to an IBM artificial intelligence.'): Dark lab: a monitor wall showing aerial pampa imagery (the real Delso photo on the screens) with candidate boxes.
NF default 147 = 12 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 147, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
c = artifact_set('artifact.jpg', 'monitor', warm=(0.7, 0.85, 1.0), h=0.9)
mat = bpy.data.objects['ArtPrint'].data.materials[0]
for i, x in enumerate((-1.6, 1.6)):
    o = bpy.data.objects['ArtPrint'].copy()
    o.location = (x, 2.9, 1.5)
    link(o)
box = glow_mat('Cand', (0.6, 0.95, 0.9), 3.0)
for i, (x, z) in enumerate(((-0.3, 1.7), (0.25, 1.4), (1.5, 1.6), (-1.7, 1.35))):
    ribbon('CandBox%d' % i, [(x - 0.12, z - 0.08), (x + 0.12, z - 0.08), (x + 0.12, z + 0.08), (x - 0.12, z + 0.08)], 0.012, box, z=0.0, closed=True).rotation_euler = (math.radians(90), 0, 0)
    bpy.data.objects['CandBox%d' % i].location = (0, 2.88, 0)
    key_fac(box, [(0, 0.0), (int(NF * 0.3), 1.0)])
cam = C.Cam(clip_end=50)
ease_cam(cam, NF, C.dolly((-1.6, -1.0, 1.55), (0.9, -1.1, 1.5), look=(-0.6, 2.9, 1.5), look1=(0.8, 2.9, 1.5)), 35, fstop=5.6, focus=4.0)
go(cam, NF, a, sc, meter=NF // 2)
