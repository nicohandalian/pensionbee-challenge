import path from 'path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { ContentService } from '../services/contentService.js';

const fixturesDir = path.join(import.meta.dirname, 'fixtures');
const contentService = new ContentService({
  contentDir: path.join(fixturesDir, 'content'),
});
const templatePath = path.join(fixturesDir, 'template.html');

describe('security headers', () => {
  it('sets helmet security headers on content responses', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['content-security-policy']).toBeDefined();
    expect(response.headers['strict-transport-security']).toBeDefined();
  });

  it('sets helmet security headers on 404 responses too', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/does-not-exist');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});

describe('compression', () => {
  it('gzips responses above the size threshold when the client supports it', async () => {
    // Generated in-memory so the test depends only on compression's size
    // threshold, not the byte size of some unrelated fixture file.
    const largeContentService = {
      getContent: async () => ({
        html: `<p>${'padding '.repeat(500)}</p>`,
        path: 'fake',
      }),
    } as unknown as ContentService;
    const app = createApp({
      contentService: largeContentService,
      templatePath,
    });

    const response = await request(app)
      .get('/large')
      .set('Accept-Encoding', 'gzip');

    expect(response.headers['content-encoding']).toBe('gzip');
  });
});

describe('unexpected errors', () => {
  it('returns a generic branded 500 page instead of leaking error details', async () => {
    const brokenContentService = {
      getContent: async () => {
        throw new Error('disk exploded');
      },
    } as unknown as ContentService;
    const app = createApp({
      contentService: brokenContentService,
      templatePath,
    });

    const response = await request(app).get('/');

    expect(response.status).toBe(500);
    expect(response.text).toContain('Something went wrong');
    expect(response.text).not.toContain('disk exploded');
  });
});
