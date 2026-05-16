import { v } from "convex/values";
import { query } from "./_generated/server";
import { normalizeEmail, requireDocumentAccess } from "./lib/access";

export const listByDocument = query({
  args: {
    documentId: v.id("documents"),
    userEmail: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { documentId, userEmail, limit }) => {
    const u = normalizeEmail(userEmail);
    if (!u.includes("@")) throw new Error("Invalid email");
    await requireDocumentAccess(ctx, u, documentId);

    const max = Math.min(limit ?? 100, 200);
    const rows = await ctx.db
      .query("documentAuditEvents")
      .withIndex("by_document_time", (q) => q.eq("documentId", documentId))
      .order("desc")
      .take(max);

    return rows;
  },
});
