"""nazca-lines-peru-2024 b04_figures (28 mm, crane over the figure; VO 'to draw a hummingbird, a monkey, a spider,'): High aerial over the hummingbird figure with the monkey and spider further off, harsh midday light.
NF default 101 = 8 words / 2.6 w/s at 30 fps + 8 handle frames."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 101, int)
sc = core.reset(); look(sc, vol=True, glare=0.3)
pampa(NF, sun_az=80, elev=55)
hummingbird(loc=(0, 0, 0))
monkey(loc=(160, 140, 0))
spider(loc=(-150, 170, 0), scale=1.0)
long_lines(n=5, seed=4)
cam = C.Cam(clip_end=20000)
ease_cam(cam, NF, C.dolly((-40, -170, 190), (-20, -140, 210), look=(0, 0, 0), look1=(10, 40, 0)), 28, fstop=11, focus=250.0)
go(cam, NF, a, sc, meter=NF // 2)
