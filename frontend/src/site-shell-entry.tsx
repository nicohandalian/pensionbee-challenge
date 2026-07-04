import { createRoot } from 'react-dom/client';
import { SiteShell } from './components/SiteShell';

// Mounts over the static header already in template.html (visible on first
// paint) to add interactivity. Id must match that container.
const container = document.getElementById('site-shell-root');

if (container) {
  createRoot(container).render(<SiteShell />);
}
