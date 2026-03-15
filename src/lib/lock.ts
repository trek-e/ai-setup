import fs from 'fs';
import path from 'path';
import os from 'os';

const LOCK_FILE = path.join(os.tmpdir(), '.caliber.lock');
const STALE_MS = 10 * 60 * 1000; // 10 minutes — treat lock as stale after this

/**
 * Check if another caliber process is actively running.
 * Used by hook commands (refresh --quiet, learn finalize) to bail early
 * when Claude Code fires SessionEnd hooks mid-session.
 */
export function isCaliberRunning(): boolean {
  try {
    if (!fs.existsSync(LOCK_FILE)) return false;
    const raw = fs.readFileSync(LOCK_FILE, 'utf-8').trim();
    const { pid, ts } = JSON.parse(raw);

    // Stale lock — ignore
    if (Date.now() - ts > STALE_MS) return false;

    // Check if PID is still alive
    try {
      process.kill(pid, 0); // signal 0 = existence check only
      return true;
    } catch {
      return false; // process gone
    }
  } catch {
    return false;
  }
}

/** Write a lock file for the current process. */
export function acquireLock(): void {
  try {
    fs.writeFileSync(LOCK_FILE, JSON.stringify({ pid: process.pid, ts: Date.now() }));
  } catch {
    // best-effort
  }
}

/** Remove the lock file. */
export function releaseLock(): void {
  try {
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  } catch {
    // best-effort
  }
}
