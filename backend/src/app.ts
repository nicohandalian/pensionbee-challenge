import { readFile } from 'fs/promises';
import express, { type Express } from 'express';
import {
  ContentNotFoundError,
  type ContentService,
} from './services/contentService.js';

export type CreateAppOptions = {
  contentService: ContentService;
  templatePath: string;
  /** Directory of the built site-shell widget assets, served under /assets. */
  widgetAssetsDir?: string;
  /** Directory of hand-written static assets (e.g. styles.css), served at the root path. */
  publicDir?: string;
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

// The 404 page is content-driven too, like any other route: marketing can
// customize it by adding content/404/index.md, no code changes needed.
// Falls back to a minimal message if that file doesn't exist (e.g. in
// isolated test fixtures that don't ship a 404 page).
async function getNotFoundHtml(
  contentService: ContentService,
): Promise<string> {
  try {
    const notFound = await contentService.getContent('/404');

    return notFound.html;
  } catch {
    return '<h1>Not Found</h1>';
  }
}

export function createApp({
  contentService,
  templatePath,
  widgetAssetsDir,
  publicDir,
}: CreateAppOptions): Express {
  const app = express();

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Both registered before the content catch-all so asset requests are
  // served directly and never fall through to ContentService's markdown
  // resolver. If you rename either mount path, also update the matching
  // <link>/<script> tag in backend/src/templates/template.html.
  if (publicDir) {
    app.use(express.static(publicDir));
  }

  if (widgetAssetsDir) {
    app.use('/assets', express.static(widgetAssetsDir));
  }

  app.get('/{*splat}', async (req, res, next) => {
    try {
      const result = await contentService.getContent(req.path);
      const template = await loadTemplate(templatePath);

      res.type('html').send(renderTemplate(template, result.html));
    } catch (error) {
      if (error instanceof ContentNotFoundError) {
        try {
          const template = await loadTemplate(templatePath);
          const notFoundHtml = await getNotFoundHtml(contentService);

          res
            .status(404)
            .type('html')
            .send(renderTemplate(template, notFoundHtml));
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
