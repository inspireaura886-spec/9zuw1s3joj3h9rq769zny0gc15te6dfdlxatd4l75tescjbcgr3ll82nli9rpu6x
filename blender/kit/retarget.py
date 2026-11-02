"""Mocap -> MPFB cmu_mb rig retargeting in pure numpy (no bpy, so it is testable outside Blender).

Everything is done in 'delta space': D[b] = posed armature-space rotation of bone b times its rest rotation inverse.
Deltas are roll-free, so the maths only needs the target's rest heads/tails; kit/humans.py turns deltas into pose-bone
quaternions with the real rest matrices (basis = R_rest^-1 * L * R_rest, L = D[parent]^-1 * D[b]).

Pipeline:  Clip(bvh) -> smooth (gaussian on 120 fps quats) -> resample to 30 fps -> world deltas in Blender axes
           -> per-bone direction alignment (T-pose source vs A-pose target) -> root scaled by leg length
           -> layers: look_at, two-bone IK (feet lock / hands to targets), local overlays -> Pose (D, L, heads).
Source: CMU Graphics Lab mocap (BVH conversion by B. Hahne / cgspeed), bone names = MPFB 'cmu_mb' rig names.
"""
import numpy as np, math

# ---------------- quaternion helpers (w, x, y, z), arrays broadcast on leading axes ----------------
I4 = np.array([1.0, 0, 0, 0])


def qmul(a, b):
    aw, ax, ay, az = np.moveaxis(a, -1, 0)
    bw, bx, by, bz = np.moveaxis(b, -1, 0)
    return np.stack([aw * bw - ax * bx - ay * by - az * bz, aw * bx + ax * bw + ay * bz - az * by,
                     aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw], -1)


def qconj(q):
    return q * np.array([1.0, -1, -1, -1])


def qnorm(q):
    return q / np.linalg.norm(q, axis=-1, keepdims=True)


def qrot(q, v):
    qv = np.concatenate([np.zeros(v.shape[:-1] + (1,)), v], -1)
    return qmul(qmul(q, qv), qconj(q))[..., 1:]


def qaxis(axis, ang):
    axis = np.asarray(axis, float)
    axis = axis / (np.linalg.norm(axis) + 1e-12)
    return np.concatenate([[math.cos(ang / 2)], axis * math.sin(ang / 2)])


def qbetween(u, v):
    """Shortest rotation taking direction u to v."""
    u = np.asarray(u, float) / (np.linalg.norm(u) + 1e-12)
    v = np.asarray(v, float) / (np.linalg.norm(v) + 1e-12)
    d = float(np.dot(u, v))
    if d < -0.999999:
        ax = np.cross(u, [1, 0, 0])
        if np.linalg.norm(ax) < 1e-6:
            ax = np.cross(u, [0, 1, 0])
        return qaxis(ax, math.pi)
    c = np.cross(u, v)
    return qnorm(np.concatenate([[1 + d], c]))


def qslerp(a, b, t):
    a, b = np.asarray(a, float), np.asarray(b, float)
    d = float(np.dot(a, b))
    if d < 0:
        b, d = -b, -d
    if d > 0.9995:
        return qnorm(a + (b - a) * t)
    th = math.acos(min(1.0, d))
    return (math.sin((1 - t) * th) * a + math.sin(t * th) * b) / math.sin(th)


def qangle(q):
    return 2 * math.acos(min(1.0, abs(float(q[0]))))


def from_euler_bvh(order, ang_deg):
    """BVH channel order e.g. 'ZYX' -> q = Rz * Ry * Rx (intrinsic, as listed). ang_deg [F,3]."""
    q = np.tile(I4, (ang_deg.shape[0], 1))
    axes = {'X': [1, 0, 0], 'Y': [0, 1, 0], 'Z': [0, 0, 1]}
    for k, ch in enumerate(order):
        a = np.radians(ang_deg[:, k]) / 2
        e = np.zeros((len(a), 4))
        e[:, 0] = np.cos(a)
        e[:, 1:] = np.outer(np.sin(a), axes[ch])
        q = qmul(q, e)
    return q


# Y-up (BVH) -> Z-up (Blender): +90 deg about X. CMU subjects face +Z -> Blender -Y (same as MPFB humans).
QC = qaxis([1, 0, 0], math.pi / 2)


def to_bl_vec(v):
    return qrot(np.broadcast_to(QC, v.shape[:-1] + (4,)), v)


