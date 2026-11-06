"""usa-32-farrah-2026 b09_actress (50 mm, slow orbit (close accent); VO 'Yes, the name matches the actress.'): ACCENT: close on the foil flank with a stencilled FARRAH III plate; the camera drifts past it.
NF default 89 = words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 89, int)
sc = core.reset(); look(sc, vol=False, glare=0.3)
space(sun_az=70, sun_strength=3.6); earth()
root, parts = satellite('USA32', (0, 0, 0), spin_deg=0, NF=NF)
label_text('FarrahTag', 'FARRAH III', (0, -3.05, 0.2), size=0.8, parent=root)
cam = C.Cam(clip_end=9000)
ease_cam(cam, NF, C.orbit((0, 0, 0), r=15, a0=-104, a1=-80, h=(1.5, 2.5), look_h=0.0), 50, fstop=5.6, focus=15.0)
go(cam, NF, a, sc, meter=NF // 2)
