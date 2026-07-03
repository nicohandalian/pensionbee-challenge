import { createRoot } from 'react-dom/client';
import { SiteShell } from './components/SiteShell';

// Id must match the placeholder div in backend/src/templates/template.html
const container = document.getElementById('site-shell-root');

if (container) {
  createRoot(container).render(<SiteShell />);
}
