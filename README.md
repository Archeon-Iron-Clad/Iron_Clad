# Iron-Clad

Real-time collaborative **visual** PDF redaction for a 24-hour buildathon: PDF.js on canvas, coordinates in Convex, burn-in with pdf-lib.

## Stack

- **Frontend:** Vite, React 19, TypeScript, Tailwind CSS v4, Lucide
- **Backend:** Convex (`convex/`)
- **PDF:** pdfjs-dist (render), pdf-lib (export)

## Prerequisites

- Node.js 20+ (pdfjs-dist also lists newer Node in its `engines` field; Vite may still bundle for the browser)
- npm

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start Convex (creates/links a project and writes deployment config):

   ```bash
   npx convex dev
   ```

3. Copy `.env.example` to `.env.local` and set `VITE_CONVEX_URL` to the **Vite / client** URL Convex prints (not the dashboard URL). If your URL targets **production** Convex, deploy server-side changes after you pull new code (`npx convex deploy` — confirm prod when prompted). Using only `npx convex dev` updates the **dev** deployment only.

4. Run the app:

   ```bash
   npm run dev
   ```

## Repo layout

- `convex/` — schema, queries, mutations (`documents`, `redactions`, `presence`)
- `src/components/` — UI (pdf-viewer, layout, presence)
- `src/lib/pdf/` — coordinate helpers, render, export stub

Convex server functions use `mutationGeneric` / `queryGeneric` from `convex/server` so the repo builds **before** `convex/_generated` exists; after `convex dev` runs, you can switch to generated `api` for richer types if you want.

## Vercel auto-deploy (frontend only)

No GitHub Actions or Convex CI. **Vercel** rebuilds on every push to the connected branch (including a README-only commit).

### One-time Vercel setup

1. [Vercel](https://vercel.com) → **Add New Project** → import `Archeon-Iron-Clad/Iron_Clad`.
2. Framework: **Vite** (auto-detected). Build: `npm run build`. Output: `dist`.
3. **Environment variables** (Production, and Preview if you want):

   | Name | Value |
   |------|--------|
   | `VITE_CONVEX_URL` | `https://grateful-butterfly-7.convex.cloud` |

   Use your prod URL from `npx convex deploy --dry-run` if it differs.

4. Deploy once. After that, **any push to `main`** (README, code, etc.) triggers a new Vercel deployment automatically.

### Convex backend (manual, when you change `convex/`)

Run locally when you change schema or server functions — not on every git push:

```bash
npx convex deploy
```

Local dev still uses `npx convex dev` and `.env.local` (dev deployment). Vercel only hosts the static frontend; it must point at **prod** Convex via `VITE_CONVEX_URL`.

## Team git workflow

Use short-lived branches and one shared Convex dev deployment; avoid committing `.env.local`.
