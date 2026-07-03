import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SiteShell } from './SiteShell';

describe('SiteShell', () => {
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
      '/about',
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
