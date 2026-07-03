import { readFile } from 'fs/promises';
import express, { type Express, type NextFunction } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
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

async function sendPage(
  res: express.Response,
  status: number,
  templatePath: string,
  html: string,
): Promise<void> {
  const template = await loadTemplate(templatePath);

  res.status(status).type('html').send(renderTemplate(template, html));
}

// Content-driven like any other route; falls back to a minimal message if
// content/404/index.md doesn't exist (e.g. isolated test fixtures).
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

// Static and dependency-free — this runs when something's already gone wrong.
function getServerErrorHtml(): string {
  return '<h1>Something went wrong</h1><p>Please try again in a moment.</p>';
}

export function createApp({
  contentService,
  templatePath,
  widgetAssetsDir,
  publicDir,
}: CreateAppOptions): Express {
  const app = express();

  // Realistic hosting targets (Render, Fly, Railway, ...) sit behind a
  // reverse proxy, so Express needs this to see the real client IP.
  app.set('trust proxy', 1);

  // Default CSP already allows everything the app loads (inline favicon,
  // Google Fonts) — nothing to customize.
  app.use(helmet());

  app.use(compression());

  // Quiet in tests (vitest sets NODE_ENV=test) so `npm test` output stays clean.
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Registered before the catch-all so assets don't fall through to
  // ContentService; keep paths in sync with template.html's <link>/<script>.
  if (publicDir) {
    app.use(express.static(publicDir));
  }

  if (widgetAssetsDir) {
    app.use('/assets', express.static(widgetAssetsDir));
  }

  app.get('/{*splat}', async (req, res, next) => {
    try {
      const result = await contentService.getContent(req.path);

      await sendPage(res, 200, templatePath, result.html);
    } catch (error) {
      if (error instanceof ContentNotFoundError) {
        try {
          const notFoundHtml = await getNotFoundHtml(contentService);

          await sendPage(res, 404, templatePath, notFoundHtml);
        } catch (templateError) {
          next(templateError);
        }

        return;
      }

      next(error);
    }
  });

  // Safety net for anything unexpected — a branded page instead of a
  // leaked stack trace or Express's default error page.
  app.use(
    async (
      error: unknown,
      req: express.Request,
      res: express.Response,
      next: NextFunction,
    ) => {
      console.error(`Unhandled error rendering ${req.path}:`, error);

      if (res.headersSent) {
        next(error);
        return;
      }

      try {
        await sendPage(res, 500, templatePath, getServerErrorHtml());
      } catch {
        res.status(500).type('html').send(getServerErrorHtml());
      }
    },
  );

  return app;
}
