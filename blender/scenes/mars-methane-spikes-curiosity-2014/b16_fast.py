"""mars b16_fast (WIDE 24 mm, crane up; VO 'Something is destroying it, fast. Nobody explained it.'). Dusk: pull back and up from the rover over the darkening crater. Loops to b01.
NF default 98 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 98, int)
sc = core.reset(); look(sc, vol=True, glare=0.4, vignette=0.24)
mars_world('dusk', sun_elev=4, sun_az=250, sun_strength=3.0, haze_density=0.0009)
crater('Gale', size=9000, res=240)
rover('Rover', loc=on_floor(0, -1500), yaw=200, NF=NF)
cam = C.Cam(clip_end=40000)
cam.shot(0, NF, C.dolly(on_floor(-12, -1515, 4), on_floor(-60, -1580, 40), look=on_floor(0, -1500, 1), look1=on_floor(0, -1450, 0)), lens=26, fstop=8, focus=40.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.18)
