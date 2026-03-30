import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { Logo } from "./Logo";

export const TeamCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isCTAPhase = frame >= 75;

  // Phase 1: Team sync (0-75)
  const titleSpring = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const titleY = interpolate(titleSpring, [0, 1], [20, 0]);
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const descOpacity = interpolate(frame, [10, 22], [0, 1], { extrapolateRight: "clamp" });

  const teamOpacity = interpolate(frame, [70, 80], [1, 0], { extrapolateRight: "clamp" });

  // Phase 2: CTA (75+)
  const ctaOpacity = interpolate(frame, [75, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaSpring = spring({ frame: frame - 78, fps, config: { damping: 18, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Phase 1: Team sync */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          opacity: teamOpacity,
        }}
      >
        {/* Title — LP exact */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            fontFamily: theme.fontSans,
            color: theme.text,
            letterSpacing: "-0.03em",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          One dev sets up. Everyone benefits.
        </div>

        {/* Description — LP exact */}
        <div
          style={{
            fontSize: 28,
            fontFamily: theme.fontSans,
            color: theme.textMuted,
            opacity: descOpacity,
            textAlign: "center" as const,
            maxWidth: 800,
          }}
        >
          Configs live in your repo. Clone, code — same setup, every time.
        </div>

        {/* Three benefit cards — LP exact copy */}
        <div style={{ display: "flex", gap: 24 }}>
          {[
            {
              title: "Git-native distribution",
              desc: "Plain files in git. No sync server, no accounts, no lock-in.",
              delay: 22,
            },
            {
              title: "Automatic freshness",
              desc: "Run caliber refresh, commit. Every pull brings the latest configs.",
              delay: 30,
            },
            {
              title: "Network effect",
              desc: "First dev sets up once. Every future contributor gets the full config.",
              delay: 38,
            },
          ].map((b) => {
            const cardOpacity = interpolate(frame, [b.delay, b.delay + 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const cardSpring = spring({ frame: frame - b.delay, fps, config: { damping: 18, stiffness: 90 } });

            return (
              <div
                key={b.title}
                style={{
                  width: 420,
                  padding: "32px 28px",
                  borderRadius: 16,
                  border: `1px solid ${theme.surfaceBorder}`,
                  backgroundColor: theme.surface,
                  opacity: cardOpacity,
                  transform: `scale(${cardSpring})`,
                }}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    fontFamily: theme.fontSans,
                    color: theme.text,
                    marginBottom: 12,
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontFamily: theme.fontSans,
                    color: theme.textMuted,
                    lineHeight: 1.5,
                  }}
                >
                  {b.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase 2: CTA */}
      {isCTAPhase && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 36,
            opacity: ctaOpacity,
            transform: `scale(${ctaSpring})`,
          }}
        >
          <Logo size={1} animate delay={78} />

          {/* Tagline — LP hero */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              fontFamily: theme.fontSans,
              color: theme.text,
              letterSpacing: "-0.03em",
              marginTop: 16,
            }}
          >
            AI setup tailored for your codebase.
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              fontFamily: theme.fontSans,
              color: theme.textMuted,
              opacity: interpolate(frame, [90, 102], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Scores your AI setup. Generates what's missing. Syncs to your team via git.
          </div>

          {/* Install command */}
          <div
            style={{
              padding: "20px 48px",
              borderRadius: 12,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              opacity: interpolate(frame, [100, 112], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span style={{ fontSize: 26, fontFamily: theme.fontMono, color: theme.textMuted }}>$ </span>
            <span style={{ fontSize: 26, fontFamily: theme.fontMono, color: theme.text }}>
              npx @rely-ai/caliber init
            </span>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
