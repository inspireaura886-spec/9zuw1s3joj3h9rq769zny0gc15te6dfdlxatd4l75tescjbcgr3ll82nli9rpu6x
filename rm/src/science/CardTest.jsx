import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage, Cam, Char, Lights} from './kit.jsx';
export const CardTest = () => (
  <AbsoluteFill style={{background: '#9ad'}}>
    <Stage bg="#9ad">
      <Cam pos={[0, 0.9, 9]} look={[0, 0.9, 0]} fov={36}>
        <Lights />
        <Char who="PIP" pos={[-1.05, 0, 0]} expr="shock" armR={150} armL={10} mouth={0.7} item="shovel" />
        <Char who="BOLT" pos={[0.45, 0, -0.5]} expr="deadpan" armL={20} armR={80} mouth={0.6} />
        <Char who="ZIB" pos={[0.8, 0, 0.8]} expr="happy" armR={70} armL={25} item="spoon" mouth={0.5} />
      </Cam>
    </Stage>
  </AbsoluteFill>
);
