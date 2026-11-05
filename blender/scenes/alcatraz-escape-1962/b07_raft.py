"""b07 (WIDE 24 mm, 'paddled away on a raft'): tan raincoat raft with three faceless dark silhouettes on black swell, fog, moon glitter. Low eased dolly alongside."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ax import *
a = core.args(); NF = arg(a, '--nf', 59, int)
sc = core.reset(); look(sc, vol=True, glare=0.5, vignette=0.28)
sea_night(NF, moon_dir=(0.05, 0.95, 0.2), moon=1.7, half=600, wave_scale=0.45, wind=7.0)
r = raft('Raft', (0, 0, 0.02), yaw=75, silhouettes=3)
bob(r, NF + 5, amp=0.07, period=75.0, roll=1.6)
sf_lights(center=(0, 2400, 4), radius=1200, n=700, seed=9, strength=40)
Wd.point('RaftFill', (-2.5, -3.5, 2.0), color=(0.6, 0.72, 1.0), power=70, radius=0.5)
_lf = bpy.data.objects.get('RaftFill')
if _lf is not None:
    _lf.visible_camera = False; _lf.visible_glossy = False
CN.haze(center=(0, 0, 2.5), size=(500, 500, 7), density=0.007, color=(0.7, 0.78, 0.95), anisotropy=0.5, noise=0.4, noise_scale=0.02)
cam = C.Cam(clip_end=8000)
cam.shot(0, NF, C.dolly((-6.5, -6.0, 0.75), (5.5, -6.6, 1.0), look=(0.5, 0.0, 0.55), look1=(0.2, 0.0, 0.55)), lens=24, fstop=6.3, focus=Vector((0, 0, 0.5)))
go(cam, NF, a, sc, meter=NF // 2, target=0.19)
