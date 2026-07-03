import { readFile, stat } from 'fs/promises';
import path from 'path';

/**
 * Splits a route into path segments, rejecting anything that looks like
 * path traversal (`.` or `..`). Leading/trailing/duplicate slashes are
 * normalized away, so `/about/`, `/about`, and `about` all resolve the same.
 *
 * Returns `null` when the route is invalid (e.g. contains `..`).
 */
export function normalizeRoute(route: string): string[] | null {
  const trimmed = route.replace(/^\/+|\/+$/g, '');

  if (trimmed === '') {
    return [];
  }

  const segments = trimmed.split('/').filter(Boolean);

  for (const segment of segments) {
    if (segment === '.' || segment === '..') {
      return null;
    }
  }

  return segments;
}

/**
 * Resolves route segments to an absolute `index.md` path inside `contentDir`.
 *
 * Returns `null` if the resolved path would escape `contentDir` (defense in
 * depth on top of `normalizeRoute`'s `.`/`..` rejection).
 */
export function resolveContentPath(
  contentDir: string,
  segments: string[],
): string | null {
  const root = path.resolve(contentDir);
  const resolved = path.resolve(root, ...segments, 'index.md');

  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    return null;
  }

  return resolved;
}

/**
 * Reads a file if it exists and is a regular file, otherwise returns `null`.
 */
export async function readFileIfExists(
  filePath: string,
): Promise<string | null> {
  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return null;
    }

    return await readFile(filePath, 'utf-8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}
