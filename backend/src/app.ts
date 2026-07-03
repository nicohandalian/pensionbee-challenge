import { readFile } from 'fs/promises';
import express, { type Express } from 'express';
import {
  ContentNotFoundError,
  type ContentService,
} from './services/contentService.js';

export type CreateAppOptions = {
  contentService: ContentService;
  templatePath: string;
};

const templateCache = new Map<string, string>();

async function loadTemplate(templatePath: string): Promise<string> {
  const cached = templateCache.get(templatePath);

  if (cached) {
    return cached;
  }

  const template = await readFile(templatePath, 'utf-8');
  templateCache.set(templatePath, template);

  return template;
}

function renderTemplate(template: string, content: string): string {
  return template.replace('{{content}}', content);
}

export function createApp({
  contentService,
  templatePath,
}: CreateAppOptions): Express {
  const app = express();

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/{*splat}', async (req, res, next) => {
    try {
      const result = await contentService.getContent(req.path);
      const template = await loadTemplate(templatePath);

      res.type('html').send(renderTemplate(template, result.html));
    } catch (error) {
      if (error instanceof ContentNotFoundError) {
        try {
          const template = await loadTemplate(templatePath);

          res
            .status(404)
            .type('html')
            .send(renderTemplate(template, 'Not Found'));
        } catch (templateError) {
          next(templateError);
        }

        return;
      }

      next(error);
    }
  });

  return app;
}
