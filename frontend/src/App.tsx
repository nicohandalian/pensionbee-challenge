import { SiteShell } from './components/SiteShell';

/**
 * Standalone harness for developing `SiteShell` in isolation with Vite's
 * dev server + HMR (`npm run dev:widget-preview`). Not part of the shipped
 * app — the real site is rendered by the backend; see
 * frontend/src/site-shell-entry.tsx for the widget's actual mount point.
 */
export function App() {
  return (
    <>
      <SiteShell />
      <main>
        <h1>SiteShell preview</h1>
        <p>
          This page only exists to preview the widget with hot-reload. The real
          app is served by the backend at http://localhost:3000.
        </p>
      </main>
    </>
  );
}
