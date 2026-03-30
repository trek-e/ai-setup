import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "./theme";

// LP exact copy — two-column comparison
const withoutSetup = [
  "No project context for agents",
  "No learning from past AI sessions",
  "Missing MCPs that unlock key features",
  "Stale configs nobody updates",
];

const withSetup = [
  "Full project context generated",
  "Session learnings captured automatically",
  "Right MCPs recommended and installed",
  "Configs stay fresh as code changes",
];

export const ProblemHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const titleY = interpolate(titleSpring, [0, 1], [20, 0]);
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const columnsOpacity = interpolate(frame, [18, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 64 }}>
        {/* Title — LP exact */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            fontFamily: theme.fontSans,
            color: theme.text,
            letterSpacing: "-0.04em",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          Bad setup = bad agent.
        </div>

        {/* Two-column comparison — matches LP layout */}
        <div
          style={{
            display: "flex",
            gap: 32,
            opacity: columnsOpacity,
          }}
        >
          {/* Without Setup */}
          <div
            style={{
              width: 640,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 32px",
                borderBottom: `1px solid ${theme.surfaceBorder}`,
                backgroundColor: theme.surfaceHeader,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 600, fontFamily: theme.fontSans, color: theme.red }}>
                Without Setup
              </span>
            </div>
            <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
              {withoutSetup.map((item, i) => {
                const delay = 24 + i * 6;
                const itemOpacity = interpolate(frame, [delay, delay + 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      opacity: itemOpacity,
                    }}
                  >
                    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                      <circle cx={10} cy={10} r={9} stroke={theme.red} strokeWidth={1.5} opacity={0.4} />
                      <path d="M7 7L13 13M13 7L7 13" stroke={theme.red} strokeWidth={1.5} strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: 26, fontFamily: theme.fontSans, color: theme.textSecondary }}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* With Setup */}
          <div
            style={{
              width: 640,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "20px 32px",
                borderBottom: `1px solid ${theme.surfaceBorder}`,
                backgroundColor: theme.surfaceHeader,
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 600, fontFamily: theme.fontSans, color: theme.green }}>
                With Setup
              </span>
            </div>
            <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
              {withSetup.map((item, i) => {
                const delay = 48 + i * 6;
                const itemOpacity = interpolate(frame, [delay, delay + 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      opacity: itemOpacity,
                    }}
                  >
                    <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                      <circle cx={10} cy={10} r={9} stroke={theme.green} strokeWidth={1.5} opacity={0.4} />
                      <path d="M6 10L9 13L14 7" stroke={theme.green} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 26, fontFamily: theme.fontSans, color: theme.textSecondary }}>
                      {item}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
