import { createRoot } from 'react-dom/client';
import { SiteShell } from './components/SiteShell';

// The header already exists as static HTML in
// backend/src/templates/template.html (so it's visible on first paint, with
// no flash while this script loads). React then takes over that same
// container to add interactivity (mobile toggle, active-link highlight).
// Since SiteShell renders markup equivalent to the static version, swapping
// it in is visually a no-op. Id must match the container in template.html.
const container = document.getElementById('site-shell-root');

if (container) {
  createRoot(container).render(<SiteShell />);
}
