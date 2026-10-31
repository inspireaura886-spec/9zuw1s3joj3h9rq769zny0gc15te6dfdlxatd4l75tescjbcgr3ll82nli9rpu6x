// PAPERCUT look demo (8 s, 240 f): (A) night-sea collage with a lighthouse beam sweeping through paper layers, (B) case board:
// archival photo, clippings slapping in at 12 fps, pins, red string drawing itself, a swinging desk lamp moving every shadow.
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from 'remotion';
import {ShotCam} from '../../lowpoly/kit/Camera.jsx';
import {Particles} from '../../lowpoly/kit/Particles.jsx';
import {LightCone} from '../../lowpoly/kit/Light.jsx';
import {NoirFonts} from '../../noir/NoirKit.jsx';
import {PAPER, usePaperFonts, usePaperImages, CutLayer, PhotoCut, Clipping, Note, Pin, RedString, Board, PaperStage, PaperFinish, PaperTitle, PaperGlow} from '../PaperKit.jsx';

const stars = function stars(g, w, h, r) { for (let i = 0; i < 140; i++) { const x = r() * w, y = r() * h * 0.8, s = 2 + r() * (r() < 0.1 ? 9 : 4);
  g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.3, y - s * 0.3); g.lineTo(x + s, y); g.lineTo(x + s * 0.3, y + s * 0.3); g.lineTo(x, y + s); g.lineTo(x - s * 0.3, y + s * 0.3); g.lineTo(x - s, y); g.lineTo(x - s * 0.3, y - s * 0.3); g.fill(); } };

const Sea = () => {
  const f = useCurrentFrame();
  const a = 2.7 - f * 0.032; // lighthouse beam angle
  return (
    <PaperStage keyPos={(fr) => [interpolate(fr, [0, 125], [-9, -3]), 10, 10]} keyTarget={[0, 2, -8]} keyI={2.4} ambient={0.6} overlay={<>
      <PaperTitle y={240} lines={[{text: '3 KEEPERS VANISHED.', at: 2, size: 78}, {text: 'One left his coat.', at: 16, red: true, size: 84}]} />
      <PaperFinish seed={1} />
    </>}>
      <ShotCam preset="push" from={[3.6, 3.4, 15.5]} to={[-0.9, 2.6, 9.6]} look={[[0, 2.9, -8], [-1.1, 3.3, -8]]} fov0={40} fov1={35} start={0} end={125} ease="inout" drift={0.03} />
      <CutLayer shape={stars} size={[34, 20]} px={[1400, 820]} position={[0, 9, -18]} color="#f3e6b0" edge={0} emissive={0.9} castShadow={false} receiveShadow={false} seed={8} frame={f} />
      <PaperGlow position={[2.6, 8.4, -16.2]} size={7} opacity={0.5} />
      <CutLayer shape="moon" size={[3.4, 3.4]} px={[512, 512]} position={[2.6, 8.4, -16]} color={PAPER.moon} emissive={0.55} seed={3} frame={f} bob={0.05} />
      {[[-6, 7.2, -13, 6], [4, 6.0, -12.5, 5], [11, 7.6, -13.5, 7]].map(([x, y, z, w], i) =>
        <CutLayer key={i} shape="cloud" size={[w, w * 0.4]} px={[700, 280]} position={[x, y, z]} color="#3c4c78" seed={20 + i} frame={f} drift={[0.35, 0]} wrapX={[-14, 16]} bob={0.04} />)}
      <CutLayer shape="ridge" opts={{base: 0.5, amp: 0.4, freq: 2.5}} size={[44, 9]} px={[1800, 370]} position={[0, 1.2, -12]} color={PAPER.ridge} seed={5} frame={f} />
      <CutLayer shape="ridge" opts={{base: 0.55, amp: 0.3, freq: 4}} size={[40, 7]} px={[1600, 280]} position={[3, 0.2, -10]} color="#24345a" seed={6} frame={f} />
      <CutLayer shape="lighthouse" size={[8, 8]} px={[800, 800]} position={[-1.5, 2.6, -8]} color="#18213a" seed={7} frame={f} />
      <PaperGlow position={[-1.5, 4.92, -7.85]} size={2.2} color={PAPER.amber} opacity={0.95} />
      <LightCone position={[-1.5, 4.92, -7.9]} dir={[Math.cos(a), -0.06, Math.sin(a)]} length={24} radius={3.2} color="#ffe2a0" opacity={0.55} frame={f} />
      <CutLayer shape="waves" opts={{waves: 7, amp: 0.2}} size={[34, 4]} px={[1600, 190]} position={[0, -0.1, -6]} color={PAPER.sea} seed={11} frame={f} bob={0.1} speed={0.9} />
      <CutLayer shape="boat" size={[1.7, 1.5]} px={[300, 260]} position={[1.7, 1.15, -4.6]} color="#6b3f24" seed={12} frame={f} bob={0.13} sway={0.12} speed={0.9} />
      <CutLayer shape="waves" opts={{waves: 6, amp: 0.22, phase: 1.3}} size={[34, 4]} px={[1600, 190]} position={[0, -0.6, -4]} color={PAPER.sea2} seed={13} frame={f} bob={0.12} speed={1.1} />
      <CutLayer shape="waves" opts={{waves: 5, amp: 0.25, phase: 2.4}} size={[34, 4]} px={[1600, 190]} position={[0, -1.3, -2.2]} color="#1f4566" seed={14} frame={f} bob={0.14} speed={0.8} edgeColor="#cfe2ea" />
      <CutLayer shape="grass" size={[18, 2.2]} px={[1200, 150]} position={[0, -2.6, 1.2]} color="#0f1522" seed={15} frame={f} sway={0.01} />
      <Particles kind="dust" count={120} center={[0, 3, -4]} area={[14, 10, 8]} frame={f} color="#f6e6b8" size={0.04} opacity={0.6} />
    </PaperStage>
  );
};

