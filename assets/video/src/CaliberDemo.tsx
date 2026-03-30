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

// 18 seconds = 540 frames @ 30fps
// Scene breakdown:
//   0-4s      (0-120):     ProblemHook — "Bad setup = bad agent" → "Caliber fixes that"
//   4-10s     (120-300):   InitScene — terminal + score arc (hero)
//   10-14s    (300-420):   FreshScene — diff → config update flow
//   14-18s    (420-540):   TeamCTA — team sync + CTA

export const CaliberDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, fontFamily: theme.fontSans }}>
      {/* Scene 1: Hook */}
      <CrossFade from={0} duration={120}>
        <Sequence from={0} durationInFrames={120}>
          <ProblemHook />
        </Sequence>
      </CrossFade>

      {/* Scene 2: Init + Score (hero) */}
      <CrossFade from={120} duration={180}>
        <Sequence from={120} durationInFrames={180}>
          <InitScene />
        </Sequence>
      </CrossFade>

      {/* Scene 3: Fresh */}
      <CrossFade from={300} duration={120}>
        <Sequence from={300} durationInFrames={120}>
          <FreshScene />
        </Sequence>
      </CrossFade>

      {/* Scene 4: Team + CTA */}
      <CrossFade from={420} duration={120}>
        <Sequence from={420} durationInFrames={120}>
          <TeamCTA />
        </Sequence>
      </CrossFade>
    </AbsoluteFill>
  );
};
