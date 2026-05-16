import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { canAccessDocument, isGroupMember, normalizeEmail } from "./lib/access";

export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    userEmail: v.string(),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const createdBy = normalizeEmail(args.userEmail);
    if (!createdBy.includes("@")) {
      throw new Error("Invalid email");
    }
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
  args: { documentId: v.id("documents"), userEmail: v.string() },
  handler: async (ctx, { documentId, userEmail }) => {
    const u = normalizeEmail(userEmail);
    if (!u.includes("@")) throw new Error("Invalid email");
    const doc = await ctx.db.get(documentId);
    if (!doc) return null;
    if (!(await canAccessDocument(ctx, u, doc))) {
      return null;
    }
    return doc;
  },
});

export const listAccessible = query({
  args: { userEmail: v.string() },
  handler: async (ctx, { userEmail }) => {
    const u = normalizeEmail(userEmail);
    if (!u.includes("@")) return [];

    const personal = await ctx.db
      .query("documents")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", u))
      .collect();

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", u))
      .collect();

    const groupDocs: Doc<"documents">[] = [];
    for (const m of memberships) {
      const docs = await ctx.db
        .query("documents")
        .withIndex("by_group", (q) => q.eq("groupId", m.groupId))
        .collect();
      groupDocs.push(...docs);
    }

    const seen = new Set<string>();
    const merged: Doc<"documents">[] = [];
    for (const d of [...personal, ...groupDocs]) {
      const id = d._id as string;
      if (seen.has(id)) continue;
      seen.add(id);
      merged.push(d);
    }

    return merged.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const generateUploadUrl = mutation({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const e = normalizeEmail(args.userEmail);
    if (!e.includes("@")) {
      throw new Error("Invalid email");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { storageId: v.id("_storage"), userEmail: v.string() },
  handler: async (ctx, { storageId, userEmail }) => {
    const u = normalizeEmail(userEmail);
    if (!u.includes("@")) throw new Error("Invalid email");

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
