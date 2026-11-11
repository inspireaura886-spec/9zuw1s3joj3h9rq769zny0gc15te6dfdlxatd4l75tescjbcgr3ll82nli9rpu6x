"""REAL3D kit core: args, scene reset, Cycles render settings, AgX grade, compositor finish, render driver + timing.
Blender 4.2 LTS, run headless:  blender -b --factory-startup -P scene.py -- --start A --end B --out DIR --assets DIR
"""
import bpy, sys, os, json, time, argparse, math

FPS = 30
W, H = 1080, 1920


def args():
    """Parse the args after '--'. Unknown args are kept in .extra for the scene."""
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument('--start', type=int, default=0)
    p.add_argument('--end', type=int, default=0)
    p.add_argument('--out', default=os.path.abspath('frames'))
    p.add_argument('--assets', default=os.path.expanduser('~/ia3d_assets'))
    p.add_argument('--stills', default='')
    p.add_argument('--samples', type=int, default=0, help='override samples (0 = scene default)')
    p.add_argument('--pct', type=int, default=100, help='resolution percentage (stills/look checks)')
    p.add_argument('--words', default='', help='words.json for timing hooks')
    p.add_argument('--save-blend', default='', help='also save the built .blend here')
    a, extra = p.parse_known_args(argv)
    a.extra = extra
    os.environ['IA3D_ASSETS'] = a.assets
    return a


