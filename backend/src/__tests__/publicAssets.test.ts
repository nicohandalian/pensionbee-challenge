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
const publicDir = path.join(fixturesDir, 'public');

describe('public static assets', () => {
  it('serves hand-written static assets like styles.css at the root path', async () => {
    const app = createApp({ contentService, templatePath, publicDir });

    const response = await request(app).get('/styles.css');

    expect(response.status).toBe(200);
    expect(response.text).toContain('fixture stylesheet');
  });

  it('still renders content routes correctly when a publicDir is configured', async () => {
    const app = createApp({ contentService, templatePath, publicDir });

    const response = await request(app).get('/about');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1>About</h1>');
  });

  it('renders content routes correctly when no publicDir is configured', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/about');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1>About</h1>');
  });
});
