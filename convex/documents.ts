import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canAccessDocument, isGroupMember } from "./lib/access";
import { listAccessibleDocuments } from "./lib/accessibleDocuments";
import { requireUserEmail } from "./lib/sessionHelpers";

export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    sessionToken: v.string(),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const createdBy = await requireUserEmail(ctx, args.sessionToken);
    if (args.groupId !== undefined) {
      const ok = await isGroupMember(ctx, createdBy, args.groupId);
      if (!ok) throw new Error("Forbidden");
    }
    const now = Date.now();
    return await ctx.db.insert("documents", {
      storageId: args.storageId,
      name: args.name,
      createdBy,
      createdAt: now,
      groupId: args.groupId,
    });
  },
});

export const get = query({
  args: { documentId: v.id("documents"), sessionToken: v.string() },
  handler: async (ctx, { documentId, sessionToken }) => {
    const u = await requireUserEmail(ctx, sessionToken);
    const doc = await ctx.db.get(documentId);
    if (!doc) return null;
    if (!(await canAccessDocument(ctx, u, doc))) {
      return null;
    }
    return doc;
  },
});

export const listAccessible = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const u = await requireUserEmail(ctx, sessionToken);
    return await listAccessibleDocuments(ctx, u);
  },
});

export const generateUploadUrl = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireUserEmail(ctx, args.sessionToken);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage"), sessionToken: v.string() },
  handler: async (ctx, { storageId, sessionToken }) => {
    const u = await requireUserEmail(ctx, sessionToken);

    const doc = await ctx.db
      .query("documents")
      .withIndex("by_storageId", (q) => q.eq("storageId", storageId))
      .unique();
    if (!doc) return null;
    if (!(await canAccessDocument(ctx, u, doc))) {
      return null;
    }
    return await ctx.storage.getUrl(storageId);
  },
});
