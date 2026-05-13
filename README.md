# Since 67 — teaser site

Static Vite + TypeScript teaser with a pre-screen, intro video, and main poster.

## Requirements

- Node.js **20+** (see `.nvmrc`)

## Setup

```bash
npm ci
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

Output is written to `dist/`. Preview locally:

```bash
npm run preview
```

## Environment

Copy `.env.example` to `.env` or `.env.production` and adjust as needed.

| Variable | Purpose |
|----------|---------|
| `VITE_WALL_OF_LOVE_URL` | Optional override for the Wall of Love CTA URL. If unset, the app uses the default production URL. |
| `VITE_BASE_PATH` | Vite [`base`](https://vitejs.dev/config/shared-options.html#base) for non-root deploys. Examples: `/` (default), `/my-repo/` for a GitHub Pages project site at `https://<user>.github.io/my-repo/`. Prefer a path-style base over `./` unless you specifically need relative URLs. |

## GitHub Actions

CI runs `npm ci` and `npm run build` on pushes and pull requests to `main` or `master`.

## Large media

Intro videos and other binaries under `public/` can be large. If Git rejects a push, use [Git LFS](https://git-lfs.github.com/) for those assets or host them externally and point URLs accordingly.
