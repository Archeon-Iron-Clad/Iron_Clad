import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireDocumentAccess } from "./lib/access";
import { requireUserEmail } from "./lib/sessionHelpers";

const PRESENCE_STALE_MS = 60_000;

export const heartbeat = mutation({
  args: {
    sessionToken: v.string(),
    displayName: v.optional(v.string()),
    color: v.optional(v.string()),
    documentId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserEmail(ctx, args.sessionToken);
    if (args.documentId !== undefined) {
      await requireDocumentAccess(ctx, userId, args.documentId);
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
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const userId = await requireUserEmail(ctx, sessionToken);
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
  args: { documentId: v.id("documents"), sessionToken: v.string() },
  handler: async (ctx, { documentId, sessionToken }) => {
    const u = await requireUserEmail(ctx, sessionToken);
    await requireDocumentAccess(ctx, u, documentId);

    const now = Date.now();
    const rows = await ctx.db
      .query("presencePeers")
      .withIndex("by_document_lastSeen", (q) => q.eq("documentId", documentId))
      .collect();
    return rows.filter((peer) => now - peer.lastSeen < PRESENCE_STALE_MS);
  },
});