def to_bl_quat(q):
    c = np.broadcast_to(QC, q.shape)
    return qmul(qmul(c, q), qconj(c))


# ---------------- BVH ----------------
class Clip:
    def __init__(self, path):
        txt = open(path).read()
        hier, mot = txt.split('MOTION')
        toks = hier.split()
        J, stack, cur, i = [], [], None, 0
        while i < len(toks):
            t = toks[i]
            if t in ('ROOT', 'JOINT'):
                J.append({'name': toks[i + 1], 'parent': stack[-1] if stack else -1, 'chan': [], 'off': None, 'end': False})
                cur = len(J) - 1
                i += 2
            elif t == 'End':
                J.append({'name': J[stack[-1]]['name'] + '_end', 'parent': stack[-1], 'chan': [], 'off': None, 'end': True})
                cur = len(J) - 1
                i += 2
            elif t == '{':
                stack.append(cur)
                i += 1
            elif t == '}':
                stack.pop()
                i += 1
            elif t == 'OFFSET':
                J[cur]['off'] = np.array([float(x) for x in toks[i + 1:i + 4]])
                i += 4
            elif t == 'CHANNELS':
                n = int(toks[i + 1])
                J[cur]['chan'] = toks[i + 2:i + 2 + n]
                i += 2 + n
            else:
                i += 1
        L = mot.strip().split('\n')
        self.ft = float(L[1].split()[2])
        self.fps = 1.0 / self.ft
        data = np.array([[float(x) for x in l.split()] for l in L[2:] if l.strip()])
        self.J = J
        self.names = [j['name'] for j in J]
        F = len(data)
        self.Q = np.tile(I4, (F, len(J), 1))
        self.root = np.zeros((F, 3))
        c = 0
        for k, j in enumerate(J):
            idx = {ch: c + n for n, ch in enumerate(j['chan'])}
            if 'Xposition' in idx:
                self.root = data[:, [idx['Xposition'], idx['Yposition'], idx['Zposition']]]
            rc = [ch for ch in j['chan'] if ch.endswith('rotation')]
            if rc:
                self.Q[:, k] = from_euler_bvh(''.join(ch[0] for ch in rc), data[:, [idx[ch] for ch in rc]])
            c += len(j['chan'])
        self.F = F

    @property
    def duration(self):
        return self.F / self.fps

    def child_offsets(self, name):
        k = self.names.index(name)
        offs = [j['off'] for j in self.J if j['parent'] == k]
        return np.sum(offs, axis=0) if offs else np.zeros(3)

    def leg_length(self):
        return (np.linalg.norm(self.J[self.names.index('LeftLeg')]['off']) +
                np.linalg.norm(self.J[self.names.index('LeftFoot')]['off']))

    def sample(self, t0=0.0, t1=None, fps=30, speed=1.0, sigma_s=0.03):
        """Gaussian-smoothed (sigma_s seconds) local quats + root, resampled to `fps` from t0 to t1 (clip seconds)."""
        t1 = self.duration if t1 is None else t1
        Q = self.Q.copy()
        for f in range(1, self.F):  # hemisphere continuity
            s = np.sum(Q[f] * Q[f - 1], -1) < 0
            Q[f, s] *= -1
        R = self.root.copy()
        sg = sigma_s * self.fps
        if sg > 0.3:
            r = int(3 * sg) + 1
            k = np.exp(-0.5 * (np.arange(-r, r + 1) / sg) ** 2)
            k /= k.sum()
            pad = lambda a: np.concatenate([np.repeat(a[:1], r, 0), a, np.repeat(a[-1:], r, 0)], 0)
            Qp, Rp = pad(Q), pad(R)
            Q = np.stack([np.tensordot(k, Qp[i:i + 2 * r + 1], axes=(0, 0)) for i in range(self.F)])
            R = np.stack([np.tensordot(k, Rp[i:i + 2 * r + 1], axes=(0, 0)) for i in range(self.F)])
            Q = qnorm(Q)
        n = int(round((t1 - t0) * fps / speed))
        ts = t0 + np.arange(n) * speed / fps
        x = np.clip(ts * self.fps, 0, self.F - 1.001)
        i0 = np.floor(x).astype(int)
        u = (x - i0)[:, None]
        Qs = qnorm(Q[i0] * (1 - u[..., None]) + Q[i0 + 1] * u[..., None])
        Rs = R[i0] * (1 - u) + R[i0 + 1] * u
        return Qs, Rs

    def world(self, Qs, Rs):
        """World (BVH space) quats and joint positions per sampled frame."""
        F = len(Qs)
        W = np.zeros((F, len(self.J), 4))
        P = np.zeros((F, len(self.J), 3))
        for k, j in enumerate(self.J):
            p = j['parent']
            if p < 0:
                W[:, k] = Qs[:, k]
                P[:, k] = Rs
            else:
                W[:, k] = qmul(W[:, p], Qs[:, k])
                P[:, k] = P[:, p] + qrot(W[:, p], np.broadcast_to(j['off'], (F, 3)))
        return W, P


