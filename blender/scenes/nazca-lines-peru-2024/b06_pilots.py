"""nazca-lines-peru-2024 b06_pilots (28 mm, tracking dolly; VO 'Who said they were for the sky? Pilots helped make them famous.'): A small high-wing plane crosses above the pampa, figures below; camera tracks alongside.
NF default 147 = 12 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 147, int)
sc = core.reset(); look(sc, vol=True, glare=0.35)
pampa(NF, sun_az=60, elev=35)
hummingbird(loc=(60, 260, 0))
long_lines(n=5)
pl = light_plane(loc=(0, 0, 300))
key_loc(pl, [(0, (0, -40, 300)), (NF, (0, 120, 300))], interp='LINEAR')
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.dolly((-26, -55, 305), (-26, 105, 305), look=(0, -35, 299), look1=(0, 125, 299)), 28, fstop=8, focus=27.0)
go(cam, NF, a, sc, meter=NF // 2)
