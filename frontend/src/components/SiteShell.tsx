import { useState } from 'react';

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about-page' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Valves', href: '/valves' },
  { label: 'Blog', href: '/blog' },
];

/** Matches a link's own page and its sub-pages; `/` only matches itself. */
function isActiveLink(href: string, pathname: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Site-wide nav shell: branding + nav links + mobile menu toggle. A
 * progressive-enhancement widget, not the content renderer.
 *
 * template.html has a static copy of this markup so the header is visible
 * before this script loads; site-shell-entry.tsx mounts this over it. Keep
 * the two in sync.
 */
export function SiteShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Read once: every navigation is a full page load, so this can't change
  // without a re-mount.
  const pathname = window.location.pathname;

  return (
    <header className="site-shell">
      <div className="site-shell__bar">
        <a className="site-shell__brand" href="/">
          Acme Co
        </a>
        {/* Comes before <nav> so it stays on row 1 when nav wraps on mobile. */}
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
        <nav id="site-nav" className="site-shell__nav" data-open={isMenuOpen}>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={
                    isActiveLink(link.href, pathname) ? 'page' : undefined
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
