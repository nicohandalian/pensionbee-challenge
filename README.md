# PensionBee Static Content Challenge

Full-stack TypeScript app for PensionBee's technical challenge: serve HTML pages generated from Markdown files, with new content folders picked up automatically, no code changes needed.

## Architecture

Monorepo with npm workspaces:

| Package    | Stack                        | Serves                                                                                                            |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `backend`  | Node.js, Express, TypeScript | The whole app, at **http://localhost:3000** (`npm run dev`)                                                       |
| `frontend` | React, Vite, TypeScript      | The `SiteShell` widget, bundled into `backend`'s static assets, plus an isolated preview at http://localhost:5173 |

### Content rendering

A `GET` request maps onto a folder under `content/`: `content/<path>/index.md` is read, converted to HTML (`marked`), and injected into `template.html`'s `{{content}}` placeholder. The response is a single, fully-formed HTML document — no client-side fetch, no JSON API.

- Path traversal, trailing slashes, and missing files are handled by [`backend/src/services/contentService.ts`](backend/src/services/contentService.ts).
- The 404 page is content-driven too: `content/404/index.md` renders like any other page if it exists, otherwise a minimal fallback is used.

This matches the brief's requirement that `GET /jobs` return the finished page directly, and keeps the app testable with plain HTTP assertions instead of a JSON API + client-rendered CMS.

React is required "to fit in with Acme Co's other websites," not as the rendering engine, so it's scoped to a progressive-enhancement widget: the site shell (nav, mobile menu). The header is static HTML already in `template.html`, visible on first paint; React mounts over it afterwards to add interactivity. If the script fails to load, the nav and page content still work.

The backend/frontend split is our own choice on top of the starter repo's blank slate ([`PensionBee/static-content-challenge-2025`](https://github.com/PensionBee/static-content-challenge-2025) ships only sample content + `template.html`): `backend` owns routing/rendering, `frontend` owns the one piece of UI the brief requires, built as an isolated, independently-testable widget.

**Testing:** Vitest + Supertest, with fixtures isolated from the runtime `content/` directory (`backend/src/**/__tests__/fixtures/`).

## Getting started

Requires Node 20+ and npm 10+.

```bash
npm install
npm run dev
```

`npm run dev` starts the backend (rebuilding the site-shell widget on change) at **http://localhost:3000** — the only URL you need. To iterate on `SiteShell` in isolation with hot-reload, use `npm run dev:widget-preview` instead (a throwaway Vite harness at http://localhost:5173, not part of the shipped app).

## Scripts

| Command                   | What it does                                                  |
| ------------------------- | ------------------------------------------------------------- |
| `npm test`                | Run all tests (add `-w backend` / `-w frontend` to scope one) |
| `npm run build`           | Build `frontend/dist/` and `backend/dist/`                    |
| `npm start -w backend`    | Run the built backend                                         |
| `npm run lint` / `format` | Lint / format the whole repo                                  |
| `npm run ci`              | Lint + test + build — same checks as CI                       |

GitHub Actions runs `npm ci`, `npm run lint`, `npm test`, `npm run build` on every pull request and push to `main` ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Production readiness

- **Security headers** via [`helmet`](https://github.com/helmetjs/helmet) (CSP, `X-Frame-Options`, `X-Content-Type-Options`, HSTS).
- **Compression** via [`compression`](https://github.com/expressjs/compression).
- **Access logging** via [`morgan`](https://github.com/expressjs/morgan), silenced during tests.
- **A real 500 handler**: unexpected errors log server-side and return a generic, on-brand error page.
- **`trust proxy`**, since any realistic hosting target sits behind a reverse proxy.
- **Graceful shutdown** on `SIGTERM`/`SIGINT`, draining in-flight requests instead of dropping them.

Covered by [`backend/src/__tests__/security.test.ts`](backend/src/__tests__/security.test.ts).

## Project structure

```
.
├── content/                        # Markdown content (runtime, arbitrary depth)
│   ├── index.md                    # -> /
│   ├── about-page/index.md         # -> /about-page
│   ├── blog/
│   │   ├── index.md                # -> /blog (hand-written hub, links to months)
│   │   └── june/
│   │       ├── index.md            # -> /blog/june (hand-written hub, links to posts)
│   │       └── company-update/index.md
│   └── 404/index.md                # Custom not-found page
├── backend/src/
│   ├── app.ts                      # Express app factory (testable)
│   ├── server.ts                   # Entry point (wires ContentService + createApp)
│   ├── services/contentService.ts  # Route -> file -> HTML resolution
│   ├── utils/                      # Path resolution, markdown conversion
│   ├── templates/template.html     # HTML shell: static header/footer + {{content}}
│   ├── public/styles.css           # Hand-written, framework-free stylesheet
│   └── __tests__/                  # Integration tests + isolated fixtures
├── frontend/src/
│   ├── components/SiteShell.tsx    # Nav widget (progressive enhancement)
│   ├── site-shell-entry.tsx        # Widget mount entry point
│   └── App.tsx                     # Preview harness (dev:widget-preview only)
└── .github/workflows/              # CI pipeline
```

## Adding a new page

1. Create a folder under `content/` matching the URL: `content/pricing/` → `/pricing`.
2. Add an `index.md` file inside it.
3. Done — the next request reads the file, converts it to HTML, and wraps it in the usual header/footer. Delete the folder and the route 404s instead.

Two caveats: listing pages aren't auto-generated (`content/blog/index.md` links to `/blog/june` by hand, same as any other page), and `content/` ships in this repo, so publishing still means a commit + deploy — just with zero application code changes.

## Iterating from here

`ContentService` is the one seam the rest of the app depends on, so growing past the current scope plugs in without touching request-handling or templates:

- Swap the filesystem read in `ContentService.getContent` for a headless CMS or database call.
- Add an authenticated admin UI once content lives behind an API instead of git.
- Add search by indexing `content/**/index.md`.
- Move `content/` out of git into a database/object store, so publishing is an API call instead of a deploy.

## Status against the challenge brief

Core requirements — done:

- Routes resolve dynamically from `content/` folder paths, arbitrary depth, no code changes needed for new pages
- `template.html` + `{{content}}` placeholder mechanism
- React on the front-end (site-shell nav widget)
- Test suite covers all three required cases (200 + body, 404) plus unit tests, using fixtures isolated from the real `content/` folder

Bonus credit:

- Done: styled in a pleasing way (`backend/src/public/styles.css`, framework-free)
- Done: documentation describing usage + how to iterate (this README)
- Done: production-readiness pass (see [Production readiness](#production-readiness))
- Not done: hosted on a cloud service with a live deployment link