def reset():
    """Empty scene (factory startup still has cube/light/camera)."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.fps = FPS
    return sc


def setup_render(sc, samples=48, pct=100, motion_blur=True, shutter=0.5, look='AgX - Medium High Contrast',
                 exposure=0.0, gamma=1.0, bounces=6, vol_step=4.0, vol_max_steps=96, clamp_ind=6.0,
                 adaptive=0.04, filmic_film=1.5):
    """Cycles CPU + OIDN, AgX, persistent data. Low samples + denoise is the fast realistic setting."""
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    cy.samples = samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = adaptive
    cy.use_denoising = True
    try:
        cy.denoiser = 'OPENIMAGEDENOISE'
        cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
        cy.denoising_prefilter = 'ACCURATE'
    except Exception:
        pass
    cy.max_bounces = bounces
    cy.diffuse_bounces = 3
    cy.glossy_bounces = 3
    cy.transmission_bounces = 6
    cy.volume_bounces = 1
    cy.transparent_max_bounces = 8
    cy.sample_clamp_indirect = clamp_ind
    cy.blur_glossy = 1.0
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    try:
        cy.volume_step_rate = vol_step
        cy.volume_preview_step_rate = vol_step
        cy.volume_max_steps = vol_max_steps
    except Exception:
        pass
    cy.film_exposure = 1.0
    cy.pixel_filter_width = filmic_film
    r = sc.render
    r.resolution_x, r.resolution_y, r.resolution_percentage = W, H, pct
    r.fps = FPS
    r.use_persistent_data = True
    r.use_motion_blur = motion_blur
    r.motion_blur_shutter = shutter
    r.motion_blur_position = 'START'  # never smear across a hard cut (camera keys go CONSTANT at cuts)
    r.image_settings.file_format = 'PNG'
    r.image_settings.color_mode = 'RGB'
    r.image_settings.color_depth = '8'
    r.image_settings.compression = 15
    r.film_transparent = False
    try:
        r.threads_mode = 'AUTO'
    except Exception:
        pass
    vs = sc.view_settings
    vs.view_transform = 'AgX'
    try:
        vs.look = look
    except TypeError:
        try:
            vs.look = 'AgX - ' + look.split(' - ')[-1]
        except Exception:
            print('look not found', look)
    vs.exposure = exposure
    vs.gamma = gamma
    sc.display_settings.display_device = 'sRGB'
    return sc


def _set(node, names, value):
    """Set a node input or property by any of several names (socket names moved between 4.x releases)."""
    for n in names:
        if n in node.inputs:
            node.inputs[n].default_value = value
            return True
    for n in names:
        p = n.lower()
        if hasattr(node, p):
            setattr(node, p, value)
            return True
    print('IA3D warn: no input', names, 'on', node.bl_idname, [i.name for i in node.inputs])
    return False


def finish(sc, glare=0.55, glare_thr=1.2, glare_size=8, vignette=0.35, lens_dist=-0.012, dispersion=0.006,
           lift=(1.0, 1.0, 1.04), gain=(1.03, 1.0, 0.96), sat=0.92, streaks=0.0):
    """Compositor 'lens' finish: fog-glow bloom on HDR highlights, optional streaks, light barrel distortion with
    chromatic dispersion, vignette, colour balance (cool shadows / warm highlights), slight desaturation.
    Film grain + final LUT happen in Remotion so plates stay clean for compression."""
    sc.use_nodes = True
    nt = sc.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    N = nt.nodes.new
    L = nt.links.new
    rl = N('CompositorNodeRLayers')
    cur = rl.outputs['Image']
    glare_thr = max(glare_thr, 1.2)  # escapement rule (2026-11-11): only real highlights may bloom, never mid-tones
    glare = min(glare, 0.35)
    if glare > 0:
        g = N('CompositorNodeGlare')
        g.glare_type = 'FOG_GLOW'
        g.quality = 'MEDIUM'
        g.threshold = glare_thr
        g.size = glare_size
        g.mix = -1 + glare  # -1 = only image, 0 = 50/50
        L(cur, g.inputs['Image'])
        cur = g.outputs['Image']
    if streaks > 0:
        s = N('CompositorNodeGlare')
        s.glare_type = 'STREAKS'
        s.quality = 'MEDIUM'
        s.threshold = glare_thr * 2.5
        s.streaks = 4
        s.angle_offset = math.radians(12)
        s.fade = 0.88
        s.mix = -1 + streaks
        L(cur, s.inputs['Image'])
        cur = s.outputs['Image']
    if lens_dist or dispersion:
        ld = N('CompositorNodeLensdist')
        ld.use_fit = True
        _set(ld, ('Distort', 'Distortion'), lens_dist)
        _set(ld, ('Dispersion',), dispersion)
        L(cur, ld.inputs['Image'])
        cur = ld.outputs['Image']
    cb = N('CompositorNodeColorBalance')
    cb.correction_method = 'LIFT_GAMMA_GAIN'
    cb.lift = lift
    cb.gain = gain
    L(cur, cb.inputs['Image'])
    cur = cb.outputs['Image']
    hs = N('CompositorNodeHueSat')
    _set(hs, ('Saturation',), sat)
    L(cur, hs.inputs['Image'])
    cur = hs.outputs['Image']
    if vignette > 0:
        em = N('CompositorNodeEllipseMask')
        em.width, em.height = 0.92, 0.80
        bl = N('CompositorNodeBlur')
        bl.filter_type = 'FAST_GAUSS'
        bl.use_relative = True
        bl.factor_x = bl.factor_y = 30
        bl.size_x = bl.size_y = 300
        L(em.outputs['Mask'], bl.inputs['Image'])
        mr = N('CompositorNodeMapRange')
        mr.inputs['To Min'].default_value = 1 - vignette
        mr.inputs['To Max'].default_value = 1.0
        L(bl.outputs['Image'], mr.inputs['Value'])
        mx = N('CompositorNodeMixRGB')
        mx.blend_type = 'MULTIPLY'
        L(cur, mx.inputs[1])
        L(mr.outputs['Value'], mx.inputs[2])
        cur = mx.outputs['Image']
    out = N('CompositorNodeComposite')
    L(cur, out.inputs['Image'])
    return nt


def render(a, sc=None, frames=None):
    """Render frames a.start..a.end (or the --stills list) to a.out/%05d.png and write timing.json."""
    sc = sc or bpy.context.scene
    if a.samples:
        sc.cycles.samples = a.samples
    if a.pct != 100:
        sc.render.resolution_percentage = a.pct
    if a.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=a.save_blend)
    os.makedirs(a.out, exist_ok=True)
    stills = [int(x) for x in a.stills.split(',') if x.strip()] if a.stills else None
    todo = stills if stills is not None else list(range(a.start, a.end + 1))
    if frames is not None:
        todo = frames
    times = []
    t0 = time.time()
    for f in todo:
        t = time.time()
        sc.frame_set(f)
        sc.render.filepath = os.path.join(a.out, '%05d.png' % f)
        bpy.ops.render.render(write_still=True)
        times.append(round(time.time() - t, 2))
        print('IA3D frame %d %.1fs' % (f, times[-1]), flush=True)
    wall = time.time() - t0
    info = {'frames': len(todo), 'first': todo[0] if todo else None, 'render_s': round(wall, 1),
            's_per_frame': round(wall / max(1, len(todo)), 2), 'per_frame': times, 'wall_s': round(wall, 1),
            'samples': sc.cycles.samples, 'res': [sc.render.resolution_x, sc.render.resolution_y,
                                                  sc.render.resolution_percentage], 'cpus': os.cpu_count()}
    json.dump(info, open(os.path.join(a.out, 'timing.json'), 'w'))
    print('IA3D timing', json.dumps({k: v for k, v in info.items() if k != 'per_frame'}), flush=True)
    return info