# ---------------- target rig + pose ----------------
MAP = {'LeftHandFinger1': 'LeftHandIndex1', 'RightHandFinger1': 'RightHandIndex1'}


class Rig:
    """Target rest skeleton: bones in hierarchy order, heads/tails in armature space (Z up, facing -Y)."""

    def __init__(self, bones):
        # bones: list of (name, parent_name or '', head(3), tail(3)) in any order -> sorted parents first
        by = {b[0]: b for b in bones}
        order, seen = [], set()
        def visit(n):
            if n in seen:
                return
            p = by[n][1]
            if p:
                visit(p)
            seen.add(n)
            order.append(n)
        for b in bones:
            visit(b[0])
        self.names = order
        self.idx = {n: i for i, n in enumerate(order)}
        self.parent = [self.idx[by[n][1]] if by[n][1] else -1 for n in order]
        self.head = np.array([by[n][2] for n in order], float)
        self.tail = np.array([by[n][3] for n in order], float)
        self.children = [[c for c in range(len(order)) if self.parent[c] == i] for i in range(len(order))]
        self.root = self.parent.index(-1)

    def ankle_z(self):
        return min(self.head[self.idx['LeftFoot'], 2], self.head[self.idx['RightFoot'], 2])

    def leg_length(self):
        i = self.idx
        return (np.linalg.norm(self.head[i['LeftLeg']] - self.head[i['LeftUpLeg']]) +
                np.linalg.norm(self.head[i['LeftFoot']] - self.head[i['LeftLeg']]))


class Pose:
    """Per-frame deltas for a Rig. D[F,B,4] world deltas, L[F,B,4] local deltas, root[F,3] root head position."""

    def __init__(self, rig, F):
        self.rig = rig
        self.F = F
        B = len(rig.names)
        self.L = np.tile(I4, (F, B, 1))
        self.root = np.tile(rig.head[rig.root], (F, 1))
        self.D = None
        self.H = None
        self.contacts = {}
        self.fk()

    def copy(self):
        p = Pose.__new__(Pose)
        p.rig, p.F, p.L, p.root = self.rig, self.F, self.L.copy(), self.root.copy()
        p.contacts = dict(self.contacts)
        p.fk()
        return p

    def fk(self, frames=None):
        r = self.rig
        if self.D is None:
            self.D = np.zeros_like(self.L)
            self.H = np.zeros((self.F, len(r.names), 3))
        fr = slice(None) if frames is None else frames
        for b in range(len(r.names)):
            p = r.parent[b]
            if p < 0:
                self.D[fr, b] = self.L[fr, b]
                self.H[fr, b] = self.root[fr]
            else:
                self.D[fr, b] = qmul(self.D[fr, p], self.L[fr, b])
                off = r.head[b] - r.head[p]
                Dp = self.D[fr, p]
                self.H[fr, b] = self.H[fr, p] + qrot(Dp, np.broadcast_to(off, Dp.shape[:-1] + (3,)))
        return self

    def tail(self, f, b):
        r = self.rig
        return self.H[f, b] + qrot(self.D[f, b], r.tail[b] - r.head[b])

    def set_world(self, f, b, Dnew, keep_children=()):
        """Set bone b's world delta at frame f; children in keep_children keep their world delta."""
        r = self.rig
        keep = {c: self.D[f, c].copy() for c in keep_children}
        p = r.parent[b]
        self.L[f, b] = qnorm(Dnew) if p < 0 else qnorm(qmul(qconj(self.D[f, p]), Dnew))
        self.fk(slice(f, f + 1))
        for c, Dc in keep.items():
            self.L[f, c] = qnorm(qmul(qconj(self.D[f, r.parent[c]]), Dc))
        if keep:
            self.fk(slice(f, f + 1))

    def bone(self, name):
        return self.rig.idx[name]


