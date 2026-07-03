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

describe('content routes', () => {
  it('renders content/index.md for the root route, wrapped in the template', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('<main>');
    expect(response.text).toContain('<h1>Home</h1>');
  });

  it('renders a nested route', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/about');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1>About</h1>');
  });

  it('renders a deeply nested route, e.g. /blog/june/company-update', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/blog/june/company-update');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1>Company Update</h1>');
  });

  it('resolves routes with a trailing slash the same as without', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/about/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1>About</h1>');
  });

  it('returns 404 for a path traversal attempt instead of leaking files', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/../../../etc/passwd');

    expect(response.status).toBe(404);
  });

  it('renders a custom content/404/index.md for unknown routes, like any other page', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.text).toContain('<h1>Custom Not Found</h1>');
  });

  it('falls back to a minimal 404 page when content/404/index.md does not exist', async () => {
    const contentServiceWithoutCustom404 = new ContentService({
      contentDir: path.join(fixturesDir, 'content-without-404'),
    });
    const app = createApp({
      contentService: contentServiceWithoutCustom404,
      templatePath,
    });

    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.text).toContain('<h1>Not Found</h1>');
  });
});
