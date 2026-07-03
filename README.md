# PensionBee Static Content Challenge

## Overview

This project is a full-stack TypeScript application built as part of PensionBee's technical challenge.

The goal is to dynamically serve HTML pages generated from Markdown files while keeping the application extensible, maintainable and easy to test.

## Architecture

Monorepo with npm workspaces:

| Package    | Stack                        | Serves                                                                                                                                                                                  |
| ---------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend`  | Node.js, Express, TypeScript | The whole app, at **http://localhost:3000** (`npm run dev`)                                                                                                                             |
| `frontend` | React, Vite, TypeScript      | The `SiteShell` widget, bundled into `backend`'s static assets — plus an optional isolated preview at http://localhost:5173 (`npm run dev:widget-preview`), not part of the shipped app |

### Content rendering: server-rendered, not a JSON API

Every route is resolved and rendered entirely by the backend. A `GET` request maps directly onto a folder under `content/`, and the response is a single, fully-formed HTML document — there is no client-side fetch, no hydration step, and no JSON content API involved in producing a page:

```mermaid
flowchart LR
    Browser -->|"GET /jobs"| Express["Express (app.ts)"]
    Express --> ContentService["ContentService.getContent"]
    ContentService --> Markdown["markdown -> HTML (marked)"]
    Markdown --> Template["template.html (static header/footer + {{content}})"]
    Template --> Response["Full HTML response, header already visible"]
    Response --> Browser
    Browser -->|"loads bundled JS"| SiteShell["React site-shell widget"]
    SiteShell -->|"mounts over the existing header for interactivity"| Response
```

- `content/<path>/index.md` → markdown is read, converted to HTML (`marked`), and injected into `template.html`'s `{{content}}` placeholder. New folders under `content/` are picked up automatically — no code changes or redeploys needed to publish a new page.
- Path traversal (`..`, `.`), trailing slashes, and missing files are all handled by [`backend/src/services/contentService.ts`](backend/src/services/contentService.ts) and covered by isolated fixture-based tests (they don't depend on the real `content/` folder, so tests stay stable as content changes).
- The 404 page is content-driven too: if `content/404/index.md` exists it's rendered like any other page (so it can be edited without touching code); otherwise a minimal fallback message is used.

**Why not a SPA + JSON API?** The brief asks for pages to be returned "at URLs that match the paths of the folders" — i.e. the response to `GET /jobs` should already be the rendered page, not a shell that fetches content afterwards. Server-rendering also keeps the app trivially testable with `supertest` (a plain HTTP assertion on `res.text`, no browser/JS execution required) and avoids SEO/first-paint trade-offs a client-rendered CMS would introduce for what is fundamentally static marketing content.

**Where React fits in:** the brief requires React on the front-end "to fit in with Acme Co's other websites," but doesn't ask for React to be the rendering engine. React is used as a small, optional **progressive-enhancement widget** — a site shell (nav/branding, mobile menu) built with Vite. The header itself is static HTML already present in `template.html` (so it's visible on the very first paint, with no flash while JS loads); React just mounts over that same container afterwards to add interactivity (the mobile menu toggle, active-link highlighting). It never gates the page's core content: if the script fails to load, the server-rendered markdown — and a fully usable, link-only nav — are still there and correct.

**Why a backend/frontend split, when the challenge starter is just a flat `content/` + `template.html`?** The starter repo ([`PensionBee/static-content-challenge-2025`](https://github.com/PensionBee/static-content-challenge-2025)) intentionally ships no application code or architecture at all — just the raw ingredients (sample content and the template) and a requirement to use React. The backend/frontend workspace split is our own architectural choice on top of that blank slate: `backend` owns routing/rendering (plain Node, no framework opinions imposed by React), and `frontend` owns the one piece of UI the brief mandates (React), built as an isolated, independently-testable widget rather than pulled into the server process.

**Testing:** Backend tests use Vitest and Supertest, with fixtures isolated from the runtime `content/` directory (`backend/src/**/__tests__/fixtures/`) so tests don't break as real content changes.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts the backend (with the site-shell widget rebuilding on change) at **http://localhost:3000** — that's the one and only URL you should browse. There's no separate frontend server to visit: the backend serves the fully rendered pages, and the React widget ships as a static asset that mounts itself client-side. A request to a content route (`/jobs`, `/blog/june/company-update`, ...) returns the final page directly — no redirects, no client-side routing.

If you want to iterate on the `SiteShell` component in isolation with hot-reload (a nice-to-have for UI tweaks, not part of the main workflow), run:

```bash
npm run dev:widget-preview
```

This opens a throwaway Vite dev harness at http://localhost:5173 that renders the component standalone — it has no routes, no content, and isn't part of the shipped app.

## Testing

```bash
npm test
```

Or per package:

```bash
npm test -w backend
npm test -w frontend
```

## Build

```bash
npm run build
```

Produces `frontend/dist/` and `backend/dist/`.

Start the compiled backend:

```bash
npm start -w backend
```

## Linting & formatting

```bash
npm run lint
npm run format
npm run format:check
```

## CI

GitHub Actions runs on every pull request and on pushes to `main`. Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

Steps:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`

Run the same checks locally before pushing:

```bash
npm run ci
```

Results appear under the **Actions** tab and in pull request checks.

## Project structure

```
.
├── content/                       # Markdown content (runtime, arbitrary depth)
├── backend/
│   └── src/
│       ├── app.ts                 # Express app factory (testable)
│       ├── server.ts              # Server entry point (wires ContentService + createApp)
│       ├── services/
│       │   └── contentService.ts  # Route -> file -> HTML resolution
│       ├── utils/
│       │   ├── fileSystem.ts      # Route normalization, safe path resolution
│       │   └── markdown.ts        # Markdown -> HTML (marked)
│       ├── templates/
│       │   └── template.html      # HTML shell with the {{content}} placeholder
│       ├── public/
│       │   └── styles.css         # Hand-written, framework-free stylesheet
│       └── __tests__/             # Integration tests + isolated fixtures
├── frontend/
│   ├── src/
│   │   ├── components/SiteShell.tsx  # Nav widget (progressive enhancement)
│   │   ├── site-shell-entry.tsx      # Widget mount entry point
│   │   └── App.tsx                   # Standalone preview app (dev:widget-preview only)
│   └── vite.widget.config.ts      # Builds the widget as a fixed-filename bundle
├── .github/workflows/             # CI pipeline
└── package.json                   # Workspace root
```

## Status against the challenge brief

Core requirements — done:

- Routes resolve dynamically from `content/` folder paths, arbitrary depth, no code changes needed for new pages
- `template.html` + `{{content}}` placeholder mechanism
- React on the front-end (site-shell nav widget)
- Test suite covers all three required cases (200 + body, 404) plus unit tests, using fixtures isolated from the real `content/` folder

Bonus credit:

- ✅ Styled in a pleasing way (`backend/src/public/styles.css`, framework-free)
- ✅ Documentation describing usage + how to iterate (this README)
- ⏳ Hosted on a cloud service with a live deployment link — pending
- ⏳ Broader production-readiness pass (error handling, logging, security headers) — pending