def retarget(clip, rig, t0=0.0, t1=None, fps=30, speed=1.0, sigma_s=0.03, align_yaw=True, hold=None):
    """Clip -> Pose on rig. hold=seconds: take one (smoothed) instant and hold it for the whole span."""
    Qs, Rs = clip.sample(t0, t1, fps, speed, sigma_s)
    if hold is not None:
        Qh, Rh = clip.sample(hold, hold + 1.0 / fps, fps, 1.0, sigma_s)
        Qs = np.repeat(Qh[:1], len(Qs), 0)
        Rs = np.repeat(Rh[:1], len(Rs), 0)
    W, P = clip.world(Qs, Rs)
    W = to_bl_quat(W)
    P = to_bl_vec(P)
    F = len(W)
    pose = Pose(rig, F)
    # alignment per bone (source rest direction vs target rest direction)
    A = {}
    for b, n in enumerate(rig.names):
        s = MAP.get(n, n)
        if s not in clip.names:
            continue
        if b == rig.root:
            A[b] = I4.copy()
            continue
        ds = to_bl_vec(clip.child_offsets(s)[None])[0]
        dt = rig.tail[b] - rig.head[b]
        A[b] = qbetween(dt, ds) if np.linalg.norm(ds) > 1e-6 else I4.copy()
    hi = clip.names.index('Hips')
    yaw = 0.0
    if align_yaw:  # facing from the hip joints (robust when the pelvis is pitched, e.g. seated)
        lr = P[0, clip.names.index('LeftUpLeg')] - P[0, clip.names.index('RightUpLeg')]
        lr = lr + (P[0, clip.names.index('LeftArm')] - P[0, clip.names.index('RightArm')])
        fwd = np.cross(lr, [0, 0, 1.0])
        yaw = -math.atan2(fwd[0], -fwd[1])  # fwd = Rz(th) * (0,-1,0) -> rotate by -th
    QY = qaxis([0, 0, 1], yaw)
    D = np.zeros((F, len(rig.names), 4))
    for b, n in enumerate(rig.names):
        s = MAP.get(n, n)
        if b in A:
            D[:, b] = qmul(qmul(np.broadcast_to(QY, (F, 4)), W[:, clip.names.index(s)]), np.broadcast_to(A[b], (F, 4)))
        else:
            D[:, b] = D[:, rig.parent[b]] if rig.parent[b] >= 0 else QY
    for b in range(len(rig.names)):
        p = rig.parent[b]
        pose.L[:, b] = D[:, b] if p < 0 else qmul(qconj(D[:, p]), D[:, b])
    # root: leg-length scale, start at the rig's rest xy, then feet to the ground
    k = rig.leg_length() / clip.leg_length()
    hp = qrot(np.broadcast_to(QY, (F, 4)), P[:, hi] * k)
    hp[:, :2] -= hp[0, :2]
    hp[:, :2] += rig.head[rig.root, :2]
    pose.root = hp
    pose.fk()
    fl, fr_ = pose.bone('LeftFoot'), pose.bone('RightFoot')
    low = min(pose.H[:, fl, 2].min(), pose.H[:, fr_, 2].min())
    pose.root[:, 2] += rig.ankle_z() - low
    pose.scale = k
    pose.fk()
    return pose


# ---------------- layers ----------------
def two_bone_ik(pose, f, upper, lower, end, target, pole=None, soft=0.985):
    """Move chain so that the head of `end` reaches target, keeping the bend plane (or bending toward pole);
    the end bone keeps its world orientation."""
    r = pose.rig
    a, b, c = pose.bone(upper), pose.bone(lower), pose.bone(end)
    h, k, e = pose.H[f, a].copy(), pose.H[f, b].copy(), pose.H[f, c].copy()
    l1, l2 = np.linalg.norm(k - h), np.linalg.norm(e - k)
    t = np.asarray(target, float)
    d = np.linalg.norm(t - h)
    Lm = (l1 + l2) * 0.999
    Ls = (l1 + l2) * soft
    if d > Ls:  # soft reach: approach full extension asymptotically (no knee snap at straight legs)
        d = Ls + (Lm - Ls) * (1 - math.exp(-(d - Ls) / (Lm - Ls)))
    d = max(d, abs(l1 - l2) + 1e-4)
    u = (t - h) / (np.linalg.norm(t - h) + 1e-9)
    bend = (k - h) if pole is None else (np.asarray(pole) - h)
    v = bend - u * np.dot(bend, u)
    if np.linalg.norm(v) < 1e-6:
        v = np.cross(u, [1, 0, 0])
    v /= np.linalg.norm(v)
    ca = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)
    al = math.acos(max(-1, min(1, ca)))
    k2 = h + l1 * (math.cos(al) * u + math.sin(al) * v)
    e2 = h + u * d
    Dend = pose.D[f, c].copy()
    q1 = qbetween(k - h, k2 - h)
    pose.set_world(f, a, qmul(q1, pose.D[f, a]))
    k1, e1 = pose.H[f, b], pose.H[f, c]
    q2 = qbetween(e1 - k1, e2 - k1)
    pose.set_world(f, b, qmul(q2, pose.D[f, b]))
    pose.set_world(f, c, Dend)


