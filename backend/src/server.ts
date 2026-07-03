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

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
