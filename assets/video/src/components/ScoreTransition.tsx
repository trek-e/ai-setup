import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "./theme";

function getScoreColor(score: number): string {
  if (score < 50) return theme.red;
  if (score < 70) return theme.yellow;
  return theme.green;
}

function getGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

const categories = [
  { label: "Files & Setup", before: 8, after: 24, max: 25 },
  { label: "Quality", before: 10, after: 23, max: 25 },
  { label: "Grounding", before: 5, after: 19, max: 20 },
  { label: "Accuracy", before: 7, after: 15, max: 15 },
  { label: "Freshness & Safety", before: 5, after: 10, max: 10 },
];

export const ScoreTransition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerSpring = spring({ frame: frame - 2, fps, config: { damping: 18, stiffness: 80 } });

  // Subtitle fades in first
  const subtitleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  // Score counter: 0 → 94 over frames 20-55
  const counterProgress = interpolate(frame, [20, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const score = Math.round(interpolate(counterProgress, [0, 1], [0, 94]));
  const barWidth = interpolate(counterProgress, [0, 1], [0, 94]);
  const scoreColor = getScoreColor(score);
  const grade = getGrade(score);

  // Points gained label
  const pointsOpacity = score >= 94
    ? interpolate(frame, [56, 65], [0, 1], { extrapolateRight: "clamp" })
    : 0;

  // Security pills
  const securityOpacity = interpolate(frame, [75, 90], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
        {/* Subtitle — LP exact */}
        <div
          style={{
            fontSize: 28,
            fontFamily: theme.fontSans,
            color: theme.textMuted,
            fontWeight: 500,
            letterSpacing: "0.02em",
            opacity: subtitleOpacity,
          }}
        >
          Deterministic. No LLM needed.
        </div>

        {/* Terminal card */}
        <div
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            border: `1px solid ${theme.surfaceBorder}`,
            width: 1100,
            overflow: "hidden",
            transform: `scale(${containerSpring})`,
          }}
        >
          {/* Terminal header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 20px",
              backgroundColor: theme.surfaceHeader,
              borderBottom: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: `${theme.red}80` }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: `${theme.yellow}80` }} />
            <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: `${theme.green}80` }} />
            <span style={{ color: theme.textMuted, fontSize: 18, fontFamily: theme.fontMono, marginLeft: 12 }}>
              $ caliber score
            </span>
          </div>

          {/* Score content */}
          <div style={{ padding: "48px 56px" }}>
            {/* Score + Grade row */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 24 }}>
              <span
                style={{
                  fontSize: 120,
                  fontWeight: 700,
                  fontFamily: theme.fontSans,
                  color: scoreColor,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span style={{ color: theme.textMuted, fontSize: 40, fontFamily: theme.fontSans, fontWeight: 400 }}>
                /100
              </span>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    padding: "8px 28px",
                    borderRadius: 32,
                    border: `1.5px solid ${scoreColor}40`,
                    backgroundColor: `${scoreColor}10`,
                  }}
                >
                  <span style={{ fontSize: 36, fontWeight: 700, fontFamily: theme.fontSans, color: scoreColor }}>
                    Grade {grade}
                  </span>
                </div>
                {pointsOpacity > 0 && (
                  <span
                    style={{
                      fontSize: 28,
                      fontFamily: theme.fontSans,
                      color: theme.green,
                      fontWeight: 600,
                      opacity: pointsOpacity,
                    }}
                  >
                    +94 pts
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: 8,
                backgroundColor: `${theme.textMuted}15`,
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 36,
              }}
            >
              <div
                style={{
                  width: `${barWidth}%`,
                  height: "100%",
                  backgroundColor: scoreColor,
                  borderRadius: 4,
                  transition: "background-color 0.3s",
                }}
              />
            </div>

            {/* Category breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {categories.map((cat, i) => {
                const catValue = Math.round(interpolate(counterProgress, [0, 1], [cat.before, cat.after]));
                const catProgress = catValue / cat.max;
                const catColor = catProgress >= 0.8 ? theme.green : catProgress >= 0.5 ? theme.yellow : theme.red;
                const catOpacity = interpolate(frame, [24 + i * 3, 30 + i * 3], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });

                return (
                  <div key={cat.label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: catOpacity }}>
                    <span
                      style={{
                        color: theme.textSecondary,
                        fontSize: 22,
                        fontFamily: theme.fontSans,
                        minWidth: 200,
                        fontWeight: 500,
                      }}
                    >
                      {cat.label}
                    </span>
                    <div style={{ flex: 1, height: 6, backgroundColor: `${theme.textMuted}12`, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${catProgress * 100}%`, height: "100%", backgroundColor: catColor, borderRadius: 3 }} />
                    </div>
                    <span
                      style={{
                        color: catColor,
                        fontSize: 22,
                        fontWeight: 600,
                        fontFamily: theme.fontMono,
                        fontVariantNumeric: "tabular-nums",
                        minWidth: 80,
                        textAlign: "right" as const,
                      }}
                    >
                      {catValue}/{cat.max}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div style={{ display: "flex", gap: 20, opacity: securityOpacity }}>
          {["No API key needed", "No secrets leaked", "Fully reversible"].map((item) => (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 24px",
                borderRadius: 24,
                border: `1px solid ${theme.surfaceBorder}`,
                backgroundColor: theme.surface,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1L3 3.5V7C3 10.87 5.14 14.43 8 15.5C10.86 14.43 13 10.87 13 7V3.5L8 1Z"
                  fill={`${theme.green}15`}
                  stroke={theme.green}
                  strokeWidth={1}
                />
                <path d="M6 8L7.5 9.5L10 6.5" stroke={theme.green} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 20, fontFamily: theme.fontSans, color: theme.textSecondary, fontWeight: 500 }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
