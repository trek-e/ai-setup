import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { ProblemHook } from "./components/ProblemHook";
import { InitScene } from "./components/InitScene";
import { FreshScene } from "./components/FreshScene";
import { TeamCTA } from "./components/TeamCTA";
import { theme } from "./components/theme";

const CrossFade: React.FC<{ children: React.ReactNode; from: number; duration: number }> = ({
  children,
  from,
  duration,
}) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [from, from + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [from + duration - 18, from + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

// 24 seconds = 720 frames @ 30fps
// Scene breakdown (2-frame gaps prevent crossfade overlap):
//   0-5.6s    (0-170):     ProblemHook — "Bad setup = bad agent" → "Caliber fixes that"
//   5.7-13.7s (172-410):   InitScene — terminal + score arc (hero)
//   13.7-19.3s(412-580):   FreshScene — diff → config update flow
//   19.4-24s  (582-720):   TeamCTA — team sync + CTA

export const CaliberDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.fontSans }}>
      {/* LP ambient orange glow */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: theme.heroGlow,
          pointerEvents: "none",
        }}
      />

      {/* Scene 1: Hook */}
      <CrossFade from={0} duration={170}>
        <Sequence from={0} durationInFrames={170}>
          <ProblemHook />
        </Sequence>
      </CrossFade>

      {/* Scene 2: Init + Score (hero) */}
      <CrossFade from={172} duration={238}>
        <Sequence from={172} durationInFrames={238}>
          <InitScene />
        </Sequence>
      </CrossFade>

      {/* Scene 3: Fresh */}
      <CrossFade from={412} duration={168}>
        <Sequence from={412} durationInFrames={168}>
          <FreshScene />
        </Sequence>
      </CrossFade>

      {/* Scene 4: Team + CTA */}
      <CrossFade from={582} duration={138}>
        <Sequence from={582} durationInFrames={138}>
          <TeamCTA />
        </Sequence>
      </CrossFade>
    </AbsoluteFill>
  );
};
