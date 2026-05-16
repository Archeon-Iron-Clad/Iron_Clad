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

## Team git workflow

Use short-lived branches and one shared Convex dev deployment; avoid committing `.env.local`.
