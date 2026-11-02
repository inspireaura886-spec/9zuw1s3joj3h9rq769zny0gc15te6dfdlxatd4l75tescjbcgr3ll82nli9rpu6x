"""HUMANS test plate 1 (90 f, 3 s): the WITNESS on an empty night road raises his arm and points at two red lights
in the sky while his head lifts to follow them. CMU mocap point_sky (13_27) + foot lock + look-at; slow cruise
push-in from behind-left (no shake). Also writes motion_qa.json (foot slide, jerk) into --out."""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from kit import core, camera as C, world as Wd, models as Md, mat as M, presets as P, humans as Hm
from kit import retarget as RT
from mathutils import Vector
import numpy as np

a = core.args()
sc = core.reset()
NF = 90
core.setup_render(sc, samples=20, look='AgX - Medium High Contrast', exposure=1.15, vol_step=8.0, vol_max_steps=32,
                  bounces=4, clamp_ind=4.0)
core.finish(sc, glare=0.6, glare_thr=1.0, glare_size=8, vignette=0.4, lift=(0.98, 1.0, 1.05), gain=(1.04, 1.0, 0.96),
            sat=0.95)

# --- set: the empty_road preset, lighter (shorter road, sparse trees kept away from the sky lane) ---
L = 260
P.empty_road(length=L, lamps=6, trees=False)
fir = P.gltf('fir_tree_01')
P.scatter(fir, 46, (-70, 70, 10, L), seed=4, avoid=lambda x, y: abs(x) < 15, scale=(0.9, 1.4))

# --- the witness ---
W0 = Vector((-0.6, 44.0, 0.0))
w = Hm.witness(loc=W0, yaw=180)              # faces +Y, down the road
pose = w.mocap('point_sky', t0=0.4, frames=NF)
RT.foot_lock(pose)
# where his right hand points at the top of the gesture -> put the lights there
fpk = 58
sh = w.joint(pose, fpk, 'RightArm')
hd = w.joint(pose, fpk, 'RightHand')
d = (hd - sh).normalized()
if d.z < 0.35:
    d.z = 0.35
    d.normalize()
o1p = sh + d * 150.0
o2p = o1p + Vector((14.0, 6.0, -5.0))
o1 = Md.orb('Red1', o1p, color=(1.0, 0.09, 0.03), strength=55, power=4e4, radius=1.6, halo=1.0, pulse=0.06, f1=NF, seed=1)
o2 = Md.orb('Red2', o2p, color=(1.0, 0.09, 0.03), strength=55, power=4e4, radius=1.6, halo=1.0, pulse=0.06, f1=NF, seed=2)
Md.fly(o1, [(0, tuple(o1p), None), (NF, tuple(o1p + Vector((3.0, 1.0, 0.8))), None)], interp='LINEAR')
Md.fly(o2, [(0, tuple(o2p), None), (NF, tuple(o2p + Vector((2.0, 0.5, -0.4))), None)], interp='LINEAR')
# head follows the lights as the arm comes up (weight 0.2 -> 1)
tgt = w.to_arm(o1p)
RT.look_at(pose, tgt, weight=lambda f: 0.2 + 0.8 * Hm.ramp(f, 18, 52))
RT.smooth_pose(pose, 1.0)
w.apply(pose)
os.makedirs(a.out, exist_ok=True)
idle = w.mocap('idle_stand', t0=1.0, frames=NF)
RT.foot_lock(idle)
walk = w.mocap('walk_slow', t0=0.5, frames=120)
RT.foot_lock(walk)
Hm.qa_json(os.path.join(a.out, 'motion_qa.json'), witness_point=pose, idle_stand=idle, walk_slow=walk)

# soft cool fill so the figure separates from the dark verge (no face close-up)
Wd.area('WitnessFill', tuple(W0 + Vector((-3.0, -2.5, 2.5))), tuple(W0 + Vector((0, 0, 1.4))), color=(0.6, 0.7, 1.0),
        power=35, size=3.0)

# --- camera: low behind-left, slow cruise push toward him with the lights in the upper frame ---
chest0 = Vector(w.joint(pose, 0, 'Spine1'))
look0 = chest0 + (o1p - chest0).normalized() * 3.2
look1 = chest0 + (o1p - chest0).normalized() * 4.2
cam = C.Cam()
cam.shot(0, NF, C.dolly(tuple(W0 + Vector((-2.4, -4.6, 0.95))), tuple(W0 + Vector((-2.0, -3.7, 1.0))), look=tuple(look0),
                        look1=tuple(look1)), lens=(22, 23.5), fstop=4.0, focus=tuple(chest0))
cam.bake(0, NF - 1)
sc.frame_start, sc.frame_end = 0, NF - 1
core.render(a, sc)
