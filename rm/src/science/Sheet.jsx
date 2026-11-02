import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage, Cam, Char, Stars, Planet, Lights, SciFonts, Vignette} from './kit.jsx';
import {Deck} from './sets.jsx';
const ROWS = [
  ['PIP', 'Pip', 'Curious kid scientist. Asks the question, explains it with everyday stuff.', '#5fd6e0'],
  ['BOLT', 'Bolt', 'Deadpan lab robot. Says the hard numbers. One-word verdicts.', '#6fe5ff'],
  ['ZIB', 'Zib', 'Tiny alien troublemaker. Presses the button that starts every "what if".', '#7ed957'],
];
export const Sheet = () => (
  <AbsoluteFill style={{background: '#0b0b22'}}>
    <SciFonts />
    <Stage overlay={<>
      <div style={{position: 'absolute', top: 150, width: '100%', textAlign: 'center', fontFamily: 'Lilita One', fontSize: 92, color: '#fff', letterSpacing: 3}}>THE WHAT-IF CREW</div>
      <div style={{position: 'absolute', top: 262, width: '100%', textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 800, fontSize: 34, color: '#ffb547', letterSpacing: 2}}>IA SCIENCE · CHARACTER SHEET (TEST)</div>
      <div style={{position: 'absolute', top: 1270, left: 70, right: 70}}>
        {ROWS.map(([k, n, d, c]) => <div key={k} style={{margin: '0 0 26px', padding: '18px 26px', borderRadius: 22, background: 'rgba(10,8,30,0.8)', border: `5px solid ${c}`}}>
          <div style={{fontFamily: 'Lilita One', fontSize: 58, color: c}}>{n}</div>
          <div style={{fontFamily: 'Montserrat', fontWeight: 700, fontSize: 32, color: '#f2f0ff', lineHeight: 1.25}}>{d}</div></div>)}
      </div>
      <Vignette /></>}>
      <Cam pos={[0, 1.45, 6.6]} look={[0, 0.95, 0]} fov={38}>
        <Lights />
        <Stars />
        <Planet file="science/earth_toon.png" r={9} pos={[5, -3, -34]} rotY={2.2} tilt={0.4} atmo="#7fc8ff" />
        <Planet file="science/moon_toon.png" r={2.2} pos={[-9, 9, -40]} />
        <Deck />
        <Char who="PIP" pos={[-1.15, 0, 0.3]} expr="happy" armR={150} armL={10} />
        <Char who="BOLT" pos={[1.25, 0, 0]} expr="deadpan" armL={20} armR={5} look={-0.5} />
        <Char who="ZIB" pos={[0.1, 0, 0.9]} expr="smug" armR={60} armL={25} item="remote" />
      </Cam>
    </Stage>
  </AbsoluteFill>
);
