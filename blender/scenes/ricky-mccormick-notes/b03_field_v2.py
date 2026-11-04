"""mccormick b03 CINE LOOK v2 look test (NOT in the final render plan; b03_field.py stays the plate).
Cornfield at dusk: low eased push-in along a rutted farm track (Poly Haven aerial_mud_1 scan) between two walls of
back-lit corn, into a low golden sun (real HDRI industrial_sunset_02 = a crop field at sunset, rotated so its sun
sits behind the key sun). Hero in focus: scanned roadside weeds (dandelion_01, grass_medium_01/02, weed_plant_02,
nettle_plant) at 1.3-1.6 m, 50 mm f/2.8; corn + road fall off into warm haze. No body, no figure (sensitivity rule)."""
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
from kit import cine as CN

a = core.args(); NF = arg(a, '--nf', 157, int)
sc = core.reset()
CN.setup(sc, samples=arg(a, '--spp', 160, int), exposure=arg(a, '--ev', 0.0, float), vol_step=arg(a, '--vstep', 1.5, float), glare=0.35, vignette=0.2, lift=(0.99, 1.0, 1.035),
         gain=(1.03, 1.0, 0.95))

SUN_AZ, SUN_EL = 97.0, 16.0          # just left of straight down the track (+Y): corn wall shadows rake the road
CN.hdri_sun('industrial_sunset_02', sun_az=SUN_AZ, strength=1.0)
CN.sun(elev=SUN_EL, az=SUN_AZ, warmth='golden', strength=5.0, angle=1.0)

ROAD_W = 3.4
# ---- ground: scanned rutted track + farm soil under the corn
CN.ground('Track', 'aerial_mud_1', (ROAD_W + 0.6, 240), center=(0, 110, 0.0), tile_m=4.5, tint=(0.95, 0.88, 0.8))
for sx in (-1, 1):
    CN.ground('Soil%d' % sx, 'farm_soil', (140, 240), center=(sx * (ROAD_W / 2 + 70), 110, -0.005), tile_m=3.0,
              tint=(0.6, 0.53, 0.46))


# ---- corn v2: same plant generator, film material (per-plant variation, dry patches, translucent back-light)
def corn_mat_v2():
    m, nb, b, out = M.new('CornLeafV2')
    oi = nb.n('ShaderNodeObjectInfo')
    cr = nb.n('ShaderNodeValToRGB')
    cr.color_ramp.elements[0].color = (0.045, 0.085, 0.022, 1)
    cr.color_ramp.elements[1].color = (0.13, 0.16, 0.045, 1)
    nb.l(oi, 'Random', cr, 'Fac')
    tc = nb.n('ShaderNodeTexCoord')
    nz = nb.n('ShaderNodeTexNoise', Scale=2.2, Detail=5.0)
    nb.l(tc, 'Object', nz, 'Vector')
    dry = nb.n('ShaderNodeMapRange')
    dry.inputs['From Min'].default_value = 0.56
    dry.inputs['From Max'].default_value = 0.72
    nb.l(nz, 'Fac', dry, 'Value')
    mx = nb.n('ShaderNodeMix')
    mx.data_type = 'RGBA'
    nb.l(dry, 'Result', mx, 'Factor')
    nb.l(cr, 'Color', mx, 6)
    mx.inputs[7].default_value = (0.32, 0.25, 0.09, 1)        # sun-dried leaf tone
    nb.l(mx, 2, b, 'Base Color')
    b.inputs['Roughness'].default_value = 0.42
    b.inputs['Specular IOR Level'].default_value = 0.45
    # streaky venation bump along the leaf
    wv = nb.n('ShaderNodeTexWave', Scale=60.0, Distortion=1.5, Detail=3.0)
    nb.l(tc, 'Object', wv, 'Vector')
    bp = nb.n('ShaderNodeBump', Strength=0.15)
    nb.l(wv, 'Fac', bp, 'Height')
    nb.l(bp, 'Normal', b, 'Normal')
    tr = nb.n('ShaderNodeBsdfTranslucent')
    hs = nb.n('ShaderNodeHueSaturation')
    hs.inputs['Saturation'].default_value = 1.25
    hs.inputs['Value'].default_value = 1.6
    nb.l(mx, 2, hs, 'Color')
    nb.l(hs, 'Color', tr, 'Color')
    ms = nb.n('ShaderNodeMixShader')
    ms.inputs['Fac'].default_value = 0.38
    nb.l(b, 'BSDF', ms, 1)
    nb.l(tr, 'BSDF', ms, 2)
    nb.l(ms, 'Shader', out, 'Surface')
    return m


