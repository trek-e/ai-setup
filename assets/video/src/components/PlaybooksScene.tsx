import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { ClaudeIcon, CursorIcon, CodexIcon, CopilotIcon } from "./ToolIcons";

const buildSteps: Array<{ frame: number; text: string; color: string }> = [
  { frame: 18, text: "Scanning project structure...", color: theme.textMuted },
  { frame: 32, text: "Detected: Next.js + Drizzle + PostgreSQL", color: theme.brand1 },
  { frame: 48, text: "Installing 4 skills from Skills.sh", color: theme.brand3 },
  { frame: 64, text: "Generated CLAUDE.md — 847 lines", color: theme.accent },
  { frame: 78, text: "Generated .cursor/rules/ — 12 files", color: theme.accent },
  { frame: 92, text: "Generated AGENTS.md + copilot-instructions", color: theme.accent },
  { frame: 108, text: "Added MCP: context7 — docs lookup", color: theme.purple },
  { frame: 122, text: "Added MCP: postgres — database tools", color: theme.purple },
  { frame: 138, text: "Created CALIBER_LEARNINGS.md", color: theme.green },
  { frame: 158, text: "Done — Score: 94/100 Grade A", color: theme.green },
];

const fileTree = [
  { name: "CLAUDE.md", indent: 0, at: 64, badge: "NEW", badgeColor: theme.green },
  { name: ".cursor/", indent: 0, at: 78, badge: null, badgeColor: "" },
  { name: "rules/", indent: 1, at: 78, badge: null, badgeColor: "" },
  { name: "api-patterns.mdc", indent: 2, at: 80, badge: "NEW", badgeColor: theme.green },
  { name: "testing.mdc", indent: 2, at: 84, badge: "NEW", badgeColor: theme.green },
  { name: "security.mdc", indent: 2, at: 88, badge: "NEW", badgeColor: theme.green },
  { name: "AGENTS.md", indent: 0, at: 92, badge: "NEW", badgeColor: theme.green },
  { name: "copilot-instructions.md", indent: 0, at: 96, badge: "NEW", badgeColor: theme.green },
  { name: ".claude/", indent: 0, at: 108, badge: null, badgeColor: "" },
  { name: "settings.local.json", indent: 1, at: 110, badge: "MCP", badgeColor: theme.purple },
  { name: "CALIBER_LEARNINGS.md", indent: 0, at: 138, badge: "NEW", badgeColor: theme.brand2 },
];

export const PlaybooksScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const headerOpacity = interpolate(headerSpring, [0, 1], [0, 1]);

  const scrollOffset = frame > 100
    ? interpolate(frame, [100, 170], [0, -140], { extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 48 }}>
      {/* Title — LP exact */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          fontFamily: theme.fontSans,
          color: theme.text,
          letterSpacing: "-0.02em",
          marginBottom: 8,
          opacity: headerOpacity,
        }}
      >
        Best practices, generated for your codebase.
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 24,
          fontFamily: theme.fontSans,
          color: theme.textMuted,
          marginBottom: 32,
          opacity: headerOpacity,
        }}
      >
        Curated skills, configs, and MCP recommendations from research and the community.
      </div>

      {/* Two-panel layout */}
      <div style={{ display: "flex", gap: 24, width: 1680 }}>
        {/* Terminal */}
        <div
          style={{
            flex: 1,
            backgroundColor: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: 16,
            overflow: "hidden",
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
              $ caliber init
            </span>
          </div>

          <div style={{ padding: "20px 24px", height: 540, overflow: "hidden" }}>
            <div style={{ transform: `translateY(${scrollOffset}px)` }}>
              {buildSteps.map((step, i) => {
                const stepOpacity = interpolate(frame, [step.frame, step.frame + 6], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const isLast = i === buildSteps.length - 1;

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 10,
                      opacity: stepOpacity,
                      fontFamily: theme.fontMono,
                      fontSize: 20,
                      lineHeight: 1.8,
                    }}
                  >
                    <span style={{ color: isLast ? theme.green : theme.textMuted, width: 20, fontSize: 16 }}>
                      {isLast ? "\u2713" : "\u2022"}
                    </span>
                    <span style={{ color: step.color, fontWeight: isLast ? 600 : 400 }}>
                      {step.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* File tree */}
        <div
          style={{
            width: 520,
            backgroundColor: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 20px",
              backgroundColor: theme.surfaceHeader,
              borderBottom: `1px solid ${theme.surfaceBorder}`,
            }}
          >
            <span style={{ color: theme.textMuted, fontSize: 18, fontFamily: theme.fontMono }}>
              Generated Files
            </span>
            <span style={{ fontSize: 16, fontFamily: theme.fontMono, color: theme.brand3, fontWeight: 600 }}>
              {fileTree.filter(f => frame >= f.at && f.badge).length} files
            </span>
          </div>

          <div style={{ padding: "16px 20px" }}>
            {fileTree.map((file, i) => {
              const fileOpacity = interpolate(frame, [file.at, file.at + 5], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const isDir = file.badge === null;

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    paddingLeft: file.indent * 20,
                    marginBottom: 5,
                    opacity: fileOpacity,
                    fontFamily: theme.fontMono,
                    fontSize: 18,
                    lineHeight: 1.9,
                  }}
                >
                  <span style={{ color: isDir ? theme.brand1 : theme.text, fontWeight: isDir ? 600 : 400 }}>
                    {isDir ? (file.name.endsWith("/") ? `\u{1F4C1} ${file.name}` : file.name) : file.name}
                  </span>
                  {file.badge && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: 10,
                        backgroundColor: `${file.badgeColor}12`,
                        color: file.badgeColor,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {file.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Platform compatibility — bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: interpolate(frame, [170, 185], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <span style={{ fontSize: 20, fontFamily: theme.fontSans, color: theme.textMuted, marginRight: 8 }}>
          Works with
        </span>
        {[
          { Icon: ClaudeIcon, color: theme.brand2, label: "Claude Code" },
          { Icon: CursorIcon, color: theme.textSecondary, label: "Cursor" },
          { Icon: CodexIcon, color: theme.textSecondary, label: "Codex" },
          { Icon: CopilotIcon, color: theme.textSecondary, label: "Copilot" },
        ].map((p) => (
          <div
            key={p.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              borderRadius: 24,
              border: `1px solid ${theme.surfaceBorder}`,
              backgroundColor: theme.surface,
            }}
          >
            <p.Icon size={18} color={p.color} />
            <span style={{ fontSize: 18, fontFamily: theme.fontSans, color: theme.textSecondary, fontWeight: 500 }}>
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
