import { v } from "convex/values";
import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";

const PRESENCE_STALE_MS = 60_000;

export const heartbeat = mutation({
  args: {
    userId: v.string(),
    displayName: v.optional(v.string()),
    color: v.optional(v.string()),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName ?? existing.displayName,
        color: args.color ?? existing.color,
        documentId: args.documentId ?? existing.documentId,
        lastSeen: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      userId: args.userId,
      displayName: args.displayName,
      color: args.color,
      documentId: args.documentId,
      lastSeen: now,
    });
  },
});

export const leaveDocument = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { documentId: undefined, lastSeen: Date.now() });
    }
  },
});

export const listPresentInDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const now = Date.now();
    const rows = await ctx.db
      .query("users")
      .withIndex("by_document_lastSeen", (q) => q.eq("documentId", documentId))
      .collect();
    return rows.filter((u) => now - u.lastSeen < PRESENCE_STALE_MS);
  },
});
