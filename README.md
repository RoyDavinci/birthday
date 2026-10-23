# How Well Do You Know RoyDavinci?

A frontend-only birthday quiz built with React, TypeScript, Vite, Tailwind CSS v4, Framer Motion, and Lucide.

## Run locally

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm test
npm run build
```

## Production deployment

- Build command: `npm run build`
- Output directory: `dist`

This is a casual, client-side quiz. The question bank is shipped to the browser and saved attempts are stored in local storage. It is not suitable for prizes, tamper-resistant scores, or a trusted leaderboard without server-side answer validation.

The page includes `noindex` metadata to discourage search indexing. The Open Graph image is `public/og-image.png`. After deployment, change `og:image` and `twitter:image` in `index.html` to the absolute URL for that image (for example, `https://your-domain.example/og-image.png`) so chat apps can reliably render the preview. The image is a PNG on purpose: WhatsApp, Facebook and X do not render SVG previews.