def foot_lock(pose, height=0.05, speed=0.15, min_len=6, blend=4, fps=30, reach=0.975):
    """Detect ground contacts per foot (ankle low + slow) and pin the ankle there with two-bone IK (no foot slide).
    The pelvis drops a little (smoothed) wherever a pinned foot would need a straighter leg than `reach`, so knees
    never snap at full extension."""
    r = pose.rig
    out, T, Wt = {}, {}, {}
    for side in ('Left', 'Right'):
        fb = pose.bone(side + 'Foot')
        A = pose.H[:, fb].copy()
        z0 = A[:, 2].min()
        v = np.r_[0, np.linalg.norm(np.diff(A[:, :2], axis=0), axis=1) * fps]
        v = np.convolve(v, np.ones(3) / 3, 'same')
        c = (A[:, 2] < z0 + height) & (v < speed)
        segs, f = [], 0
        while f < pose.F:
            if c[f]:
                g = f
                while g + 1 < pose.F and c[g + 1]:
                    g += 1
                if g - f + 1 >= min_len or f == 0 or g == pose.F - 1:
                    segs.append((f, g))
                f = g + 1
            else:
                f += 1
        merged = []
        for sg_ in segs:  # bridge short gaps (contact flicker -> knee pops)
            if merged and sg_[0] - merged[-1][1] <= 4:
                merged[-1] = (merged[-1][0], sg_[1])
            else:
                merged.append(sg_)
        segs = [x for x in merged if x[1] - x[0] + 1 >= min_len or x[0] == 0 or x[1] == pose.F - 1]
        tgt = A.copy()
        w = np.zeros(pose.F)
        for (s, e) in segs:
            lock = A[s:e + 1].mean(0)
            for f in range(s, e + 1):
                ww = 1.0
                if s > 0:
                    ww = min(ww, (f - s + 1) / (blend + 1))
                if e < pose.F - 1:
                    ww = min(ww, (e - f + 1) / (blend + 1))
                ww = ww * ww * (3 - 2 * ww)
                if ww > w[f]:
                    w[f] = ww
                    tgt[f, :2] = A[f, :2] * (1 - ww) + lock[:2] * ww  # pin xy; height follows the mocap (heel roll)
        out[side], T[side], Wt[side] = segs, tgt, w
    # pelvis drop so pinned feet stay within comfortable reach
    drop = np.zeros(pose.F)
    for side in ('Left', 'Right'):
        a, b, c_ = pose.bone(side + 'UpLeg'), pose.bone(side + 'Leg'), pose.bone(side + 'Foot')
        Lmax = np.linalg.norm(r.head[b] - r.head[a]) + np.linalg.norm(r.head[c_] - r.head[b])
        for f in range(pose.F):
            if Wt[side][f] <= 0:
                continue
            h = pose.H[f, a]
            dxy = np.linalg.norm(T[side][f][:2] - h[:2])
            zr = (reach * Lmax) ** 2 - dxy * dxy
            need = (h[2] - T[side][f][2]) - (math.sqrt(zr) if zr > 0 else 0.0)
            drop[f] = max(drop[f], need)
    if drop.max() > 0:
        sg = 2.5
        rr = int(3 * sg) + 1
        k = np.exp(-0.5 * (np.arange(-rr, rr + 1) / sg) ** 2)
        dp = np.concatenate([np.repeat(drop[:1], rr), drop, np.repeat(drop[-1:], rr)])
        mx = np.array([dp[i:i + 2 * rr + 1].max() for i in range(pose.F)])  # dilate then blur: never under-drop
        mp = np.concatenate([np.repeat(mx[:1], rr), mx, np.repeat(mx[-1:], rr)])
        drop = np.array([np.dot(k / k.sum(), mp[i:i + 2 * rr + 1]) for i in range(pose.F)])
        pose.root[:, 2] -= drop
        pose.fk()
    for side in ('Left', 'Right'):
        for f in range(pose.F):
            if Wt[side][f] > 0 or drop[f] > 1e-4:  # swing frames too: keep the mocap foot path after the pelvis drop
                two_bone_ik(pose, f, side + 'UpLeg', side + 'Leg', side + 'Foot', T[side][f])
    pose.contacts = out
    pose.lock_w = Wt
    pose.pelvis_drop_mm = round(1000 * float(drop.max()), 1)
    return out


