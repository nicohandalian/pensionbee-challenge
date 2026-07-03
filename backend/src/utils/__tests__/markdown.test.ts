import { describe, expect, it } from 'vitest';
import { parseMarkdown } from '../markdown.js';

describe('parseMarkdown', () => {
  it('converts a heading to HTML', () => {
    expect(parseMarkdown('# Hello')).toContain('<h1>Hello</h1>');
  });

  it('converts a paragraph to HTML', () => {
    expect(parseMarkdown('Just a paragraph.')).toContain(
      '<p>Just a paragraph.</p>',
    );
  });

  it('converts markdown lists to HTML', () => {
    const html = parseMarkdown('- one\n- two');

    expect(html).toContain('<ul>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<li>two</li>');
  });
});
