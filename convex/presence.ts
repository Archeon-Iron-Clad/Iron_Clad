import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const PRESENCE_STALE_MS = 60_000;

export const heartbeat = mutation({
  args: {
    displayName: v.optional(v.string()),
    color: v.optional(v.string()),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    const now = Date.now();
    const existing = await ctx.db
      .query("presencePeers")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
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

    return await ctx.db.insert("presencePeers", {
      userId,
      displayName: args.displayName,
      color: args.color,
      documentId: args.documentId,
      lastSeen: now,
    });
  },
});

export const leaveDocument = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    const existing = await ctx.db
      .query("presencePeers")
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
      .query("presencePeers")
      .withIndex("by_document_lastSeen", (q) => q.eq("documentId", documentId))
      .collect();
    return rows.filter((u) => now - u.lastSeen < PRESENCE_STALE_MS);
  },
});
