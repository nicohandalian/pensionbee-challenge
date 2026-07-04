import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Powers `npm run dev:widget-preview` only — an isolated harness for
// developing SiteShell with HMR. It has no routes/content of its own and
// doesn't talk to the backend; see README.md's "Development" section.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
