// src/Root.tsx
import React from 'react';
import { Audio, Composition, Series, staticFile } from 'remotion';
import { THEME } from './theme';
import { SCENES, TOTAL_FRAMES, FPS } from './timing';
import { CameraAndHitWrapper, GlobalFXAndTextLayer } from './kit/GlobalOverlays';

import { S01HookRise } from './scenes/S01-HookRise';
import { S02ZeroSound } from './scenes/S02-ZeroSound';
import { S03SilentShadow } from './scenes/S03-SilentShadow';
import { S04HilltopPostThermal } from './scenes/S04-HilltopPostThermal';
import { S05ThirdAgentScopeCall } from './scenes/S05-ThirdAgentScopeCall';
import { S06ThermalLockTriangle } from './scenes/S06-ThermalLockTriangle';
import { S07StraightUpClimb } from './scenes/S07-StraightUpClimb';
import { S08NoTiltNoWobbleNoLights } from './scenes/S08-NoTiltNoWobbleNoLights';
import { S09StoppedDeadHang } from './scenes/S09-StoppedDeadHang';
import { S10DroneOneMileLoud } from './scenes/S10-DroneOneMileLoud';
import { S11AcousticContrast } from './scenes/S11-AcousticContrast';
import { S12ShotSidewaysJetSpeed } from './scenes/S12-ShotSidewaysJetSpeed';
import { S13BankedAndDoveCanyon } from './scenes/S13-BankedAndDoveCanyon';
import { S14LeftThermalView } from './scenes/S14-LeftThermalView';
import { S15StillTotalSilence } from './scenes/S15-StillTotalSilence';
import { S16NextMorningCanyonSearch } from './scenes/S16-NextMorningCanyonSearch';
import { S17NoWreckageNoScarredGround } from './scenes/S17-NoWreckageNoScarredGround';
import { S18FbiVsPentagonRecord } from './scenes/S18-FbiVsPentagonRecord';
import { S19LoopPullbackToFrameZero } from './scenes/S19-LoopPullbackToFrameZero';

export const TriangleComposition: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: THEME.width,
        height: THEME.height,
        backgroundColor: THEME.colors.silhouetteBlack,
        overflow: 'hidden',
      }}
    >
      {/* Voiceover Audio track from /public/vo.wav */}
      <Audio src={staticFile('vo.wav')} />

      {/* Global Camera Drift & Hit Shake Wrapper */}
      <CameraAndHitWrapper>
        <Series>
          <Series.Sequence durationInFrames={70}>
            <S01HookRise />
          </Series.Sequence>
          <Series.Sequence durationInFrames={57}>
            <S02ZeroSound />
          </Series.Sequence>
          <Series.Sequence durationInFrames={50}>
            <S03SilentShadow />
          </Series.Sequence>
          <Series.Sequence durationInFrames={128}>
            <S04HilltopPostThermal />
          </Series.Sequence>
          <Series.Sequence durationInFrames={69}>
            <S05ThirdAgentScopeCall />
          </Series.Sequence>
          <Series.Sequence durationInFrames={35}>
            <S06ThermalLockTriangle />
          </Series.Sequence>
          <Series.Sequence durationInFrames={62}>
            <S07StraightUpClimb />
          </Series.Sequence>
          <Series.Sequence durationInFrames={73}>
            <S08NoTiltNoWobbleNoLights />
          </Series.Sequence>
          <Series.Sequence durationInFrames={93}>
            <S09StoppedDeadHang />
          </Series.Sequence>
          <Series.Sequence durationInFrames={79}>
            <S10DroneOneMileLoud />
          </Series.Sequence>
          <Series.Sequence durationInFrames={67}>
            <S11AcousticContrast />
          </Series.Sequence>
          <Series.Sequence durationInFrames={103}>
            <S12ShotSidewaysJetSpeed />
          </Series.Sequence>
          <Series.Sequence durationInFrames={67}>
            <S13BankedAndDoveCanyon />
          </Series.Sequence>
          <Series.Sequence durationInFrames={73}>
            <S14LeftThermalView />
          </Series.Sequence>
          <Series.Sequence durationInFrames={53}>
            <S15StillTotalSilence />
          </Series.Sequence>
          <Series.Sequence durationInFrames={54}>
            <S16NextMorningCanyonSearch />
          </Series.Sequence>
          <Series.Sequence durationInFrames={107}>
            <S17NoWreckageNoScarredGround />
          </Series.Sequence>
          <Series.Sequence durationInFrames={184}>
            <S18FbiVsPentagonRecord />
          </Series.Sequence>
          <Series.Sequence durationInFrames={106}>
            <S19LoopPullbackToFrameZero />
          </Series.Sequence>
        </Series>
      </CameraAndHitWrapper>

      {/* Global Film Grain, Hit Flashes & High-Contrast On-Screen Text */}
      <GlobalFXAndTextLayer />
    </div>
  );
};

const SCENE_COMPONENTS: Record<string, React.FC> = {
  'S01-HookRise': S01HookRise,
  'S02-ZeroSound': S02ZeroSound,
  'S03-SilentShadow': S03SilentShadow,
  'S04-HilltopPostThermal': S04HilltopPostThermal,
  'S05-ThirdAgentScopeCall': S05ThirdAgentScopeCall,
  'S06-ThermalLockTriangle': S06ThermalLockTriangle,
  'S07-StraightUpClimb': S07StraightUpClimb,
  'S08-NoTiltNoWobbleNoLights': S08NoTiltNoWobbleNoLights,
  'S09-StoppedDeadHang': S09StoppedDeadHang,
  'S10-DroneOneMileLoud': S10DroneOneMileLoud,
  'S11-AcousticContrast': S11AcousticContrast,
  'S12-ShotSidewaysJetSpeed': S12ShotSidewaysJetSpeed,
  'S13-BankedAndDoveCanyon': S13BankedAndDoveCanyon,
  'S14-LeftThermalView': S14LeftThermalView,
  'S15-StillTotalSilence': S15StillTotalSilence,
  'S16-NextMorningCanyonSearch': S16NextMorningCanyonSearch,
  'S17-NoWreckageNoScarredGround': S17NoWreckageNoScarredGround,
  'S18-FbiVsPentagonRecord': S18FbiVsPentagonRecord,
  'S19-LoopPullbackToFrameZero': S19LoopPullbackToFrameZero,
};

export const Root: React.FC = () => {
  const cfg = {
    width: THEME.width,
    height: THEME.height,
    fps: FPS,
  };

  return (
    <>
      {/* Primary Composition required by prompt: npx remotion render Triangle out.mp4 */}
      <Composition
        id="Triangle"
        component={TriangleComposition}
        durationInFrames={TOTAL_FRAMES}
        {...cfg}
      />

      {/* Individual Scene Compositions for isolated previewing */}
      {SCENES.map((scene) => {
        const Comp = SCENE_COMPONENTS[scene.id];
        return (
          <Composition
            key={scene.id}
            id={scene.id}
            component={Comp}
            durationInFrames={scene.durationInFrames}
            {...cfg}
          />
        );
      })}
    </>
  );
};
