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

Deploy the generated `dist/` folder only. Do not deploy the raw source `index.html`; it contains Vite dev entry paths that are compiled during `npm run build`.

Preview the built production output locally:

```bash
npm run preview
```

## Environment

Copy `.env.example` to `.env` or `.env.production` and adjust as needed.

| Variable | Purpose |
|----------|---------|
| `VITE_WALL_OF_LOVE_URL` | Optional override for the Wall of Love CTA URL. If unset, the app uses the default production URL. |
| `VITE_BASE_PATH` | Optional Vite [`base`](https://vitejs.dev/config/shared-options.html#base). Defaults to `./`, which works for GitHub Pages project sites and most static hosts. Use `/` only for root-domain deploys that require root-absolute asset URLs. |

## Deployment

1. Run `npm ci`.
2. Run `npm run build`.
3. Upload the contents of `dist/` to the host.

For GitHub Pages project sites, the default `VITE_BASE_PATH=./` is intended to work without extra configuration.

## GitHub Actions

CI runs `npm ci` and `npm run build` on pushes and pull requests to `main` or `master`.

## Large media

Intro videos and other binaries under `public/` can be large. If Git rejects a push, use [Git LFS](https://git-lfs.github.com/) for those assets or host them externally and point URLs accordingly.
