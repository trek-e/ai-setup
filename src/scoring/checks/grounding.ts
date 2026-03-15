import { join } from 'path';
import type { Check } from '../index.js';
import {
  POINTS_PROJECT_GROUNDING,
  POINTS_REFERENCE_DENSITY,
  GROUNDING_THRESHOLDS,
} from '../constants.js';
import {
  collectAllConfigContent,
  collectProjectStructure,
  extractReferences,
  analyzeMarkdownStructure,
} from '../utils.js';

export function checkGrounding(dir: string): Check[] {
  const checks: Check[] = [];

  const configContent = collectAllConfigContent(dir);
  const configLower = configContent.toLowerCase();
  const projectStructure = collectProjectStructure(dir);

  // 1. Project grounding — does the config reference real project dirs/files?
  const allProjectEntries = [
    ...projectStructure.dirs,
    ...projectStructure.files,
  ];

  // Filter to meaningful entries (skip very short names that could false-match)
  const meaningfulEntries = allProjectEntries.filter(e => e.length > 2);

  const mentioned: string[] = [];
  const notMentioned: string[] = [];

  for (const entry of meaningfulEntries) {
    const entryLower = entry.toLowerCase();
    // Check if the config mentions this entry using word-boundary matching
    // to avoid false positives (e.g., "src" matching "describe")
    const variants = [
      entryLower,
      entryLower.replace(/\\/g, '/'),
    ];
    const lastSegment = entry.split('/').pop()?.toLowerCase();
    if (lastSegment && lastSegment.length > 3) {
      variants.push(lastSegment);
    }

    const ismentioned = variants.some(v => {
      const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?:^|[\\s\`/"'\\.,(])${escaped}(?:[\\s\`/"'.,;:!?)\\\\]|$)`, 'i').test(configLower);
    });

    if (ismentioned) {
      mentioned.push(entry);
    } else {
      notMentioned.push(entry);
    }
  }

  const groundingRatio = meaningfulEntries.length > 0
    ? mentioned.length / meaningfulEntries.length
    : 0;

  const groundingThreshold = GROUNDING_THRESHOLDS.find(t => groundingRatio >= t.minRatio);
  const groundingPoints = meaningfulEntries.length === 0
    ? 0
    : groundingThreshold?.points ?? 0;

  // Top unmentioned dirs (most useful for the LLM fix)
  const topDirs = projectStructure.dirs
    .filter(d => !d.includes('/')) // top-level only
    .filter(d => d.length > 2);
  const matchesConfig = (name: string): boolean => {
    const escaped = name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[\\s\`/"'\\.,(])${escaped}(?:[\\s\`/"'.,;:!?)\\\\]|$)`, 'i').test(configLower);
  };

  const unmentionedTopDirs = topDirs.filter(d => !matchesConfig(d));
  const mentionedTopDirs = topDirs.filter(d => matchesConfig(d));

  checks.push({
    id: 'project_grounding',
    name: 'Project grounding',
    category: 'grounding',
    maxPoints: POINTS_PROJECT_GROUNDING,
    earnedPoints: groundingPoints,
    passed: groundingRatio >= 0.2,
    detail: meaningfulEntries.length === 0
      ? 'No project structure detected'
      : `${mentioned.length}/${meaningfulEntries.length} project entries referenced in config (${Math.round(groundingRatio * 100)}%)`,
    suggestion: unmentionedTopDirs.length > 0
      ? `Config doesn't mention: ${unmentionedTopDirs.slice(0, 5).join(', ')}${unmentionedTopDirs.length > 5 ? ` (+${unmentionedTopDirs.length - 5} more)` : ''}`
      : undefined,
    fix: groundingPoints < POINTS_PROJECT_GROUNDING
      ? {
          action: 'add_references',
          data: {
            missing: unmentionedTopDirs.slice(0, 10),
            mentioned: mentionedTopDirs.slice(0, 10),
            totalEntries: meaningfulEntries.length,
            coverage: Math.round(groundingRatio * 100),
          },
          instruction: `Reference these project directories in your config: ${unmentionedTopDirs.slice(0, 5).join(', ')}`,
        }
      : undefined,
  });

  // 2. Reference density — how many specific references (backticks, paths) does the config have?
  const refs = extractReferences(configContent);
  const mdStructure = analyzeMarkdownStructure(configContent);
  const totalSpecificRefs = refs.length + mdStructure.inlineCodeCount;

  // Density: specific references per 100 lines of config
  const density = mdStructure.nonEmptyLines > 0
    ? (totalSpecificRefs / mdStructure.nonEmptyLines) * 100
    : 0;

  // Scale: 0 refs = 0pts, increasing density = more points
  let densityPoints = 0;
  if (configContent.length === 0) {
    densityPoints = 0;
  } else if (density >= 40) {
    densityPoints = POINTS_REFERENCE_DENSITY;
  } else if (density >= 25) {
    densityPoints = Math.round(POINTS_REFERENCE_DENSITY * 0.75);
  } else if (density >= 15) {
    densityPoints = Math.round(POINTS_REFERENCE_DENSITY * 0.5);
  } else if (density >= 5) {
    densityPoints = Math.round(POINTS_REFERENCE_DENSITY * 0.25);
  }

  checks.push({
    id: 'reference_density',
    name: 'Reference density',
    category: 'grounding',
    maxPoints: POINTS_REFERENCE_DENSITY,
    earnedPoints: densityPoints,
    passed: densityPoints >= Math.round(POINTS_REFERENCE_DENSITY * 0.5),
    detail: configContent.length === 0
      ? 'No config content'
      : `${totalSpecificRefs} specific references across ${mdStructure.nonEmptyLines} lines (${Math.round(density)}%)`,
    suggestion: densityPoints < Math.round(POINTS_REFERENCE_DENSITY * 0.5) && configContent.length > 0
      ? 'Use backticks and paths to reference specific files, commands, and identifiers'
      : undefined,
    fix: densityPoints < Math.round(POINTS_REFERENCE_DENSITY * 0.5) && configContent.length > 0
      ? {
          action: 'add_inline_refs',
          data: { currentDensity: Math.round(density), currentRefs: totalSpecificRefs, lines: mdStructure.nonEmptyLines },
          instruction: 'Add more inline code references (backticks) for file paths, commands, and identifiers.',
        }
      : undefined,
  });

  return checks;
}
