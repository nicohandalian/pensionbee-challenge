import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { SiteShell } from './SiteShell';

describe('SiteShell', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders the Acme Co branding', () => {
    render(<SiteShell />);

    expect(screen.getByRole('link', { name: 'Acme Co' })).toBeInTheDocument();
  });

  it('renders the nav links', () => {
    render(<SiteShell />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/about-page',
    );
    expect(screen.getByRole('link', { name: 'Jobs' })).toHaveAttribute(
      'href',
      '/jobs',
    );
    expect(screen.getByRole('link', { name: 'Valves' })).toHaveAttribute(
      'href',
      '/valves',
    );
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'href',
      '/blog',
    );
  });

  it('starts with the mobile menu collapsed', () => {
    render(<SiteShell />);

    expect(
      screen.getByRole('button', { name: 'Toggle navigation' }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('marks Home as active at the root path, not on other pages', () => {
    window.history.pushState({}, '', '/');
    render(<SiteShell />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks the current page link as active via aria-current', () => {
    window.history.pushState({}, '', '/jobs');
    render(<SiteShell />);

    expect(screen.getByRole('link', { name: 'Jobs' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('treats sub-pages as active for their parent nav link', () => {
    window.history.pushState({}, '', '/blog/june');
    render(<SiteShell />);

    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('expands and collapses the mobile menu when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<SiteShell />);

    const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
    const nav = screen.getByRole('navigation');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(nav).toHaveAttribute('data-open', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(nav).toHaveAttribute('data-open', 'false');
  });
});
