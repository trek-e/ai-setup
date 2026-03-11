import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

interface PackageInfo {
  name?: string;
  languages: string[];
}

const WORKSPACE_GLOBS = [
  'apps/*/package.json',
  'packages/*/package.json',
  'services/*/package.json',
  'libs/*/package.json',
];

export function analyzePackageJson(dir: string): PackageInfo {
  const rootPkgPath = path.join(dir, 'package.json');
  let name: string | undefined;
  const languages: string[] = [];

  if (fs.existsSync(rootPkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf-8'));
      name = pkg.name;
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (allDeps.typescript || allDeps['@types/node']) {
        languages.push('TypeScript');
      }
      languages.push('JavaScript');
    } catch {}
  }

  for (const glob of WORKSPACE_GLOBS) {
    const matches = globSync(glob, { cwd: dir, absolute: true });
    for (const pkgPath of matches) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps.typescript || deps['@types/node']) {
          languages.push('TypeScript');
        }
      } catch {}
    }
  }

  return {
    name,
    languages: [...new Set(languages)],
  };
}
