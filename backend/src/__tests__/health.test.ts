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

describe('GET /health', () => {
  it('returns ok', async () => {
    const app = createApp({ contentService, templatePath });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