const CaseBoard = () => {
  const f = useCurrentFrame();
  const slap = (at) => { if (f < at) return {s: 0, z: 0}; const st = Math.floor((f - at) * 12 / 30); return {s: st === 0 ? 1.18 : st === 1 ? 0.97 : 1, z: st === 0 ? 0.6 : st === 1 ? 0.05 : 0}; };
  const c1 = slap(18), c2 = slap(34), n1 = slap(48);
  const pins = [[-1.2, 3.35], [2.2, 4.5], [1.9, -1.6], [-2.4, -2.5]];
  return (
    <PaperStage bg="#2a1c12" keyPos={(fr) => [-2.5 + 3.2 * Math.sin(fr * 0.06), 5.5, 6.5]} keyTarget={[0, 0.5, 0]} keyI={2.8} ambient={0.42} ambientColor="#ffd9b0" angle={0.9} overlay={<>
      <PaperTitle y={240} lines={[{text: 'THE CLOCK', at: 4}, {text: 'had stopped.', at: 14, red: true}]} />
      <PaperFinish seed={5} vignette={0.7} />
    </>}>
      <ShotCam preset="push" from={[2.4, -3.4, 15.5]} to={[-0.5, 0.4, 13.2]} look={[[1.2, -1.6, 0], [-0.2, 0.6, 0]]} fov0={44} fov1={40} start={0} end={110} ease="inout" drift={0.02} />
      <Board size={[16, 24]} position={[0, 0, -0.05]} />
      <PhotoCut src="flannan/IMG1.jpg" size={[3.0, 4.0]} position={[-1.2, 1.5, 0.06]} rotation={[0, 0, -0.06]} frame={f} />
      {c1.s > 0 && <group position={[1.9, -2.9, 0.08 + c1.z]} scale={c1.s}><Clipping head="3 KEEPERS VANISHED" mast="The Oban Times" date="DECEMBER 1900" size={[4.2, 3.0]} rotation={[0, 0, 0.04]} frame={f} circle /></group>}
      {c2.s > 0 && <group position={[2.2, 3.3, 0.07 + c2.z]} scale={c2.s}><Clipping head="LIGHT DARK 11 DAYS" mast="Shields Gazette" date="DEC. 1900" size={[3.4, 2.3]} rotation={[0, 0, -0.05]} seed={6} frame={f} /></group>}
      {n1.s > 0 && <group position={[-2.4, -3.3, 0.1 + n1.z]} scale={n1.s}><Note lines={['DEC 26, 1900', 'CLOCK STOPPED', '1 COAT LEFT']} size={[2.1, 1.5]} rotation={[0, 0, 0.08]} /></group>}
      {pins.map(([x, y], i) => <Pin key={i} position={[x, y, 0.1]} color={i === 2 ? '#e8e2d0' : PAPER.red} />)}
      <RedString points={pins} frame={f} start={50} len={45} z={0.2} />
      <Particles kind="ash" count={70} center={[0, 1, 2]} area={[8, 10, 3]} frame={f} color="#e6d6b4" size={0.05} />
    </PaperStage>
  );
};

export const PaperDemo = () => {
  const fonts = usePaperFonts(); const imgs = usePaperImages(['flannan/IMG1.jpg']);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <NoirFonts />
      {fonts && imgs && <>
        <Sequence durationInFrames={125}><Sea /></Sequence>
        <Sequence from={125} durationInFrames={115}><CaseBoard /></Sequence>
      </>}
    </AbsoluteFill>
  );
};
