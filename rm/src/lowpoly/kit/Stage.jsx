import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {SkyGradient, Lights} from './Sky.jsx';

/**
 * One 3D shot: CSS sky gradient + transparent ThreeCanvas with palette lights/fog + DOM overlays on top.
 * children = 3D content (must include a <CameraRig/>); overlay = DOM layer (Headline, Pill, labels...).
 * background: optional CSS background instead of the sky (e.g. blueprint grid).
 */
export const Stage = ({palette = 'day', fog = [40, 170], children, overlay, background}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill>
      {background ? <AbsoluteFill style={{background}} /> : <SkyGradient palette={palette} />}
      <ThreeCanvas flat width={width} height={height} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} camera={{fov: 50, position: [0, 10, 30]}}>
        <Lights palette={palette} fogNear={fog[0]} fogFar={fog[1]} />
        {children}
      </ThreeCanvas>
      {overlay}
    </AbsoluteFill>
  );
};
