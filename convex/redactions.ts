import { v } from "convex/values";
import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";

export const listByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    return await ctx.db
      .query("redactionBoxes")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .collect();
  },
});

export const createBox = mutation({
  args: {
    documentId: v.id("documents"),
    pageNumber: v.number(),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    userId: v.string(),
    status: v.union(v.literal("draft"), v.literal("locked")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("redactionBoxes", {
      documentId: args.documentId,
      pageNumber: args.pageNumber,
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      status: args.status,
      userId: args.userId,
      updatedAt: now,
    });
  },
});

export const updateBox = mutation({
  args: {
    boxId: v.id("redactionBoxes"),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("locked"))),
  },
  handler: async (ctx, { boxId, ...patch }) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (patch.x !== undefined) updates.x = patch.x;
    if (patch.y !== undefined) updates.y = patch.y;
    if (patch.width !== undefined) updates.width = patch.width;
    if (patch.height !== undefined) updates.height = patch.height;
    if (patch.status !== undefined) updates.status = patch.status;
    await ctx.db.patch(boxId, updates);
  },
});

export const deleteBox = mutation({
  args: { boxId: v.id("redactionBoxes") },
  handler: async (ctx, { boxId }) => {
    await ctx.db.delete(boxId);
  },
});
