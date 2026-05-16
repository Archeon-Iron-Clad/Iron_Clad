# Convex (Iron-Clad backend)

1. From repo root: `npx convex dev`
2. Link or create a Convex project when prompted; copy the deployment URL into `.env.local` as `VITE_CONVEX_URL=...`.

Functions live alongside `schema.ts`. After schema changes, `convex dev` redeploys automatically.
