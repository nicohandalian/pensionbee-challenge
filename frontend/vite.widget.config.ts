import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Builds the site-shell as a standalone widget bundle that Express serves
 * as a static asset and mounts client-side via a <script type="module">
 * tag — separate from the default app build (frontend/dist), which is only
 * used for local component development/preview.
 *
 * The output filename is fixed (no content hash) so the backend template
 * can reference it by a stable path without parsing Vite's manifest.
 *
 * If you rename `site-shell.js` here, also update it in:
 * - backend/src/templates/template.html (<script src="/assets/site-shell.js">)
 */
export default defineConfig({
  plugins: [react()],
  define: {
    // Library mode doesn't apply this automatically like app mode does,
    // but react-dom needs it to pick its production build over the much
    // larger development one.
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: 'dist/widget',
    emptyOutDir: true,
    minify: 'esbuild',
    lib: {
      entry: path.resolve(__dirname, 'src/site-shell-entry.tsx'),
      formats: ['es'],
      fileName: () => 'site-shell.js',
    },
  },
});
