import path from 'path';
import { describe, expect, it } from 'vitest';
import { ContentNotFoundError, ContentService } from '../contentService.js';

// Shared with the other backend integration tests rather than duplicated —
// see backend/src/__tests__/fixtures/content.
const fixturesDir = path.join(
  import.meta.dirname,
  '..',
  '..',
  '__tests__',
  'fixtures',
  'content',
);

describe('ContentService', () => {
  const service = new ContentService({ contentDir: fixturesDir });

  it('resolves the root route to content/index.md', async () => {
    const result = await service.getContent('/');

    expect(result.html).toContain('<h1>Home</h1>');
    expect(result.path).toBe(path.join(fixturesDir, 'index.md'));
  });

  it('resolves a top-level route', async () => {
    const result = await service.getContent('/about');

    expect(result.html).toContain('<h1>About</h1>');
    expect(result.path).toBe(path.join(fixturesDir, 'about', 'index.md'));
  });

  it('resolves a deeply nested route', async () => {
    const result = await service.getContent('/blog/june/company-update');

    expect(result.html).toContain('<h1>Company Update</h1>');
    expect(result.path).toBe(
      path.join(fixturesDir, 'blog', 'june', 'company-update', 'index.md'),
    );
  });

  it('ignores trailing slashes', async () => {
    const result = await service.getContent('/about/');

    expect(result.html).toContain('<h1>About</h1>');
  });

  it('throws ContentNotFoundError for an unknown route', async () => {
    await expect(service.getContent('/does-not-exist')).rejects.toBeInstanceOf(
      ContentNotFoundError,
    );
  });

  // Path traversal itself is covered at the unit level (fileSystem.test.ts)
  // and at the HTTP level (content.test.ts) — no need to repeat it here too.
});
