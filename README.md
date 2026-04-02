# Roadmap Tracker Dashboard

Modern SaaS-style productivity dashboard for tracking a large roadmap (300+ tasks).

## Run locally

### Prereqs
- Node.js 18+

### Install
```bash
npm install
```

### Start (frontend + backend)
```bash
npm run dev
```

- Frontend: `http://localhost:5173` (or the next free port)
- Backend: `http://localhost:3001`

The Vite dev server proxies `/api/*` to the Express server.

## Deploy on Vercel

This repo is set up as a **static Vite frontend** plus **serverless API** routes.

1. Push the project to GitHub and import it in [Vercel](https://vercel.com).
2. **Root directory:** leave blank (repository root). Do **not** set it to `client`, or `api/` and the workspace `npm run build` will not work as intended.
3. **Do not use legacy `builds` in `vercel.json`.** If that key exists, Vercel ignores your Project’s Build & Development settings and shows a warning; it also often causes broken builds (for example exit code `126`). Delete the entire `builds` array and rely on `installCommand`, `buildCommand`, and `outputDirectory` in `vercel.json` (or only in the dashboard — not both conflicting).
4. Use the defaults Vercel reads from `vercel.json`:
   - **Build command:** `npm run build`
   - **Output directory:** `client/dist`
   - **Install command:** `npm install`
5. **Persistence (required for real usage):** add **Redis (Upstash)** from the [Vercel Marketplace](https://vercel.com/marketplace) and connect it to the project. Vercel injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
   - Without Redis on Vercel, the app runs with an **in-memory store** (progress resets when a new serverless instance starts).
6. Deploy. Open your production URL; the client calls `/api/...`, which is handled by the **Express app** Vercel picks up from `src/index.js` (default export).

See `.env.example` for variable names.

## Project structure

- `server/`: Express API and storage layer (`server/data/` JSON on disk locally)
- `client/`: React (Vite), CSS Modules, Chart.js
- `src/index.js`: Vercel Express entry (default export; same routes as local server under `/api/...`)
