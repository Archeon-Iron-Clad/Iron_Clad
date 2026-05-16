import { v } from "convex/values";
import { action } from "./_generated/server";
import { normalizeEmail } from "./lib/access";

/**
 * Phase B stub: server-side release export with true content removal.
 * Client should use exportVisualRedactionPreview until this is implemented.
 */
export const requestReleaseExport = action({
  args: {
    documentId: v.id("documents"),
    userEmail: v.string(),
  },
  handler: async (_ctx, { userEmail }) => {
    const u = normalizeEmail(userEmail);
    if (!u.includes("@")) throw new Error("Invalid email");

    throw new Error(
      "Release-ready export is not available yet. It will remove underlying PDF text and sanitize metadata. Use Preview export for visual blackout only.",
    );
  },
});
