import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { theme } from "./theme";

// Scene 1: "The Hook" (0-4s, 120 frames)
// One idea: Your AI tools are only as good as their setup.
// Animation: opacity fades only. Zero springs. Zero transforms.

export const ProblemHook: React.FC = () => {
  const frame = useCurrentFrame();

  // "Bad setup = bad agent." fades in
  const headlineOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle fades in after headline
  const subtitleOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  // At frame 50, crossfade: first headline fades out, second fades in
  const headline1Opacity = interpolate(frame, [50, 65], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headline2Opacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        {/* Headline area — fixed position, crossfade between two texts */}
        <div style={{ position: "relative", height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              position: "absolute",
              fontSize: 80,
              fontWeight: 700,
              fontFamily: theme.fontSans,
              color: theme.text,
              letterSpacing: "-0.03em",
              opacity: headlineOpacity * headline1Opacity,
              whiteSpace: "nowrap",
            }}
          >
            Bad setup = bad agent.
          </div>
          <div
            style={{
              position: "absolute",
              fontSize: 80,
              fontWeight: 700,
              fontFamily: theme.fontSans,
              letterSpacing: "-0.03em",
              opacity: headline2Opacity,
              whiteSpace: "nowrap",
              color: theme.brand3,
            }}
          >
            Caliber fixes that.
          </div>
        </div>

        {/* Subtitle — fades out with first headline */}
        <div
          style={{
            fontSize: 32,
            fontFamily: theme.fontSans,
            color: theme.textMuted,
            fontWeight: 400,
            opacity: subtitleOpacity * headline1Opacity,
          }}
        >
          Most teams ship with zero AI context.
        </div>
      </div>
    </AbsoluteFill>
  );
};
