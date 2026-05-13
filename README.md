# Since 67 — Teaser Website

Static teaser page. No build step. No dependencies.

## File structure

```
/
├── index.html      — page markup
├── style.css       — all styles & animations
├── main.js         — pre-screen flow, intro video, Web Audio loop
└── assets/
    ├── fonts/      — Geist Sans (.woff2), Dharma Gothic E (.otf)
    ├── *.png/svg   — logo, icons, textures
    ├── dirt-fx.mp4 — background dirt overlay video
    ├── website-intro-video.mp4   — desktop intro video
    ├── website-intro-mobile.mp4  — mobile intro video
    └── theme-loop.mp3            — seamless background audio
```

## Development

Serve the root folder with any static file server:

```bash
npx serve .
# or
python3 -m http.server 5173
```

Then open [http://localhost:5173](http://localhost:5173).

> **Note:** The intro video and Web Audio loop require a proper HTTP server — they will not work when opening `index.html` directly from the filesystem (`file://`) due to browser security restrictions.

## Deployment

Upload the entire folder (`index.html`, `style.css`, `main.js`, `assets/`) to any static host. No build command needed.

- **Netlify** — drag and drop the folder in the Netlify dashboard
- **GitHub Pages** — push to `main`, set source to root `/`
- **Vercel** — import repo, framework preset: *Other*
- **S3 / CloudFront** — sync the folder contents to your bucket
