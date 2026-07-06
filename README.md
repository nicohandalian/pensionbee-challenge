# PensionBee Static Content Challenge

Full-stack TypeScript app for PensionBee's technical challenge: serve HTML pages generated from Markdown files, with new content folders picked up automatically, no code changes needed.

**Live:** https://pensionbee-challenge-n0lb.onrender.com (free tier, sleeps after inactivity — first request may take 30-50s)

## Architecture

Monorepo with npm workspaces:

| Package    | Stack                        | Serves                                                                                                            |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `backend`  | Node.js, Express, TypeScript | The whole app, at **http://localhost:3000** (`npm run dev`)                                                       |
| `frontend` | React, Vite, TypeScript      | The `SiteShell` widget, bundled into `backend`'s static assets, plus an isolated preview at http://localhost:5173 |

### Content rendering

A `GET` request maps onto a folder under `content/`: `content/<path>/index.md` is read, converted to HTML (`marked`), and injected into `template.html`'s `{{content}}` placeholder — a single, server-rendered document, no client-side fetch or JSON API. [`ContentService`](backend/src/services/contentService.ts) handles path traversal, trailing slashes, and missing files; `content/404/index.md` renders like any other page for unknown routes, with a minimal fallback if it doesn't exist.

React is required "to fit in with Acme Co's other websites," not as the rendering engine, so it's scoped to a progressive-enhancement widget: the site shell nav. The header is static HTML in `template.html`, visible on first paint; React mounts over it for interactivity, so the nav still works if the script fails to load.

Backend and frontend are separate workspaces on top of the starter repo's blank slate ([`PensionBee/static-content-challenge-2025`](https://github.com/PensionBee/static-content-challenge-2025)): `backend` owns routing/rendering, `frontend` owns the widget, testable independently. Tests: Vitest + Supertest, with fixtures isolated from the runtime `content/` directory.

## Getting started

Requires Node 20+ and npm 10+.

```bash
npm install
npm run dev
```

Starts the backend (rebuilding the widget on change) at **http://localhost:3000**. For isolated hot-reload on `SiteShell`, use `npm run dev:widget-preview` (a throwaway harness at http://localhost:5173, not part of the shipped app).

## Scripts

| Command                   | What it does                                                  |
| ------------------------- | ------------------------------------------------------------- |
| `npm test`                | Run all tests (add `-w backend` / `-w frontend` to scope one) |
| `npm run build`           | Build `frontend/dist/` and `backend/dist/`                    |
| `npm start -w backend`    | Run the built backend                                         |
| `npm run lint` / `format` | Lint / format the whole repo                                  |
| `npm run ci`              | Lint + test + build — same checks as CI                       |

Runs the same on every PR and push to `main` via [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Production readiness

Security headers ([`helmet`](https://github.com/helmetjs/helmet)), gzip ([`compression`](https://github.com/expressjs/compression)), access logging ([`morgan`](https://github.com/expressjs/morgan), silenced in tests), a generic 500 page instead of leaking errors, `trust proxy` for reverse-proxy hosting, and graceful shutdown on `SIGTERM`/`SIGINT`. Covered by [`backend/src/__tests__/security.test.ts`](backend/src/__tests__/security.test.ts).

## Project structure

```
.
├── content/                        # Markdown content (runtime, arbitrary depth)
│   ├── index.md                    # -> /
│   ├── about-page/index.md         # -> /about-page
│   ├── blog/
│   │   ├── index.md                # -> /blog (hand-written hub)
│   │   └── june/
│   │       ├── index.md            # -> /blog/june
│   │       └── company-update/index.md
│   └── 404/index.md                # Custom not-found page
├── backend/src/
│   ├── app.ts                      # Express app factory (testable)
│   ├── server.ts                   # Entry point
│   ├── services/contentService.ts  # Route -> file -> HTML resolution
│   ├── templates/template.html     # HTML shell: static header/footer + {{content}}
│   ├── public/styles.css           # Framework-free stylesheet
│   └── __tests__/                  # Integration tests + isolated fixtures
├── frontend/src/
│   ├── components/SiteShell.tsx    # Nav widget (progressive enhancement)
│   └── site-shell-entry.tsx        # Widget mount entry point
└── .github/workflows/              # CI pipeline
```

## Adding a new page

1. Create a folder under `content/` matching the URL: `content/pricing/` → `/pricing`.
2. Add an `index.md` file inside it.

Listing pages aren't auto-generated (`content/blog/index.md` links to `/blog/june` by hand), and `content/` ships in this repo, so publishing still means a commit + deploy — just with zero application code changes.

## Status against the challenge brief

Core requirements: dynamic routes from `content/` (arbitrary depth, no code changes needed), `template.html` + `{{content}}`, React nav widget, and a test suite covering all three required cases plus unit tests with fixtures isolated from the real `content/` folder.

Bonus credit — all done: pleasant styling, this documentation, the production-readiness pass above, and hosting on Render (link at the top).
