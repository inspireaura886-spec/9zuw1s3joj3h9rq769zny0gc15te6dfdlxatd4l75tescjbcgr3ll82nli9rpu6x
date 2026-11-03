"""Cinematic camera keys (ideas from claude-animated-shorts' CAMS system, MIT): every shot is a function of local time
t in [0,1] returning pos / look / lens / roll / focus; the kit bakes one key per frame (so Cycles motion blur sees the
real move) with CRUISE easing (moving at the cut, never stop-start), slow creep on holds.
USER RULE 2026-11-02: NO SHAKE. kick() and handheld() are kept for old scripts but do nothing (amplitude forced 0).
LAG FIX 2026-11-02: (1) default ease = cruise() (velocity never drops below ~55 % of its peak, so 2-3 s shots no
longer lurch start-stop-start); (2) bake() adds a sub-frame key at (cut - 0.5) for the camera AND makes every other
animated datablock hold a clean shutter at the last frame before a cut, so motion blur never smears that frame.

Usage:
    cam = Cam()                                     # 1080x1920 camera, DOF on
    cam.shot(0, 90, dolly((0,-30,2), (0,-18,3), look=(0,0,2)), lens=(35, 40), fstop=2.8, focus='Airliner')
    cam.shot(90, 180, orbit(center, r=20, a0=200, a1=240, h=(2,4)), lens=50)
    cam.bake()
"""
import bpy, math
from mathutils import Vector, Euler, Quaternion, noise


def smooth(t):  # smootherstep
    t = max(0.0, min(1.0, t))
    return t * t * t * (t * (t * 6 - 15) + 10)


def cruise(t, k=0.3):
    """Mostly linear with a soft S: velocity runs 0.7x..1.26x of the mean (smootherstep runs 0..1.9x = lurching)."""
    t = max(0.0, min(1.0, t))
    return (1 - k) * t + k * smooth(t)


def ease_out(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def ease_in(t):
    t = max(0.0, min(1.0, t))
    return t ** 3


def lerp(a, b, t):
    if isinstance(a, (tuple, list, Vector)):
        return Vector(a).lerp(Vector(b), t)
    return a + (b - a) * t


def _v(x):
    return Vector(x) if x is not None else None


# ---------- moves: each returns f(t) -> dict(pos, look) ----------
def dolly(p0, p1, look=None, look1=None, ease=None):
    """Straight move p0 -> p1. look (and optional look1) are world targets."""
    ease = ease or cruise
    def f(t):
        e = ease(t)
        lk = look if look1 is None else lerp(look, look1, e)
        return {'pos': lerp(p0, p1, e), 'look': _v(lk)}
    return f


def push_in(pos, look, amount=0.25, ease=None):
    """Moves `amount` of the way from pos toward look (classic slow push)."""
    ease = ease or cruise
    p0, lk = Vector(pos), Vector(look)
    return dolly(p0, p0.lerp(lk, amount), look=lk, ease=ease)


def orbit(center, r=10, a0=0, a1=30, h=2, r1=None, look_h=0.0, ease=None):
    """Orbit around center (degrees, CCW seen from above). h / r may be (start, end) tuples."""
    ease = ease or cruise
    c = Vector(center)
    def f(t):
        e = ease(t)
        a = math.radians(lerp(a0, a1, e))
        rr = lerp(r, r1, e) if r1 is not None else r
        hh = lerp(h[0], h[1], e) if isinstance(h, (tuple, list)) else h
        return {'pos': c + Vector((math.cos(a) * rr, math.sin(a) * rr, hh)), 'look': c + Vector((0, 0, look_h))}
    return f


def crane(pos, look, dz=4.0, dlook=0.0, ease=None):
    """Rise (dz > 0) or descend while looking at a target that may also rise."""
    ease = ease or cruise
    p, lk = Vector(pos), Vector(look)
    return dolly(p, p + Vector((0, 0, dz)), look=lk, look1=lk + Vector((0, 0, dlook)), ease=ease)


def track(obj_name, offset=(0, -10, 2), offset1=None, look_offset=(0, 0, 0), ease=None):
    """Follow an animated object (camera rig attached in world space; offset may move)."""
    ease = ease or cruise
    def f(t, frame=None):
        o = bpy.data.objects[obj_name]
        m = o.matrix_world
        e = ease(t)
        off = Vector(offset) if offset1 is None else lerp(offset, offset1, e)
        base = m.translation
        return {'pos': base + off, 'look': base + Vector(look_offset)}
    f.needs_frame = True
    return f


def follow(obj_name, p0, p1, look_offset=(0, 0, 0), ease=None):
    """Camera dollies p0 -> p1 in world space while panning to keep an animated object framed (spotter shot)."""
    ease = ease or cruise
    def f(t):
        o = bpy.data.objects[obj_name]
        return {'pos': lerp(p0, p1, ease(t)), 'look': o.matrix_world.translation + Vector(look_offset)}
    return f


def path(points, look, ease=None):
    """Catmull-Rom through points (crane/fly-through)."""
    ease = ease or cruise
    P = [Vector(p) for p in points]
    def cr(t):
        n = len(P) - 1
        x = t * n
        i = min(int(x), n - 1)
        u = x - i
        p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, n)]
        return 0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u ** 3)
    def f(t):
        e = ease(t)
        lk = look(e) if callable(look) else Vector(look)
        return {'pos': cr(e), 'look': lk}
    return f


