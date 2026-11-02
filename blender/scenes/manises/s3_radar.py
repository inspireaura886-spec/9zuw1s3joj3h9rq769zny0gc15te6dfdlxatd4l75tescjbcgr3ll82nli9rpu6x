"""Manises 1979 test, plate 3 (95 f): 1970s radar scope, the airliner blip and two unknown echoes beside it.
VO 10.72-13.86 s 'Radar in Barcelona and Madrid cannot explain them.' Beam passes the blips on 'Madrid' (f~35)."""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from kit import core, camera as C, world as Wd, models as Md, mat as M, interiors as I

a = core.args()
sc = core.reset()
NF = 95
core.setup_render(sc, samples=48, look='AgX - Medium High Contrast', exposure=0.9, vol_step=2.0, vol_max_steps=128,
                  bounces=5)
core.finish(sc, glare=0.6, glare_thr=0.8, glare_size=8, vignette=0.45, lift=(0.99, 1.01, 1.03),
            gain=(1.0, 1.0, 0.97), sat=0.95)
w = Wd.hdri('moonless_golf', strength=0.02)
blips = [((0.30, 0.20), (0.31, 0.24), 3.0),      # the airliner
         ((0.46, 0.06), (0.38, 0.19), 4.0),      # unknown 1
         ((0.50, 0.13), (0.41, 0.25), 3.5)]      # unknown 2
I.radar_room(frames=NF, blips=blips, seed=3, haze=0.035, t0=0.38 - 1.18)
cam = C.Cam()
tgt = (0.06, 0.06, 1.03)
cam.shot(0, NF, C.dolly((0.32, -0.95, 1.62), (0.16, -0.55, 1.40), look=tgt, look1=(0.08, 0.07, 1.03)),
         lens=(40, 48), fstop=1.8, focus=tgt)
cam.handheld(0.003)
cam.bake(0, NF - 1)
core.render(a, sc)
