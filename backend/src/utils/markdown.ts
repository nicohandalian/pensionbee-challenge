import { marked } from 'marked';

/**
 * Converts a markdown string to an HTML string. Pure conversion only —
 * no filesystem or template concerns live here.
 */
export function parseMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false });
}
