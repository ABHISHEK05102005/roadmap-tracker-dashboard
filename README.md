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
2. Use the defaults Vercel reads from `vercel.json`:
   - **Build command:** `npm run build`
   - **Output directory:** `client/dist`
   - **Install command:** `npm install`
3. **Persistence (required for real usage):** add **Redis (Upstash)** from the [Vercel Marketplace](https://vercel.com/marketplace) and connect it to the project. Vercel injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
   - Without Redis on Vercel, the app runs with an **in-memory store** (progress resets when a new serverless instance starts).
4. Deploy. Open your production URL; the client calls `/api/...`, which is handled by `api/[...slug].js`.

See `.env.example` for variable names.

## Project structure

- `server/`: Express API and storage layer (`server/data/` JSON on disk locally)
- `client/`: React (Vite), CSS Modules, Chart.js
- `api/[...slug].js`: Vercel Serverless entry (wraps the same Express app via `serverless-http`)
