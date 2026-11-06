"""yonaguni b08_eyes (CLOSE accent 50 mm, push-in; VO 'and saw castles, roads, even carved eyes.'). CLOSE accent: a rounded boulder with two shallow hollows, the 'carved eyes' claim; natural worn surface. Push-in.
NF default 87 (--nf). Code batch 2026-11-05, not rendered. Natural-rock telling."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
a = core.args(); NF = arg(a, '--nf', 87, int)
sc = core.reset(); look(sc, vol=True, glare=0.35, vignette=0.26)
underwater(NF, depth=28, half=220, sun_az=70, sun_elev=70, sun_strength=5.0, density=0.03, scatter=(0.3, 0.68, 0.75),
           absorb=(0.08, 0.38, 0.45), up=(0.3, 0.7, 0.78), mid=(0.03, 0.17, 0.22), down=(0.0, 0.02, 0.03))
sea_floor(28.0, 440.0)
terraces('T', origin=(0, 8, -26), steps=4, rise=2.0, tread=2.6, width=12.0, seed=3)
st = sandstone_mat('EyeStone', algae=0.4)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=1.6, location=(0, 0, -24.6))
rock = bpy.context.active_object
rock.name = 'EyeRock'
rock.scale = (1.15, 1.0, 0.85)
for k, x in enumerate((-0.5, 0.5)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.36, location=(x, -1.55, -24.35))
    cutter = bpy.context.active_object
    cutter.name = 'EyeCut%d' % k
    cutter.hide_render = True
    bo = rock.modifiers.new('Hollow%d' % k, 'BOOLEAN')
    bo.operation = 'DIFFERENCE'
    bo.object = cutter
dmod = rock.modifiers.new('D', 'DISPLACE')
tx = bpy.data.textures.new('EyeT', 'CLOUDS')
tx.noise_scale = 0.4
dmod.texture = tx
dmod.strength = 0.12
rock.data.materials.append(st)
cam = C.Cam(clip_end=800)
cam.shot(0, NF, C.push_in((0.4, -6.2, -23.9), (0, -1.2, -24.4), amount=0.16), lens=50, fstop=4.0, focus='EyeRock')
go(cam, NF, a, sc, meter=NF // 2, target=0.21)
