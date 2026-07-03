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

/**
 * Highlights a link for both its exact page and any of its sub-pages (e.g.
 * `/blog` stays active on `/blog/june`), while `/` only matches the home
 * page itself — otherwise every route would count as "under" it.
 */
function isActiveLink(href: string, pathname: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Site-wide nav shell: Acme Co branding + nav links + a mobile menu toggle.
 * This is a progressive-enhancement widget, not the content renderer — it
 * mounts on top of server-rendered pages and never gates their content.
 *
 * template.html has an equivalent static version of this markup so the
 * header is visible immediately, before this script even loads — see
 * frontend/src/site-shell-entry.tsx, which mounts this over it.
 */
export function SiteShell() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Every navigation is a full page load (no client router), so the current
  // path is read once at mount time — it can't change without a re-mount.
  const pathname = window.location.pathname;

  return (
    <header className="site-shell">
      <div className="site-shell__bar">
        <a className="site-shell__brand" href="/">
          Acme Co
        </a>
        {/* Toggle comes before the nav it controls so, once the nav wraps
            onto its own row via flex-basis on mobile, the toggle still
            shares row 1 with the brand instead of being pushed down too. */}
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