def look_at(pose, target, weight, chain=(('Neck', 0.3), ('Neck1', 0.4), ('Head', 1.0)), max_deg=75.0,
            fwd=(0, -1.0, 0)):
    """Aim the face (rest forward -Y) at target (armature space; callable f->point or fixed). weight: f->0..1."""
    hb = pose.bone('Head')
    for f in range(pose.F):
        w = weight(f) if callable(weight) else weight
        if w <= 0:
            continue
        tp = np.asarray(target(f) if callable(target) else target, float)
        for name, share in chain:
            cur = qrot(pose.D[f, hb], np.asarray(fwd))
            des = tp - pose.H[f, hb]
            q = qbetween(cur, des)
            ang = qangle(q)
            lim = math.radians(max_deg)
            frac = w * share * (min(1.0, lim / ang) if ang > lim else 1.0)
            qp = qslerp(I4, q, frac)
            b = pose.bone(name)
            pose.set_world(f, b, qmul(qp, pose.D[f, b]))


def overlay_local(pose, other, bones, mode='replace', weight=1.0, ref_frame=0):
    """Copy local deltas of `bones` from another Pose (same rig, frames clamped). mode 'replace' or 'add'
    (add = other's change since ref_frame, applied on top)."""
    for name in bones:
        b = pose.bone(name)
        for f in range(pose.F):
            g = min(f, other.F - 1)
            if mode == 'replace':
                q = other.L[g, b]
                pose.L[f, b] = qnorm(qslerp(pose.L[f, b], q, weight)) if weight < 1 else q
            else:
                dq = qmul(qconj(other.L[ref_frame, b]), other.L[g, b])
                pose.L[f, b] = qnorm(qmul(pose.L[f, b], qslerp(I4, dq, weight)))
    pose.fk()


def smooth_pose(pose, sigma=1.0):
    """Light gaussian on local deltas + root (removes residual IK jitter)."""
    if sigma <= 0:
        return
    r = int(3 * sigma) + 1
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    L = pose.L.copy()
    for f in range(1, pose.F):
        s = np.sum(L[f] * L[f - 1], -1) < 0
        L[f, s] *= -1
    pad = lambda a: np.concatenate([np.repeat(a[:1], r, 0), a, np.repeat(a[-1:], r, 0)], 0)
    Lp, Rp = pad(L), pad(pose.root)
    pose.L = qnorm(np.stack([np.tensordot(k, Lp[i:i + 2 * r + 1], axes=(0, 0)) for i in range(pose.F)]))
    pose.root = np.stack([np.tensordot(k, Rp[i:i + 2 * r + 1], axes=(0, 0)) for i in range(pose.F)])
    pose.fk()


def motion_qa(pose, fps=30):
    """Numbers for the report: foot slide inside contacts (mm), max joint jerk spikes, frame-to-frame pops."""
    res = {}
    for side, segs in (pose.contacts or {}).items():
        fb = pose.bone(side + 'Foot')
        w = getattr(pose, 'lock_w', {}).get(side)
        sl = []
        for s, e in segs:
            fr = [f for f in range(s, e + 1) if w is None or w[f] > 0.999]
            if len(fr) >= 2:
                P = pose.H[fr, fb, :2]  # horizontal slide of the pinned ankle
                sl.append(float(np.linalg.norm(P - P.mean(0), axis=1).max()))
        sl = sl or [0.0]
        res[side + '_slide_mm_max'] = round(1000 * max(sl), 1)
        res[side + '_contacts'] = [list(map(int, s)) for s in segs]
    H = pose.H
    v = np.linalg.norm(np.diff(H, axis=0), axis=2)  # [F-1,B] m/frame
    acc = np.linalg.norm(np.diff(H, 2, axis=0), axis=2)  # [F-2,B]
    med = np.median(acc) + 1e-5
    res['max_speed_m_s'] = round(float(v.max() * fps), 2)
    res['max_accel_over_median'] = round(float(acc.max() / med), 1)
    res['jerk_spikes'] = int(np.sum(acc > np.maximum(20 * med, 0.004)))
    return res


