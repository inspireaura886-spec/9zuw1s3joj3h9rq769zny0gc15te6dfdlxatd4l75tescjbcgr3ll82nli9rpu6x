"""yonaguni b11_section (WIDE 28 mm, eased dolly; VO 'Solid bedrock, still attached to the sea floor. Not one placed block.'). Cutaway: the terraces sit on one continuous banded bedrock mass below the sand line; no separate blocks. Dolly.
NF default 144 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 144, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.22)
underwater(NF, depth=28, half=220, sun_az=70, sun_elev=64, sun_strength=5.0, density=0.022, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
CN.ground('SeaFloor', 'damp_beach_sand', (440, 220), center=(0, 110, -30.0), tile_m=4.0, tint=(0.62, 0.6, 0.52))
terraces('T', origin=(0, 0.5, -26), steps=6, rise=2.0, tread=2.6, width=14.0, seed=3)
m, nb, b, out = M.new('StrataM')
tc = nb.n('ShaderNodeTexCoord')
wv = nb.n('ShaderNodeTexWave', Scale=0.35, Distortion=1.5, Detail=4.0)
wv.wave_type = 'BANDS'
wv.bands_direction = 'Z'
nb.l(tc, 'Object', wv, 'Vector')
cr = nb.n('ShaderNodeValToRGB')
cr.color_ramp.elements[0].color = (0.3, 0.27, 0.21, 1)
cr.color_ramp.elements[1].color = (0.55, 0.5, 0.4, 1)
nb.l(wv, 'Fac', cr, 'Fac')
nb.l(cr, 'Color', b, 'Base Color')
b.inputs['Roughness'].default_value = 0.85
bed = boxm('Bedrock', (0, 25, -40.005), (80, 50, 20), m, 0.0)   # top 5 mm under the sand plane (no z-fight)
cam = C.Cam(clip_end=1500)
cam.shot(0, NF, C.dolly((-26, -34, -27), (-20, -32, -26.5), look=(0, 6, -28), look1=(2, 6, -27.5)), lens=24, fstop=9, focus=36.0)
go(cam, NF, a, sc, meter=NF // 2, target=0.2)
