import { mkdtemp, mkdir, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  normalizeRoute,
  readFileIfExists,
  resolveContentPath,
} from '../fileSystem.js';

describe('normalizeRoute', () => {
  it('returns an empty array for the root route', () => {
    expect(normalizeRoute('/')).toEqual([]);
  });

  it('splits a simple route into segments', () => {
    expect(normalizeRoute('/about')).toEqual(['about']);
  });

  it('splits a nested route into segments', () => {
    expect(normalizeRoute('/blog/june/company-update')).toEqual([
      'blog',
      'june',
      'company-update',
    ]);
  });

  it('ignores a trailing slash', () => {
    expect(normalizeRoute('/about/')).toEqual(['about']);
  });

  it('ignores duplicate slashes', () => {
    expect(normalizeRoute('//about//team//')).toEqual(['about', 'team']);
  });

  it('rejects a route containing ".."', () => {
    expect(normalizeRoute('/../etc/passwd')).toBeNull();
  });

  it('rejects a route containing ".." in the middle', () => {
    expect(normalizeRoute('/about/../../secret')).toBeNull();
  });

  it('rejects a route containing a bare "." segment', () => {
    expect(normalizeRoute('/about/./team')).toBeNull();
  });
});

describe('resolveContentPath', () => {
  const contentDir = '/content';

  it('resolves the root segments to the content dir index file', () => {
    expect(resolveContentPath(contentDir, [])).toBe(
      path.resolve('/content/index.md'),
    );
  });

  it('resolves single segment routes', () => {
    expect(resolveContentPath(contentDir, ['about'])).toBe(
      path.resolve('/content/about/index.md'),
    );
  });

  it('resolves nested segment routes', () => {
    expect(
      resolveContentPath(contentDir, ['blog', 'june', 'company-update']),
    ).toBe(path.resolve('/content/blog/june/company-update/index.md'));
  });

  it('returns null when the resolved path would escape the content dir', () => {
    expect(
      resolveContentPath(contentDir, ['..', '..', 'etc', 'passwd']),
    ).toBeNull();
  });
});

describe('readFileIfExists', () => {
  let dir: string;

  beforeAll(async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'content-fs-test-'));
    await writeFile(path.join(dir, 'index.md'), '# Hello');
    await mkdir(path.join(dir, 'a-directory'));
  });

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('returns file contents when the file exists', async () => {
    await expect(readFileIfExists(path.join(dir, 'index.md'))).resolves.toBe(
      '# Hello',
    );
  });

  it('returns null when the file does not exist', async () => {
    await expect(
      readFileIfExists(path.join(dir, 'missing.md')),
    ).resolves.toBeNull();
  });

  it('returns null when the path is a directory, not a file', async () => {
    await expect(
      readFileIfExists(path.join(dir, 'a-directory')),
    ).resolves.toBeNull();
  });
});
