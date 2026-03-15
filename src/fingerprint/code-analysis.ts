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

export function analyzeCode(dir: string): CodeAnalysis {
  const allFiles: string[] = [];
  walkDir(dir, '', 0, 10, allFiles);
  sortByPriority(allFiles);

  let totalChars = 0;
  let includedChars = 0;
  let truncated = false;
  const files: ProjectFile[] = [];

  // First pass: count total project size
  const fileSizes = new Map<string, number>();
  for (const relPath of allFiles) {
    try {
      const stat = fs.statSync(path.join(dir, relPath));
      fileSizes.set(relPath, stat.size);
      totalChars += stat.size;
    } catch { /* skip */ }
  }

  // Second pass: include files until budget is reached
  for (const relPath of allFiles) {
    const fullPath = path.join(dir, relPath);
    let content: string;
    try {
      content = fs.readFileSync(fullPath, 'utf-8');
    } catch {
      continue;
    }

    // Skip files over 500 lines (likely generated or data files)
    if (content.split('\n').length > 500) continue;

    const entrySize = relPath.length + content.length + 10; // overhead for formatting
    if (includedChars + entrySize > CHAR_BUDGET) {
      truncated = true;
      continue; // try smaller files
    }

    files.push({ path: relPath, content, size: content.length });
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
      // Include known text extensions, plus extensionless files in root (Makefile, Dockerfile, etc.)
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