def seated(rig, clip_fn, frames, hips, grip_l=None, grip_r=None, floor_z=None, head_t0=0.0, head_speed=1.0,
           breathe=True, grip_curl=1.0, grip_back=0.085, lean=8.0):
    """Seated pilot in armature space. Legs/hips/spine held from CMU 143_18 (seat_base), neck+head from CMU 137_28
    (head_turn: looks down, lifts and turns), idle breathing (CMU 111_28) added on the spine, hands pinned by IK to
    the yoke grips (palm centres), ankles on the floor. clip_fn(name) -> Clip."""
    def mc(name, t0=0.0, speed=1.0, hold=None):
        c = clip_fn(name)
        p = retarget(c, rig, t0=t0, t1=t0 + frames * speed / 30.0, speed=speed, hold=hold)
        idx = np.clip(np.arange(frames), 0, p.F - 1)
        p.L, p.root, p.F, p.D = p.L[idx], p.root[idx], frames, None
        return p.fk()
    p = mc('seat_base', hold=0.3)
    p.root[:] += np.asarray(hips, float) - p.root[0]
    p.fk()
    overlay_local(p, mc('head_turn', head_t0, head_speed), ['Neck', 'Neck1', 'Head'], mode='replace')
    # upright pilot's back: spine from the standing idle (breathing included), then the whole torso leaned
    # `lean` degrees forward from vertical (the stool clip slouches)
    overlay_local(p, mc('idle_stand', 1.0), ['LowerBack', 'Spine', 'Spine1'] if breathe else [], mode='replace')
    lb, nk = p.bone('LowerBack'), p.bone('Neck')
    v = p.H[0, nk] - p.H[0, lb]
    want = np.array([0, -math.sin(math.radians(lean)), math.cos(math.radians(lean))])
    qc = qbetween(v, want)
    for f in range(p.F):
        p.set_world(f, lb, qmul(qc, p.D[f, lb]))
    if floor_z is not None:
        fz = floor_z + rig.ankle_z()
        for f in range(p.F):
            for s in ('Left', 'Right'):
                a = p.H[f, p.bone(s + 'Foot')].copy()
                a[2] = fz
                two_bone_ik(p, f, s + 'UpLeg', s + 'Leg', s + 'Foot', a)
    for s, g in (('Left', grip_l), ('Right', grip_r)):
        if g is None:
            continue
        g = np.asarray(g, float)
        side = 1.0 if s == 'Left' else -1.0
        hb = p.bone(s + 'Hand')
        for f in range(p.F):
            sh = p.H[f, p.bone(s + 'Arm')]
            d = g - sh
            d /= np.linalg.norm(d)
            wrist = g - d * grip_back
            pole = sh + np.array([0.3 * side, 0.05, -0.45])  # elbows down and a little out
            two_bone_ik(p, f, s + 'Arm', s + 'ForeArm', s + 'Hand', wrist, pole=pole, soft=0.99)
            cur = qrot(p.D[f, hb], rig.tail[hb] - rig.head[hb])
            p.set_world(f, hb, qmul(qbetween(cur, g - p.H[f, hb]), p.D[f, hb]))
            if grip_curl:
                down = np.array([0, 0, -1.0])
                for fn, ang in ((s + 'FingerBase', 0.25), (s + 'HandFinger1', 1.2), (s[0] + 'Thumb', 0.45)):
                    if fn not in rig.idx:
                        continue
                    fb = p.bone(fn)
                    fd = qrot(p.D[f, fb], rig.tail[fb] - rig.head[fb])
                    ax = np.cross(fd, down)
                    if np.linalg.norm(ax) > 1e-6:
                        p.set_world(f, fb, qmul(qaxis(ax, ang * grip_curl), p.D[f, fb]))
    smooth_pose(p, 1.0)
    return p
