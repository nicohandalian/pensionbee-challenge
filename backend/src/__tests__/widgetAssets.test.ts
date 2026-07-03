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
const widgetAssetsDir = path.join(fixturesDir, 'widget-assets');

describe('widget assets', () => {
  it('serves the built site-shell bundle under /assets', async () => {
    const app = createApp({ contentService, templatePath, widgetAssetsDir });

    const response = await request(app).get('/assets/site-shell.js');

    expect(response.status).toBe(200);
    expect(response.text).toContain('export {}');
  });

  it('returns 404 for an asset that does not exist', async () => {
    const app = createApp({ contentService, templatePath, widgetAssetsDir });

    const response = await request(app).get('/assets/does-not-exist.js');

    expect(response.status).toBe(404);
  });

  it('still renders content routes correctly when widget assets are configured', async () => {
    const app = createApp({ contentService, templatePath, widgetAssetsDir });

    const response = await request(app).get('/about');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1>About</h1>');
  });

  it('renders content routes correctly when no widget assets are configured', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/about');

    expect(response.status).toBe(200);
    expect(response.text).toContain('<h1>About</h1>');
  });
});
