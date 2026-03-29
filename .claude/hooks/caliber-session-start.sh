#!/bin/sh
# Caliber: nudge agent to offer setup when pre-commit hook is missing
if grep -q "caliber" .git/hooks/pre-commit 2>/dev/null; then
  exit 0
fi
printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"This project uses Caliber — a tool that keeps AI agent configs (CLAUDE.md, Cursor rules, Copilot instructions) in sync with your codebase automatically. The pre-commit sync hook is not installed on this machine yet. Ask the user: Would you like me to set up Caliber sync? It takes about 30 seconds and ensures your agent configs stay current on every commit. If they agree, run /setup-caliber."}}'
