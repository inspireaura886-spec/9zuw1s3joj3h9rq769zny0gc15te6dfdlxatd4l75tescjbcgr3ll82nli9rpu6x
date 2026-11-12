"""osc.py <video> <tag>: full-res centre crop (512x768) phase correlation each frame; shake = oscillation runs:
>=3 consecutive frame steps whose dx or dy alternates sign with |d|>=3 px (camera wobble at 2-4 frame period)."""
import sys,subprocess,numpy as np,json
f,tag=sys.argv[1],sys.argv[2]; w,h=512,768; x0,y0=284,500
p=subprocess.Popen(['ffmpeg','-v','error','-i',f,'-vf',f'crop={w}:{h}:{x0}:{y0},scale=256:384,format=gray','-f','rawvideo','-'],stdout=subprocess.PIPE)
W,H=256,384; win=np.outer(np.hanning(H),np.hanning(W)); prev=None; out=[]; k=0
def sub(r,i,n):
    l,c,rr=r[(i-1)%n],r[i],r[(i+1)%n];d=l-2*c+rr;return 0 if d==0 else .5*(l-rr)/d
while True:
    b=p.stdout.read(W*H)
    if len(b)<W*H: break
    A=np.frombuffer(b,np.uint8).reshape(H,W).astype(np.float32)
    if prev is not None:
        X=np.fft.fft2((A-A.mean())*win);Y=np.fft.fft2((prev-prev.mean())*win);R=X*np.conj(Y);R/=np.abs(R)+1e-6;r=np.fft.ifft2(R).real
        iy,ix=np.unravel_index(r.argmax(),r.shape);fy=iy+sub(r[:,ix],iy,H);fx=ix+sub(r[iy,:],ix,W)
        if fy>H/2:fy-=H
        if fx>W/2:fx-=W
        out.append((k,fx*2,fy*2,r.max(),float(np.abs(A-prev).mean())))
    prev=A;k+=1
d=np.array(out); np.save(f'{tag}.osc.npy',d)
def runs(v,thr=3):
    s=np.sign(v)*(np.abs(v)>=thr); alt=(s[1:]*s[:-1])<0; res=[]; i=0
    while i<len(alt):
        if alt[i]:
            j=i
            while j<len(alt) and alt[j]: j+=1
            if j-i>=2: res.append((int(d[i,0]),j-i+1))
            i=j
        else: i+=1
    return res
rx,ry=runs(d[:,1]),runs(d[:,2])
fr=sorted(set([a for a,_ in rx+ry]))
print(json.dumps({'tag':tag,'frames':k,'osc_runs_x':len(rx),'osc_runs_y':len(ry),'osc_frames':int(sum(n for _,n in rx+ry)),'run_starts_s':[round(a/30,1) for a in fr][:40]}))
