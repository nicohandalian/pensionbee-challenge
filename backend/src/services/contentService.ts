import {
  normalizeRoute,
  readFileIfExists,
  resolveContentPath,
} from '../utils/fileSystem.js';
import { parseMarkdown } from '../utils/markdown.js';

export type ContentResult = {
  html: string;
  path: string;
};

export class ContentNotFoundError extends Error {
  constructor(message = 'Content not found') {
    super(message);
    this.name = 'ContentNotFoundError';
  }
}

export type ContentServiceOptions = {
  contentDir: string;
};

/**
 * Resolves a route to a markdown file on disk and converts it to HTML.
 * Knows nothing about HTTP or templates — callers get back HTML or a
 * `ContentNotFoundError`.
 */
export class ContentService {
  private readonly contentDir: string;

  constructor(options: ContentServiceOptions) {
    this.contentDir = options.contentDir;
  }

  async getContent(route: string): Promise<ContentResult> {
    const segments = normalizeRoute(route);

    if (segments === null) {
      throw new ContentNotFoundError();
    }

    const filePath = resolveContentPath(this.contentDir, segments);

    if (!filePath) {
      throw new ContentNotFoundError();
    }

    const markdown = await readFileIfExists(filePath);

    if (markdown === null) {
      throw new ContentNotFoundError();
    }

    return {
      html: parseMarkdown(markdown),
      path: filePath,
    };
  }
}
