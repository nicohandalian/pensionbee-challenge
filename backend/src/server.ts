import path from 'path';
import { createApp } from './app.js';
import { ContentService } from './services/contentService.js';

const backendRoot = path.resolve(import.meta.dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const contentDir = path.join(repoRoot, 'content');
const templatePath = path.join(
  backendRoot,
  'src',
  'templates',
  'template.html',
);
const widgetAssetsDir = path.join(repoRoot, 'frontend', 'dist', 'widget');
const publicDir = path.join(backendRoot, 'src', 'public');

const app = createApp({
  contentService: new ContentService({ contentDir }),
  templatePath,
  widgetAssetsDir,
  publicDir,
});

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

// Hosting platforms send SIGTERM before killing a container on
// redeploy/scale-down — drain in-flight requests instead of dropping them.
function shutdown(signal: NodeJS.Signals): void {
  console.log(`${signal} received, shutting down gracefully`);

  server.close((error) => {
    if (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }

    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
