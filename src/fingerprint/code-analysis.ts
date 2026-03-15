import fs from 'fs';
import path from 'path';

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', '.cache',
  '.turbo', 'coverage', '.caliber', '__pycache__', '.venv',
  'venv', 'env', 'vendor', 'target', '.parcel-cache', '.nyc_output',
  '.claude', '.cursor', '.agents', '.codex',
]);

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.py', '.pyw',
  '.go', '.rs', '.rb', '.java', '.kt', '.scala', '.cs',
  '.c', '.cpp', '.h', '.hpp',
  '.swift', '.m',
  '.php', '.lua', '.r', '.jl', '.ex', '.exs', '.erl', '.hs',
  '.sh', '.bash', '.zsh', '.fish',
  '.sql', '.graphql', '.gql', '.prisma',
  '.html', '.css', '.scss', '.sass', '.less', '.svelte', '.vue', '.astro',
  '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.env',
  '.xml', '.plist',
  '.md', '.mdx', '.txt', '.rst',
  '.tf', '.hcl',
  '.proto',
  '.mdc',
]);

const SKIP_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb',
  'Cargo.lock', 'Gemfile.lock', 'poetry.lock', 'composer.lock',
  '.DS_Store', 'Thumbs.db',
]);

const SKIP_PATTERNS = [
  /\.min\.(js|css)$/,
  /\.bundle\.(js|css)$/,
  /\.map$/,
  /\.d\.ts$/,
  /\.generated\./,
  /\.snap$/,
];

// Comment patterns per language family
const COMMENT_LINE_PATTERNS: Record<string, RegExp> = {
  'c-style': /^\s*\/\//, // ts, js, go, rs, java, etc.
  'hash': /^\s*#/,       // py, sh, yaml, tf, etc.
  'html': /^\s*<!--.*-->\s*$/,
};

const EXT_TO_COMMENT_STYLE: Record<string, string> = {
  '.ts': 'c-style', '.tsx': 'c-style', '.js': 'c-style', '.jsx': 'c-style',
  '.mjs': 'c-style', '.cjs': 'c-style',
  '.go': 'c-style', '.rs': 'c-style', '.java': 'c-style', '.kt': 'c-style',
  '.scala': 'c-style', '.cs': 'c-style', '.c': 'c-style', '.cpp': 'c-style',
  '.h': 'c-style', '.hpp': 'c-style', '.swift': 'c-style', '.php': 'c-style',
  '.py': 'hash', '.pyw': 'hash', '.rb': 'hash', '.sh': 'hash',
  '.bash': 'hash', '.zsh': 'hash', '.fish': 'hash', '.r': 'hash',
  '.tf': 'hash', '.hcl': 'hash', '.yaml': 'hash', '.yml': 'hash',
  '.toml': 'hash', '.ini': 'hash', '.cfg': 'hash', '.env': 'hash',
  '.html': 'html', '.xml': 'html', '.svg': 'html', '.vue': 'html',
  '.svelte': 'html',
};

// 180K tokens ≈ 720K chars
const TOKEN_BUDGET = 180_000;
const CHAR_BUDGET = TOKEN_BUDGET * 4;

export interface ProjectFile {
  path: string;
  content: string;
  size: number;
}

export interface CodeAnalysis {
  files: ProjectFile[];
  truncated: boolean;
  totalProjectTokens: number;
  includedTokens: number;
}

/**
 * Compress file content to reduce token usage without losing meaning.
 * - Collapse consecutive blank lines into one
 * - Remove comment-only lines (keep inline comments)
 * - Trim trailing whitespace
 * - Normalize indentation to 2 spaces
 */
function compressContent(content: string, ext: string): string {
  const commentStyle = EXT_TO_COMMENT_STYLE[ext];
  const commentPattern = commentStyle ? COMMENT_LINE_PATTERNS[commentStyle] : null;

  const lines = content.split('\n');
  const result: string[] = [];
  let prevBlank = false;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trimEnd();

    // Track block comments (/* ... */)
    if (!inBlockComment && /^\s*\/\*/.test(trimmed) && !trimmed.includes('*/')) {
      inBlockComment = true;
      continue;
    }
    if (inBlockComment) {
      if (trimmed.includes('*/')) inBlockComment = false;
      continue;
    }
    // Single-line block comments
    if (/^\s*\/\*.*\*\/\s*$/.test(trimmed)) continue;

    // Skip Python/Ruby block docstrings (triple quotes on their own line)
    // Keep them if they're on the same line as code

    // Collapse blank lines
    if (trimmed.length === 0) {
      if (!prevBlank) result.push('');
      prevBlank = true;
      continue;
    }
    prevBlank = false;

    // Skip comment-only lines
    if (commentPattern && commentPattern.test(trimmed)) continue;

    // Normalize indentation: detect leading whitespace and convert to 2-space
    const leadingMatch = line.match(/^(\s*)/);
    if (leadingMatch) {
      const spaces = leadingMatch[1].replace(/\t/g, '    ').length;
      const normalizedIndent = ' '.repeat(Math.floor(spaces / 2) * 2);
      result.push(normalizedIndent + line.trimStart().trimEnd());
    } else {
      result.push(trimmed);
    }
  }

  // Remove trailing blank lines
  while (result.length > 0 && result[result.length - 1] === '') result.pop();

  return result.join('\n');
}

/**
 * Compute a structural fingerprint of a file for deduplication.
 * Files with the same fingerprint have the same "shape" and one can
 * represent the group.
 */
