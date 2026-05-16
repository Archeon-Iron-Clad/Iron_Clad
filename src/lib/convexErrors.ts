/** Map common Convex client errors to actionable production hints. */
export function enhanceConvexActionError(err: unknown, context: string): Error {
  const msg = err instanceof Error ? err.message : String(err)
  const looksLikeApiMismatch =
    /Could not validate|ArgumentValidationError|invalid function|no match for identifier|validateArguments?/i.test(
      msg,
    )
  if (looksLikeApiMismatch) {
    return new Error(
      `${context}: ${msg}\n\n` +
        `Production checklist: (1) Run \`npx convex deploy\` so this Convex deployment has the latest functions and schema. ` +
        `(2) In Vercel (or your host), set env \`VITE_CONVEX_URL\` to **this** deployment’s URL from the Convex dashboard—not the dev URL unless you mean to. ` +
        `(3) Trigger a new frontend build so Vite bakes in that variable. Then hard-refresh the app.`,
    )
  }
  return err instanceof Error ? err : new Error(msg)
}