class Cam:
    def __init__(self, name='IA_Cam', sensor=36.0, dof=True, clip_end=60000):
        cd = bpy.data.cameras.new(name)
        cd.sensor_fit = 'VERTICAL'
        cd.sensor_height = 36.0  # full-frame body turned portrait: 35 mm = 54 deg vertical FOV
        cd.clip_start = 0.05
        cd.clip_end = clip_end
        cd.dof.use_dof = dof
        cd.dof.aperture_blades = 7
        cd.dof.aperture_ratio = 1.15  # slight anamorphic oval bokeh
        self.obj = bpy.data.objects.new(name, cd)
        self.obj.rotation_mode = 'QUATERNION'
        bpy.context.scene.collection.objects.link(self.obj)
        bpy.context.scene.camera = self.obj
        self.shots, self.kicks, self.events = [], [], []
        self.drift = 0.0

    def shot(self, a, b, move, lens=35, roll=0.0, fstop=4.0, focus=None, creep=0.0, drift=None):
        """Frames a..b (inclusive start, exclusive end). lens/roll/fstop may be (start, end).
        focus: object name, Vector, float distance, or None (focus on the look target)."""
        self.shots.append(dict(a=a, b=b, move=move, lens=lens, roll=roll, fstop=fstop, focus=focus, creep=creep,
                               drift=drift))
        return self

    def kick(self, frame, amp=0.5, decay=7, rot=1.2):
        """DISABLED (user 2026-11-02: never shake the frame). Kept so old scene scripts still run."""
        return self

    def handheld(self, amount=0.02):
        """DISABLED (user 2026-11-02: no handheld jitter/drift). Kept so old scene scripts still run."""
        self.drift = 0.0
        return self

    def _sample(self, f):
        sh = None
        for s in self.shots:
            if s['a'] <= f < s['b']:
                sh = s
        if sh is None:
            sh = self.shots[-1] if f >= self.shots[-1]['a'] else self.shots[0]
        n = max(1, sh['b'] - sh['a'] - 1)
        t = max(0.0, min(1.0, (f - sh['a']) / n))
        r = sh['move'](t)
        pos, look = Vector(r['pos']), Vector(r['look'])
        def val(x):
            return lerp(x[0], x[1], cruise(t)) if isinstance(x, (tuple, list)) else x
        lens, roll, fstop = val(sh['lens']), val(sh['roll']), val(sh['fstop'])
        if sh['creep']:
            lens *= 1 + sh['creep'] * t
        d = 0.0  # no drift/jitter ever (user 2026-11-02)
        if d:
            q = f * 0.035
            pos += Vector((noise.noise(Vector((q, 0.3, 1.7))), noise.noise(Vector((1.1, q, 4.2))),
                           noise.noise(Vector((2.9, 5.1, q))))) * d
            look += Vector((noise.noise(Vector((q, 7.3, 0.7))), 0, noise.noise(Vector((3.3, q, 9.9))))) * d * 0.6
        kroll = 0.0
        for kf, amp, dec, rot in self.kicks:
            k = f - kf
            if 0 <= k < dec:
                s = (1 if k % 2 == 0 else -1) * (1 - k / dec) ** 2
                pos += Vector((s * amp * 0.12, 0, s * amp * 0.08))
                kroll += s * rot * amp
        fo = sh['focus']
        if fo is None:
            fd = (look - pos).length
        elif isinstance(fo, str):
            fd = (bpy.data.objects[fo].matrix_world.translation - pos).length
        elif isinstance(fo, (int, float)):
            fd = float(fo)
        else:
            fd = (Vector(fo) - pos).length
        return pos, look, lens, roll + kroll, fstop, fd

    def _key(self, f, pose):
        o, cd = self.obj, self.obj.data
        pos, look, lens, roll, fstop, fd = pose
        d = (look - pos).normalized()
        q = d.to_track_quat('-Z', 'Y')
        q = q @ Quaternion((0, 0, 1), math.radians(roll))
        o.location = pos
        o.rotation_quaternion = q
        cd.lens = lens
        cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = fd
        o.keyframe_insert('location', frame=f)
        o.keyframe_insert('rotation_quaternion', frame=f)
        cd.keyframe_insert('lens', frame=f)
        cd.dof.keyframe_insert('aperture_fstop', frame=f)
        cd.dof.keyframe_insert('focus_distance', frame=f)

    def bake(self, f0=None, f1=None):
        """One key per frame. At every hard cut c: the last frame of the outgoing shot (c-1) also gets a sub-frame key
        at c-0.5 sampled from the OUTGOING shot (objects evaluated at that sub-frame), held CONSTANT until c. With the
        shutter at frame START (c-1 .. c-0.5) the camera therefore keeps moving exactly with the scene through the
        shutter: no frozen-camera smear on tracked objects (the r1 test's 'laggy' cut frames) and no smear across the cut."""
        sc = bpy.context.scene
        f0 = self.shots[0]['a'] if f0 is None else f0
        f1 = max(s['b'] for s in self.shots) if f1 is None else f1
        o, cd = self.obj, self.obj.data
        cuts = sorted({s['a'] for s in self.shots[1:]})
        for f in range(f0, f1 + 1):
            sc.frame_set(f)  # lets track() read animated objects
            self._key(f, self._sample(f))
        sub = {}
        for c in cuts:
            if not (f0 < c <= f1):
                continue
            # pose at c-0.5 = linear extrapolation of the outgoing shot's last two frames (follows tracked objects too)
            sh = [s for s in self.shots if s['a'] <= c - 1 < s['b']][-1]
            saved = list(self.shots)
            self.shots = [sh]
            sc.frame_set(c - 2)
            pa = self._sample(c - 2)
            sc.frame_set(c - 1)
            pb = self._sample(c - 1)
            self.shots = saved
            pose = tuple((vb + (vb - va) * 0.5) for va, vb in zip(pa, pb))
            self._key(c - 0.5, pose)
            sub[c] = True
        for ad in (o.animation_data, cd.animation_data):
            if not ad or not ad.action:
                continue
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points:
                    x = kp.co.x
                    kp.interpolation = 'LINEAR'
                    if abs(x - round(x)) > 0.25 and int(round(x + 0.5)) in sub:  # the c-0.5 key: hold to the cut
                        kp.interpolation = 'CONSTANT'
                    elif int(round(x)) + 1 in cuts and (int(round(x)) + 1) not in sub:
                        kp.interpolation = 'CONSTANT'
        sc.frame_set(f0)
        sc.frame_start, sc.frame_end = f0, f1
        return self
