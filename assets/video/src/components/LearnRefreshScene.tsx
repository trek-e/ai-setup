import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "./theme";

const diffLines = [
  { type: "context", text: "  export async function deploy() {" },
  { type: "remove", text: "-    await runMigrations();" },
  { type: "add", text: "+    await runMigrations({ dryRun: true });" },
  { type: "add", text: "+    await validateSchema();" },
  { type: "context", text: "     await pushToStaging();" },
];

const commands = [
  { cmd: "caliber learn", desc: "Capture patterns from AI coding sessions", color: theme.brand3 },
  { cmd: "caliber refresh", desc: "Update docs based on recent code changes", color: theme.accent },
  { cmd: "caliber hooks", desc: "Manage auto-refresh automation", color: theme.brand2 },
  { cmd: "caliber undo", desc: "Revert all changes (full backup)", color: theme.textSecondary },
];

export const LearnRefreshScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const leftSpring = spring({ frame: frame - 5, fps, config: { damping: 18, stiffness: 80 } });
  const rightSpring = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 80 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        {/* Title — LP section heading style */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            fontFamily: theme.fontSans,
            color: theme.text,
            letterSpacing: "-0.02em",
            opacity: headerOpacity,
          }}
        >
          Simple CLI. Powerful workflow.
        </div>

        {/* Two cards */}
        <div style={{ display: "flex", gap: 32, width: 1600 }}>
          {/* Left — caliber learn terminal */}
          <div
            style={{
              flex: 1,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: 16,
              overflow: "hidden",
              transform: `scale(${leftSpring})`,
            }}
          >
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
                $ caliber learn finalize
              </span>
            </div>

            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontSize: 20,
                  fontFamily: theme.fontMono,
                  color: theme.textMuted,
                  opacity: interpolate(frame, [16, 22], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                Analyzing session history...
              </div>

              {[
                { text: "3 session patterns detected", color: theme.green, delay: 26 },
                { text: "1 anti-pattern captured", color: theme.yellow, delay: 36 },
                { text: "Written to CALIBER_LEARNINGS.md", color: theme.brand2, delay: 46 },
              ].map((step) => (
                <div
                  key={step.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    opacity: interpolate(frame, [step.delay, step.delay + 6], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    fontFamily: theme.fontMono,
                    fontSize: 22,
                  }}
                >
                  <span style={{ color: step.color }}>{"✓"}</span>
                  <span style={{ color: step.color }}>{step.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — caliber refresh terminal */}
          <div
            style={{
              flex: 1,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.surfaceBorder}`,
              borderRadius: 16,
              overflow: "hidden",
              transform: `scale(${rightSpring})`,
            }}
          >
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
                $ caliber refresh
              </span>
            </div>

            <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontSize: 20,
                  fontFamily: theme.fontMono,
                  color: theme.textMuted,
                  opacity: interpolate(frame, [20, 26], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                Detecting code changes...
              </div>

              {/* Diff block */}
              <div
                style={{
                  backgroundColor: theme.bg,
                  border: `1px solid ${theme.surfaceBorder}`,
                  borderRadius: 10,
                  padding: "14px 18px",
                  opacity: interpolate(frame, [30, 38], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                {diffLines.map((line, i) => {
                  const lineColor =
                    line.type === "add" ? theme.green
                    : line.type === "remove" ? theme.red
                    : theme.textMuted;

                  return (
                    <div
                      key={i}
                      style={{
                        fontFamily: theme.fontMono,
                        fontSize: 17,
                        lineHeight: 1.8,
                        color: lineColor,
                        backgroundColor: line.type === "add" ? `${theme.green}08` : line.type === "remove" ? `${theme.red}08` : "transparent",
                        padding: "0 4px",
                        borderRadius: 3,
                      }}
                    >
                      {line.text}
                    </div>
                  );
                })}
              </div>

              {/* Updated files */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: interpolate(frame, [55, 64], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                <span style={{ color: theme.green, fontSize: 20, fontFamily: theme.fontMono }}>{"✓"}</span>
                <span style={{ fontSize: 20, fontFamily: theme.fontMono, color: theme.text }}>
                  4 files updated
                </span>
                <span style={{ fontSize: 18, fontFamily: theme.fontMono, color: theme.textMuted }}>
                  CLAUDE.md, .cursor/rules/, AGENTS.md, copilot-instructions.md
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Command reference row */}
        <div
          style={{
            display: "flex",
            gap: 24,
            opacity: interpolate(frame, [75, 88], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {commands.map((c) => (
            <div
              key={c.cmd}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "14px 28px",
                borderRadius: 12,
                border: `1px solid ${theme.surfaceBorder}`,
                backgroundColor: theme.surface,
              }}
            >
              <span style={{ fontSize: 20, fontFamily: theme.fontMono, color: c.color, fontWeight: 600 }}>
                {c.cmd}
              </span>
              <span style={{ fontSize: 16, fontFamily: theme.fontSans, color: theme.textMuted, textAlign: "center" as const }}>
                {c.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
