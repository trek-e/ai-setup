import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { theme } from "./theme";
import { Logo } from "./Logo";
import { ClaudeIcon, CursorIcon, CodexIcon, CopilotIcon } from "./ToolIcons";

// Scene 4: "Team + CTA" (14-18s, 120 frames)
// Phase A (0-60): One dev sets up, everyone benefits
// Phase B (60-120): CTA with logo, command, platforms
// Animation: opacity fades only. Springs only for Logo.

const Avatar: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: theme.cardBg,
      border: `2px solid ${color}50`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill="none">
      <circle cx={12} cy={8} r={4} fill={`${color}40`} stroke={color} strokeWidth={1.5} />
      <path
        d="M4 20C4 17.24 7.58 15 12 15C16.42 15 20 17.24 20 20"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill={`${color}20`}
      />
    </svg>
  </div>
);

export const TeamCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const isCTAPhase = frame >= 60;

  // Phase A
  const teamOpacity = interpolate(frame, [0, 15, 54, 66], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase B
  const ctaOpacity = interpolate(frame, [60, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const commandOpacity = interpolate(frame, [78, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const platformsOpacity = interpolate(frame, [88, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Phase A: Team sync */}
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
        {/* LP section label */}
        <div
          style={{
            fontSize: 22,
            fontFamily: theme.fontMono,
            color: theme.brand2,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
          }}
        >
          TEAM SYNC
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            fontFamily: theme.fontSans,
            color: theme.text,
            letterSpacing: "-0.03em",
            marginTop: -16,
          }}
        >
          One dev sets up. Everyone benefits.
        </div>

        {/* Flow diagram */}
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          {/* Source dev */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Avatar size={72} color={theme.brand3} />
            <span style={{ fontSize: 20, fontFamily: theme.fontMono, color: theme.brand3 }}>
              caliber init
            </span>
          </div>

          {/* Connection: orange-tinted dotted line */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 240,
                height: 2,
                backgroundImage: `repeating-linear-gradient(90deg, rgba(249,115,22,0.3) 0, rgba(249,115,22,0.3) 8px, transparent 8px, transparent 16px)`,
              }}
            />
            <span style={{ fontSize: 18, fontFamily: theme.fontMono, color: theme.textMuted }}>
              git push
            </span>
          </div>

          {/* Receiver devs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[theme.accent, theme.green, theme.purple].map((color) => (
              <div key={color} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar size={52} color={color} />
                <span style={{ fontSize: 18, fontFamily: theme.fontMono, color: theme.textMuted }}>
                  caliber sync
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontFamily: theme.fontSans,
            color: theme.textMuted,
            fontWeight: 400,
          }}
        >
          Syncs to your team via git.
        </div>
      </div>

      {/* Phase B: CTA */}
      {isCTAPhase && (
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            opacity: ctaOpacity,
          }}
        >
          {/* Logo — the ONE spring animation */}
          <Logo size={1.2} animate delay={62} />

          {/* Brand name */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              fontFamily: theme.fontSans,
              color: theme.text,
              letterSpacing: "-0.03em",
              marginTop: 8,
            }}
          >
            caliber
          </div>

          {/* Tagline — LP hero */}
          <div
            style={{
              fontSize: 28,
              fontFamily: theme.fontSans,
              color: theme.textMuted,
              fontWeight: 400,
            }}
          >
            AI setup tailored for your codebase.
          </div>

          {/* Command pill — LP CTA with glow */}
          <div
            style={{
              padding: "18px 44px",
              borderRadius: 8,
              backgroundColor: theme.cardBg,
              border: `1px solid rgba(249,115,22,0.3)`,
              boxShadow: theme.cardGlowStrong,
              opacity: commandOpacity,
            }}
          >
            <span style={{ fontSize: 26, fontFamily: theme.fontMono, color: theme.textMuted }}>
              {"$ "}
            </span>
            <span style={{ fontSize: 26, fontFamily: theme.fontMono, color: theme.text }}>
              npm install -g @rely-ai/caliber
            </span>
          </div>

          {/* Platform icons */}
          <div
            style={{
              display: "flex",
              gap: 40,
              alignItems: "center",
              opacity: platformsOpacity,
            }}
          >
            {[
              { Icon: ClaudeIcon, label: "Claude Code", color: theme.brand2 },
              { Icon: CursorIcon, label: "Cursor", color: theme.accent },
              { Icon: CodexIcon, label: "Codex", color: theme.green },
              { Icon: CopilotIcon, label: "Copilot", color: theme.purple },
            ].map((p) => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <p.Icon size={22} color={p.color} />
                <span
                  style={{
                    fontSize: 22,
                    fontFamily: theme.fontSans,
                    color: p.color,
                    fontWeight: 500,
                  }}
                >
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