function structuralFingerprint(content: string, ext: string): string {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const lineCount = lines.length;

  // Bucket line count (files of similar size are likely similar)
  const sizeBucket = Math.floor(lineCount / 10) * 10;

  // First meaningful line (often the main import/package declaration)
  const firstLine = lines[0]?.trim().slice(0, 60) || '';

  // Count structural elements
  const imports = lines.filter(l => /^\s*(import |from |require\(|use )/.test(l)).length;
  const exports = lines.filter(l => /^\s*export /.test(l)).length;
  const functions = lines.filter(l => /^\s*(function |def |func |fn |pub fn )/.test(l)).length;

  return `${ext}:${sizeBucket}:${imports}:${exports}:${functions}:${firstLine}`;
}

/**
 * Deduplicate files with similar structure.
 * Returns the representative files with full content, plus a summary
 * of how many similar files were grouped.
 */
function deduplicateFiles(
  files: Array<{ path: string; content: string; ext: string }>,
): ProjectFile[] {
  const groups = new Map<string, Array<{ path: string; content: string }>>();

  for (const f of files) {
    const fp = structuralFingerprint(f.content, f.ext);
    const group = groups.get(fp) || [];
    group.push({ path: f.path, content: f.content });
    groups.set(fp, group);
  }

  const result: ProjectFile[] = [];

  for (const [, group] of groups) {
    // Always include the first file with full content
    const representative = group[0];
    result.push({
      path: representative.path,
      content: representative.content,
      size: representative.content.length,
    });

    // For duplicates, add a compact summary instead of full content
    if (group.length > 1) {
      const similarPaths = group.slice(1).map(f => f.path);
      const summary = `(${similarPaths.length} similar file${similarPaths.length === 1 ? '' : 's'}: ${similarPaths.join(', ')})`;
      result.push({
        path: `[similar to ${representative.path}]`,
        content: summary,
        size: summary.length,
      });
    }
  }

  return result;
}

export function analyzeCode(dir: string): CodeAnalysis {
  const allFiles: string[] = [];
  walkDir(dir, '', 0, 10, allFiles);
  sortByPriority(allFiles);

  // First pass: count total project size (raw)
  let totalChars = 0;
  for (const relPath of allFiles) {
    try {
      const stat = fs.statSync(path.join(dir, relPath));
      totalChars += stat.size;
    } catch { /* skip */ }
  }

  // Second pass: read, compress, and collect files
  const readFiles: Array<{ path: string; content: string; ext: string; rawSize: number }> = [];

  for (const relPath of allFiles) {
    const fullPath = path.join(dir, relPath);
    let rawContent: string;
    try {
      rawContent = fs.readFileSync(fullPath, 'utf-8');
    } catch {
      continue;
    }

    if (rawContent.split('\n').length > 500) continue;

    const ext = path.extname(relPath).toLowerCase();
    const compressed = compressContent(rawContent, ext);

    readFiles.push({
      path: relPath,
      content: compressed,
      ext,
      rawSize: rawContent.length,
    });
  }

  // Third pass: deduplicate similar files
  const deduped = deduplicateFiles(readFiles);

  // Fourth pass: fit into budget
  let includedChars = 0;
  let truncated = false;
  const files: ProjectFile[] = [];

  for (const file of deduped) {
    const entrySize = file.path.length + file.content.length + 10;
    if (includedChars + entrySize > CHAR_BUDGET) {
      truncated = true;
      continue; // try smaller files
    }

    files.push(file);
    includedChars += entrySize;
  }

  return {
    files,
    truncated,
    totalProjectTokens: Math.ceil(totalChars / 4),
    includedTokens: Math.ceil(includedChars / 4),
  };
}

function walkDir(base: string, rel: string, depth: number, maxDepth: number, files: string[]) {
  if (depth > maxDepth) return;
  const fullPath = path.join(base, rel);
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(fullPath, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    if (entry.name.startsWith('.') && depth === 0 && entry.isDirectory()) continue;

    const relPath = rel ? `${rel}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      walkDir(base, relPath, depth + 1, maxDepth, files);
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      if (SKIP_PATTERNS.some(p => p.test(entry.name))) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (TEXT_EXTENSIONS.has(ext) || (depth === 0 && !ext && !entry.name.startsWith('.'))) {
        files.push(relPath);
      }
    }
  }
}

function sortByPriority(files: string[]) {
  const entryPointNames = new Set([
    'index.ts', 'index.js', 'index.tsx', 'index.jsx',
    'main.ts', 'main.py', 'main.go', 'main.rs',
    'app.ts', 'app.js', 'app.py', 'server.ts', 'server.js',
    'mod.rs', 'lib.rs',
  ]);

  const configPattern = /\.(json|ya?ml|toml|ini|cfg|env)$|config\.|Makefile|Dockerfile/i;
  const routePattern = /(route|api|controller|endpoint|handler)/i;
  const schemaPattern = /(types|schema|models|entities|migration)/i;
  const servicePattern = /(service|lib|utils|helper|middleware)/i;
  const testPattern = /(test|spec|__tests__|_test\.|\.test\.)/i;

  function priority(filePath: string): number {
    const base = path.basename(filePath);
    if (entryPointNames.has(base)) return 0;
    if (configPattern.test(filePath)) return 1;
    if (routePattern.test(filePath)) return 2;
    if (schemaPattern.test(filePath)) return 3;
    if (servicePattern.test(filePath)) return 4;
    if (testPattern.test(filePath)) return 6;
    return 5;
  }

  files.sort((a, b) => priority(a) - priority(b));
}
