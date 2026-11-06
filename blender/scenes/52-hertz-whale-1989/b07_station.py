"""52hz b07_station (WIDE 28 mm, eased dolly; VO 'When the Navy opened its recordings, Woods Hole ocean scientists followed that voice for twelve years.'). Slow lateral dolly along the empty station: rows of screens, one carrying the real gram; WHOI chip in Remotion.
NF default 191 (--nf). Code batch 2026-11-05, not rendered."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 191, int)
sc = core.reset(); look(sc, vol=True, glare=0.45, vignette=0.24)
gradient_world('Room', up=(0.02, 0.025, 0.03), mid=(0.01, 0.012, 0.015), down=(0.0, 0.0, 0.0), light=0.2)
listening_room(NF, hero_img='artifact_spectrogram.jpg', n_desks=5)
CN.haze(center=(0, -1, 1.6), size=(14, 10, 3.2), density=0.01, color=(0.8, 0.88, 0.95), anisotropy=0.4, noise=0.25, height_falloff=0.0)
cam = C.Cam(clip_end=200)
cam.shot(0, NF, C.dolly((-4.4, -4.6, 1.8), (-1.4, -4.4, 1.75), look=(-2.4, 0.5, 1.2), look1=(0.4, 0.5, 1.2)), lens=28, fstop=5.6, focus=5.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.19)
