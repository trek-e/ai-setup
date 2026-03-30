import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { theme } from "./theme";

// Scene 3: "Stays Fresh" (10-14s, 120 frames)
// One idea: Configs evolve with your code automatically.
// Animation: opacity fades + width interpolation for divider. No springs.

const diffLines = [
  { prefix: " ", text: 'import { db } from "./db";', color: theme.textMuted },
  { prefix: "-", text: 'import { users } from "./schema";', color: theme.red },
  { prefix: "+", text: 'import { users, teams } from "./schema";', color: theme.green },
];

export const FreshScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Headline
  const headlineOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Card
  const cardOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Top section (diff)
  const diffOpacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Divider grows from center
  const dividerWidth = interpolate(frame, [36, 52], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom section (updates)
  const updatesOpacity = interpolate(frame, [48, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Command pills
  const pillsOpacity = interpolate(frame, [66, 78], [0, 1], {
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
          gap: 48,
        }}
      >
        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            fontFamily: theme.fontSans,
            color: theme.text,
            letterSpacing: "-0.03em",
            opacity: headlineOpacity,
          }}
        >
          Configs that keep up.
        </div>

        {/* Card */}
        <div
          style={{
            width: 800,
            backgroundColor: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: 16,
            overflow: "hidden",
            opacity: cardOpacity,
          }}
        >
          {/* Top: Code changes */}
          <div style={{ padding: "28px 32px", opacity: diffOpacity }}>
            <div
              style={{
                fontSize: 20,
                fontFamily: theme.fontSans,
                color: theme.textMuted,
                fontWeight: 500,
                marginBottom: 16,
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
              }}
            >
              Code changes
            </div>
            <div
              style={{
                backgroundColor: theme.surfaceHeader,
                borderRadius: 8,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {diffLines.map((line) => (
                <div key={line.text} style={{ display: "flex", gap: 12 }}>
                  <span
                    style={{
                      fontSize: 20,
                      fontFamily: theme.fontMono,
                      color: line.color,
                      fontWeight: 500,
                      width: 16,
                      textAlign: "center" as const,
                    }}
                  >
                    {line.prefix}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontFamily: theme.fontMono,
                      color: line.color,
                    }}
                  >
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", justifyContent: "center", padding: "0 32px" }}>
            <div
              style={{
                height: 2,
                width: `${dividerWidth}%`,
                backgroundColor: theme.brand3,
                borderRadius: 1,
              }}
            />
          </div>

          {/* Bottom: Configs update */}
          <div style={{ padding: "28px 32px", opacity: updatesOpacity }}>
            <div
              style={{
                fontSize: 20,
                fontFamily: theme.fontSans,
                color: theme.textMuted,
                fontWeight: 500,
                marginBottom: 16,
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
              }}
            >
              Configs update
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {["CLAUDE.md updated", ".cursor/rules/ refreshed"].map((text) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                    <circle cx={10} cy={10} r={9} stroke={theme.green} strokeWidth={1.5} opacity={0.4} />
                    <path
                      d="M6 10L9 13L14 7"
                      stroke={theme.green}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontSize: 24,
                      fontFamily: theme.fontMono,
                      color: theme.text,
                      fontWeight: 500,
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Command pills */}
        <div style={{ display: "flex", gap: 20, opacity: pillsOpacity }}>
          {["caliber refresh", "caliber learn"].map((cmd) => (
            <div
              key={cmd}
              style={{
                padding: "12px 28px",
                borderRadius: 24,
                backgroundColor: theme.surface,
                border: `1px solid ${theme.surfaceBorder}`,
              }}
            >
              <span style={{ fontSize: 22, fontFamily: theme.fontMono, color: theme.textSecondary }}>
                {cmd}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
