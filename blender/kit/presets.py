"""Scene presets for the IA mystery Shorts' common settings. Each builds lights/world/set and returns a dict of
useful points for camera moves. Combine with camera.Cam + core.render in a beat script.

    night_sky(...)      lights over a landscape at night (hills, ground fog, distant town, orbs in the sky)
    ocean_night(...)    open sea at night: FFT waves near camera + glossy far sea, moon glitter, small boat
    airliner_clouds(...) airliner over a moonlit volumetric cloud deck (see scenes/manises/s1_airliner.py)
    cockpit(...)        1970s jet cockpit looking out over clouds (interiors.cockpit)
    radar_room(...)     1970s radar room with animated PPI scope (interiors.radar_room)
    forest(...)         night pine forest (Poly Haven CC0 trees), moon shafts through volumetric fog, flashlight
    empty_road(...)     empty two-lane road at night, sodium street lamps, fog, tree line
"""
import bpy, math, random, os, glob
from mathutils import Vector
from . import world as Wd, mat as M, models as Md, interiors as I

ASSETS = lambda: os.environ.get('IA3D_ASSETS', os.path.expanduser('~/ia3d_assets'))


def gltf(aid, hide=True):
    """Import a Poly Haven glTF model once into its own (hidden) collection; returns the collection for instancing."""
    name = 'PH_' + aid
    if name in bpy.data.collections:
        return bpy.data.collections[name]
    f = glob.glob(os.path.join(ASSETS(), 'models', aid, '*.gltf'))
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    if not f:
        print('IA3D warn: model missing', aid)
        return col
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=f[0])
    new = [o for o in bpy.data.objects if o not in before]
    for o in new:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        col.objects.link(o)
    if hide:
        col.hide_render = False
        bpy.context.view_layer.layer_collection.children[name].exclude = True
    return col


def instance(col, loc, rot_z=0.0, scale=1.0, name=None):
    e = bpy.data.objects.new(name or ('inst_' + col.name), None)
    e.instance_type = 'COLLECTION'
    e.instance_collection = col
    e.location = loc
    e.rotation_euler = (0, 0, rot_z)
    e.scale = (scale, scale, scale)
    bpy.context.scene.collection.objects.link(e)
    return e


def scatter(col, n, area, seed=0, avoid=None, z_fn=None, scale=(0.8, 1.3)):
    """area = (xmin, xmax, ymin, ymax); avoid(x, y) -> True to skip (keep paths / camera lanes clear)."""
    rnd = random.Random(seed)
    out = []
    tries = 0
    while len(out) < n and tries < n * 20:
        tries += 1
        x, y = rnd.uniform(area[0], area[1]), rnd.uniform(area[2], area[3])
        if avoid and avoid(x, y):
            continue
        z = z_fn(x, y) if z_fn else 0.0
        out.append(instance(col, (x, y, z), rnd.uniform(0, 6.283), rnd.uniform(*scale)))
    return out


def night_sky(hdri='qwantani_night', moon_dir=(-0.3, 0.8, 0.35), town=True, fog=True, seed=0):
    Wd.hdri(hdri, strength=0.25, bg_strength=0.45, tint=(0.75, 0.85, 1.1), stars=0.2)
    Wd.moon(direction=moon_dir, strength=1.0)
    ground = M.texture_set('Ground', 'forest_ground_04', scale=0.08, tint=(0.35, 0.36, 0.32), box=True)
    Wd.terrain('Hills', size=6000, res=160, height=90, scale=0.0016, center=(0, 2000, -2), seed=seed, mat=ground)
    if town:
        Wd.city_lights('Town', center=(600, 3200, 25), radius=500, count=700, seed=seed + 3, strength=12, size=0.9)
    if fog:
        Wd.fog(center=(0, 1500, 15), size=(6000, 6000, 60), density=0.004, height_falloff=2.5, noise=0.5,
               noise_scale=0.004, color=(0.7, 0.75, 0.85))
    return {'horizon': Vector((0, 3000, 40)), 'sky': Vector((0, 1500, 300))}


