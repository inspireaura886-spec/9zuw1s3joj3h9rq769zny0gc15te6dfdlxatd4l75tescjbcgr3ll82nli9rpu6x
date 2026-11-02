"""REAL3D people: the two reusable MPFB characters + CMU mocap, retargeted in kit/retarget.py (numpy).

    from kit import humans as Hm
    w = Hm.witness(loc=(-1.2, 40, 0), yaw=180)       # yaw 0 = faces -Y (MPFB default); 180 = faces +Y
    p = w.mocap('point_sky', t0=0.4, frames=90)      # RT.Pose: smoothed, resampled to 30 fps, feet on the ground
    Hm.RT.foot_lock(p)                               # pin planted feet (no sliding)
    Hm.RT.look_at(p, w.to_arm(orb_world), weight=lambda f: Hm.ramp(f, 20, 45))
    w.apply(p)                                       # bakes LINEAR keys on the pose bones, frame 0..frames-1

    pl = Hm.pilot(loc=(0, 0, 0), yaw=180)            # seat it with Hm.seat_pilot(...) for the 1970s cockpit
Characters live in R/blender/humans/humans.blend (built once by humans/build_humans.py with MPFB 2.0.18, CC0 assets).
Clips live in R/blender/humans/mocap/*.bvh (CMU Graphics Lab mocap, trimmed). Licences: R/blender/humans/LICENSES.md.
"""
import bpy, os, math
import numpy as np
from mathutils import Vector, Matrix, Quaternion
from . import retarget as RT

HUM = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'humans')
BLEND = os.path.join(HUM, 'humans.blend')
MOCAP = os.path.join(HUM, 'mocap')
_CLIPS = {}


def ramp(f, a, b):
    """Smoothstep 0 -> 1 between frames a and b."""
    t = max(0.0, min(1.0, (f - a) / max(1e-6, b - a)))
    return t * t * (3 - 2 * t)


def clip(name):
    if name not in _CLIPS:
        _CLIPS[name] = RT.Clip(os.path.join(MOCAP, name + '.bvh'))
    return _CLIPS[name]


class Human:
    def __init__(self, colname, loc=(0, 0, 0), yaw=0.0, name=None):
        with bpy.data.libraries.load(BLEND, link=False) as (src, dst):
            dst.collections = [colname]
        col = dst.collections[0]
        if name:
            col.name = name
        bpy.context.scene.collection.children.link(col)
        self.col = col
        self.rig = next(o for o in col.all_objects if o.type == 'ARMATURE')
        self.rig.location = loc
        self.rig.rotation_mode = 'XYZ'
        self.rig.rotation_euler = (0, 0, math.radians(yaw))
        bpy.context.view_layer.update()
        bones = [(b.name, b.parent.name if b.parent else '', tuple(b.head_local), tuple(b.tail_local))
                 for b in self.rig.data.bones]
        self.def_ = RT.Rig(bones)
        self.rest = np.array([tuple(self.rig.data.bones[n].matrix_local.to_quaternion()) for n in self.def_.names])
        for o in col.all_objects:
            if o.type == 'MESH':
                o.cycles.use_motion_blur = True
        self.meshes = [o for o in col.all_objects if o.type == 'MESH']

    # ---- space conversions (pose maths is in armature space) ----
    def to_arm(self, p):
        return np.array(self.rig.matrix_world.inverted() @ Vector(p))

    def to_world(self, p):
        return self.rig.matrix_world @ Vector(tuple(p))

    def mocap(self, name, t0=0.0, frames=None, t1=None, speed=1.0, sigma_s=0.03, hold=None, align_yaw=True):
        c = clip(name)
        if frames is not None:
            t1 = t0 + frames * speed / 30.0
        p = RT.retarget(c, self.def_, t0=t0, t1=t1, fps=30, speed=speed, sigma_s=sigma_s, hold=hold, align_yaw=align_yaw)
        if frames is not None and p.F != frames:  # pad / trim to exact length
            idx = np.clip(np.arange(frames), 0, p.F - 1)
            p.L, p.root, p.F, p.D = p.L[idx], p.root[idx], frames, None
            p.fk()
        return p

    def joint(self, pose, f, name, tail=False):
        b = pose.bone(name)
        return self.to_world(pose.tail(f, b) if tail else pose.H[f, b])

    def apply(self, pose, frame0=0):
        """Bake the pose as LINEAR quaternion keys on every pose bone (+ root location)."""
        rig = self.rig
        if rig.animation_data is None:
            rig.animation_data_create()
        act = bpy.data.actions.new(rig.name + '_mocap')
        rig.animation_data.action = act
        F = pose.F
        frames = np.arange(F, dtype=float) + frame0
        for b, n in enumerate(self.def_.names):
            pb = rig.pose.bones[n]
            pb.rotation_mode = 'QUATERNION'
            Rr = np.broadcast_to(self.rest[b], (F, 4))
            basis = RT.qnorm(RT.qmul(RT.qmul(RT.qconj(Rr), pose.L[:, b]), Rr))
            for f in range(1, F):
                if np.dot(basis[f], basis[f - 1]) < 0:
                    basis[f] *= -1
            for i in range(4):
                fc = act.fcurves.new('pose.bones["%s"].rotation_quaternion' % n, index=i, action_group=n)
                fc.keyframe_points.add(F)
                fc.keyframe_points.foreach_set('co', np.c_[frames, basis[:, i]].ravel().tolist())
                for kp in fc.keyframe_points:
                    kp.interpolation = 'LINEAR'
                fc.update()
        r = self.def_.root
        n = self.def_.names[r]
        Rr = np.broadcast_to(self.rest[r], (F, 4))
        loc = RT.qrot(RT.qconj(Rr), pose.root - self.def_.head[r])
        for i in range(3):
            fc = act.fcurves.new('pose.bones["%s"].location' % n, index=i, action_group=n)
            fc.keyframe_points.add(F)
            fc.keyframe_points.foreach_set('co', np.c_[frames, loc[:, i]].ravel().tolist())
            for kp in fc.keyframe_points:
                kp.interpolation = 'LINEAR'
            fc.update()
        return act


def witness(loc=(0, 0, 0), yaw=0.0, name=None):
    """1970s civilian man (~35): dark work jacket, plaid shirt, jeans, brown shoes."""
    return Human('IA_Witness', loc, yaw, name)


def pilot(loc=(0, 0, 0), yaw=0.0, name=None):
    """1970s airline captain (~48): navy uniform, white shirt, tie, 4 gold sleeve rings, black shoes."""
    return Human('IA_Pilot', loc, yaw, name)


def seat_pilot(h, frames, hips_world, grip_l=None, grip_r=None, floor_z=None, head_t0=0.0, head_speed=1.0,
               breathe=True, grip_curl=1.0):
    """Seated captain (see retarget.seated): world-space inputs converted to the rig's armature space."""
    arm = lambda p: None if p is None else h.to_arm(p)
    fz = None if floor_z is None else float(h.to_arm((0, 0, floor_z))[2])
    p = RT.seated(h.def_, clip, frames, arm(hips_world), arm(grip_l), arm(grip_r), fz, head_t0, head_speed,
                  breathe, grip_curl)
    return p


def qa_json(path, **poses):
    import json
    json.dump({k: RT.motion_qa(v) for k, v in poses.items()}, open(path, 'w'), indent=1)
