import { useState } from 'react';

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
];

/**
 * Site-wide nav shell: Acme Co branding + nav links + a mobile menu toggle.
 * This is a progressive-enhancement widget, not the content renderer — it
 * mounts on top of server-rendered pages and never gates their content.
 */
export function SiteShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-shell">
      <div className="site-shell__bar">
        <a className="site-shell__brand" href="/">
          Acme Co
        </a>
        <button
          type="button"
          className="site-shell__toggle"
          aria-expanded={isMenuOpen}
          aria-controls="site-nav"
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{isMenuOpen ? '✕' : '☰'}</span>
        </button>
      </div>
      <nav id="site-nav" className="site-shell__nav" data-open={isMenuOpen}>
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