def ocean_night(boat=True, moon_dir=(0.0, 1.0, 0.25), seed=0, frames=300):
    Wd.hdri('kloppenheim_02_puresky', strength=0.3, bg_strength=0.5, tint=(0.75, 0.85, 1.1), stars=0.2)
    Wd.moon(direction=moon_dir, strength=1.4)
    o = Wd.ocean(center=(0, 0, 0), spatial=60, res=11, wave_scale=1.4, choppy=1.0, time_frames=frames, wind=14)
    o.scale = (1, 1, 1)
    Wd.sea_plane(size=60000, z=-0.4, rough=0.08, frames=frames)
    Wd.fog(center=(0, 2000, 40), size=(8000, 8000, 160), density=0.0006, color=(0.7, 0.78, 0.9))
    b = Md.boat('Boat', (0, 8, 0.1)) if boat else None
    return {'boat': b, 'horizon': Vector((0, 3000, 0))}


def forest(n_trees=140, seed=1, path=True, moon_dir=(0.4, 0.5, 0.6), flashlight=True):
    Wd.hdri('moonless_golf', strength=0.12, bg_strength=0.2, tint=(0.7, 0.8, 1.0))
    Wd.moon(direction=moon_dir, strength=1.2, angle=0.4)
    ground = M.texture_set('ForestFloor', 'forest_ground_04', scale=0.25, tint=(0.4, 0.4, 0.36), box=True)
    Wd.terrain('Floor', size=240, res=80, height=2.0, scale=0.03, center=(0, 40, 0), seed=seed, mat=ground)
    fir = gltf('fir_tree_01')
    pine = gltf('pine_tree_01')
    lane = (lambda x, y: abs(x - 0.6 * math.sin(y * 0.05)) < 3.0) if path else None
    scatter(fir, n_trees // 2, (-60, 60, -10, 120), seed=seed, avoid=lane)
    scatter(pine, n_trees // 2, (-60, 60, -10, 120), seed=seed + 7, avoid=lane)
    Wd.fog(center=(0, 40, 6), size=(140, 160, 14), density=0.025, anisotropy=0.6, noise=0.5, noise_scale=0.08,
           height_falloff=1.2, color=(0.8, 0.85, 0.95))
    if flashlight:
        Wd.spot('Flashlight', (0.4, -2, 1.5), (0, 20, 1.0), color=(1.0, 0.9, 0.75), power=900, size_deg=22, blend=0.35)
    return {'path': [(0.6 * math.sin(y * 0.05), y, 1.6) for y in range(0, 100, 10)]}


def empty_road(length=600, lamps=12, seed=2, trees=True):
    Wd.hdri('narrow_moonlit_road', strength=0.15, bg_strength=0.3, tint=(0.75, 0.85, 1.05))
    Wd.moon(direction=(-0.4, 0.7, 0.4), strength=0.6)
    asph = M.texture_set('Asphalt', 'asphalt_02', scale=0.12, tint=(0.5, 0.5, 0.5), rough_mul=0.85, box=True)
    road = Wd.box('Road', (0, length / 2 - 20, -0.05), (7.5, length, 0.1))
    road.data.materials.append(asph)
    paint = M.principled('LinePaint', base=(0.75, 0.72, 0.6), rough=0.5, grime=0.4)
    for i in range(int(length / 9)):
        d = Wd.box('Dash%d' % i, (0, i * 9 - 18, 0.002), (0.14, 3.0, 0.01))
        d.data.materials.append(paint)
    ground = M.texture_set('Verge', 'forest_ground_04', scale=0.1, tint=(0.3, 0.32, 0.28), box=True)
    Wd.terrain('Verge', size=1400, res=120, height=6, scale=0.004, center=(0, length / 2, -0.4), seed=seed, mat=ground)
    lamp = gltf('street_lamp_01')
    for i in range(lamps):
        y = i * (length / lamps)
        instance(lamp, (4.6, y, 0), rot_z=math.pi, scale=1.0)
        Wd.spot('Sodium%d' % i, (3.6, y, 7.6), (1.5, y, 0), color=(1.0, 0.62, 0.25), power=1800, size_deg=75,
                blend=0.6, radius=0.15)
    if trees:
        fir = gltf('fir_tree_01')
        scatter(fir, 120, (-90, 90, -20, length), seed=seed, avoid=lambda x, y: abs(x) < 9, scale=(1.0, 1.6))
    Wd.fog(center=(0, length / 2, 8), size=(220, length + 60, 18), density=0.012, anisotropy=0.5, noise=0.4,
           noise_scale=0.02, height_falloff=0.8, color=(0.8, 0.8, 0.85))
    return {'start': Vector((0, -10, 1.6)), 'far': Vector((0, length * 0.6, 2))}