rnd = random.Random(11)
pcol = bpy.data.collections.new('CornProtoV2')
sc.collection.children.link(pcol)
cm = corn_mat_v2()
protos = []
for k in range(6):
    p = corn_plant('CornV2_%d' % k, height=rnd.uniform(1.9, 2.3), seed=40 + k)
    p.data.materials.append(cm)
    c2 = bpy.data.collections.new('CornV2P%d' % k)
    pcol.children.link(c2)
    c2.objects.link(p)
    protos.append(c2)
bpy.context.view_layer.layer_collection.children['CornProtoV2'].exclude = True
n = 0
for side in (-1, 1):
    r = 0
    while True:
        x0 = side * (ROAD_W / 2 + 0.45 + r * 0.76)
        if abs(x0) > 70:
            break
        yy = -6.0
        while yy < 230:
            near = abs(x0) < 14 and yy < 70
            sp = 0.24 if near else 0.24 * (1 + yy / 50.0) * (1 + abs(x0) / 25.0)
            yy += sp * rnd.uniform(0.8, 1.2)
            # widen the field with distance so the vertical frame never sees its sides
            if abs(x0) > 6 + yy * 0.32:
                continue
            e = P.instance(protos[rnd.randrange(6)], (x0 + rnd.uniform(-0.06, 0.06), yy, 0), rnd.uniform(0, 6.283),
                           rnd.uniform(0.9, 1.12))
            e.rotation_euler = (rnd.uniform(-0.05, 0.05), rnd.uniform(-0.05, 0.05), e.rotation_euler[2])
            n += 1
        r += 1
print('IA3D corn v2 instances', n)

# ---- dense roadside dressing: scanned grass verges + weeds, debris + stones on the track
edge = lambda x, y: (not (ROAD_W / 2 - 0.35 < abs(x) < ROAD_W / 2 + 0.55)) or (y < 1.2 and abs(x + 1.15) < 0.75)
CN.scatter('grass_medium_01', 340, (-ROAD_W / 2 - 0.6, ROAD_W / 2 + 0.6, -3, 60), seed=1, avoid=edge, scale=(0.7, 1.3))
CN.scatter('grass_medium_02', 260, (-ROAD_W / 2 - 0.6, ROAD_W / 2 + 0.6, -3, 60), seed=2, avoid=edge, scale=(0.8, 1.4))
CN.scatter('grass_medium_02', 120, (-0.35, 0.35, 0.5, 60), seed=3, scale=(0.5, 0.9))        # crown strip between ruts
CN.scatter('weed_plant_02', 40, (-ROAD_W / 2 - 0.6, ROAD_W / 2 + 0.6, -2, 40), seed=4, avoid=edge, scale=(0.8, 1.2))
CN.scatter('nettle_plant', 30, (-ROAD_W / 2 - 0.6, ROAD_W / 2 + 0.6, -2, 40), seed=5, avoid=edge, scale=(0.8, 1.2))
CN.scatter('dandelion_01', 40, (-ROAD_W / 2 - 0.6, ROAD_W / 2 + 0.6, -2, 30), seed=6, avoid=edge, scale=(0.9, 1.2))
CN.scatter('dry_branches_medium_01', 10, (-ROAD_W / 2, ROAD_W / 2, 2, 30), seed=7, scale=(0.6, 1.0), tilt=0.0)

# ---- hero cluster (in focus): left verge, 1.4 m ahead of the camera's start
CAM_X = -1.15
HERO = Vector((-1.38, 1.55, 0.16))
CN.place('dandelion_01', (HERO.x + 0.03, HERO.y, 0), rot=(0, 0, 0.6), scale=1.15, name='HeroDandelion')
CN.place('grass_medium_01', (HERO.x - 0.16, HERO.y + 0.18, 0), rot=(0, 0, 1.9), scale=1.2, name='HeroGrassA')
CN.place('weed_plant_02', (HERO.x + 0.12, HERO.y - 0.16, 0), rot=(0, 0, 2.6), scale=1.0, name='HeroWeed')
CN.place('grass_medium_02', (HERO.x - 0.05, HERO.y - 0.32, 0), rot=(0, 0, 0.3), scale=1.1, name='HeroGrassB')

CN.haze(center=(0, 110, 12), size=(150, 240, 24), density=0.0075, color=(1.0, 0.9, 0.78), anisotropy=0.66,
        noise=0.3, noise_scale=0.05, height_falloff=1.4)

cam = C.Cam()
P0 = Vector((CAM_X, -0.25, 0.42))
P1 = Vector((CAM_X, 0.10, 0.45))
LOOK = Vector((-0.6, 40.0, 2.2))
CN.shot(cam, 0, NF, C.dolly(P0, P1, look=LOOK), lens=50, fstop=2.8, focus=HERO)
CN.render(cam, NF, a, sc, meter_frame=NF // 2)
