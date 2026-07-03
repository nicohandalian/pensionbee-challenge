# PensionBee Static Content Challenge

## Overview

This project is a full-stack TypeScript application built as part of PensionBee's technical challenge.

The goal is to dynamically serve HTML pages generated from Markdown files while keeping the application extensible, maintainable and easy to test.

## Architecture

Monorepo with npm workspaces:

| Package    | Stack                        | Port (dev) |
| ---------- | ---------------------------- | ---------- |
| `backend`  | Node.js, Express, TypeScript | 3000       |
| `frontend` | React, Vite, TypeScript      | 5173       |

**Content** lives under `content/`. **HTML shell** is `template.html` (`{{content}}` placeholder). Markdown routing and rendering will be implemented in subsequent iterations.

**Dev setup:** Vite serves the React app and proxies `/health` to the backend. In production, the backend will serve the Vite build and dynamic markdown routes (to be implemented).

**Testing:** Backend tests use Vitest and Supertest. The content resolution tests will use isolated fixtures instead of the runtime content directory.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

```bash
npm install
```

## Development

Run both apps:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/health (also proxied at http://localhost:5173/health)

Run a single workspace:

```bash
npm run dev -w backend
npm run dev -w frontend
```

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

## Project structure

```
.
├── content/               # Markdown content (runtime)
├── template.html          # HTML shell for server-rendered pages
├── backend/
│   └── src/
│       ├── app.ts         # Express app factory (testable)
│       ├── index.ts       # Server entry point
│       └── __tests__/
├── frontend/
│   └── src/
└── package.json           # Workspace root
```

## Roadmap

- Implement dynamic markdown content resolution
- Convert Markdown to HTML
- Inject rendered HTML into the template
- Serve the React production build from Express
- Add comprehensive automated tests
