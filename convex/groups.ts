import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { normalizeEmail } from "./lib/access";

type Ctx = QueryCtx | MutationCtx;

async function requireAdmin(ctx: Ctx, groupId: Id<"groups">, userEmail: string) {
  const m = await ctx.db
    .query("groupMembers")
    .withIndex("by_group_and_user", (q) => q.eq("groupId", groupId).eq("userId", userEmail))
    .unique();
  if (!m || m.role !== "admin") {
    throw new Error("Forbidden");
  }
  return m;
}

export const create = mutation({
  args: { name: v.string(), userEmail: v.string() },
  handler: async (ctx, args) => {
    const userEmail = normalizeEmail(args.userEmail);
    if (!userEmail.includes("@")) throw new Error("Invalid email");
    const name = args.name.trim();
    if (!name) throw new Error("Name required");
    const now = Date.now();
    const groupId = await ctx.db.insert("groups", {
      name,
      createdBy: userEmail,
      createdAt: now,
    });
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: userEmail,
      role: "admin",
      joinedAt: now,
    });
    return groupId;
  },
});

export const listMyGroups = query({
  args: { userEmail: v.string() },
  handler: async (ctx, { userEmail }) => {
    const u = normalizeEmail(userEmail);
    if (!u.includes("@")) return [];

    const rows = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", u))
      .collect();

    const out: { group: Doc<"groups">; role: "admin" | "member" }[] = [];

    for (const row of rows) {
      const group = await ctx.db.get(row.groupId);
      if (group) {
        out.push({ group, role: row.role });
      }
    }

    return out.sort((a, b) => b.group.createdAt - a.group.createdAt);
  },
});

export const listMembers = query({
  args: { groupId: v.id("groups"), userEmail: v.string() },
  handler: async (ctx, { groupId, userEmail }) => {
    const u = normalizeEmail(userEmail);
    if (!u.includes("@")) throw new Error("Invalid email");

    const myMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => q.eq("groupId", groupId).eq("userId", u))
      .unique();
    if (!myMembership) throw new Error("Forbidden");

    return await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();
  },
});

export const addMember = mutation({
  args: {
    groupId: v.id("groups"),
    targetEmail: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, { groupId, targetEmail, userEmail }) => {
    const adminEmail = normalizeEmail(userEmail);
    const target = normalizeEmail(targetEmail);
    if (!adminEmail.includes("@") || !target.includes("@")) {
      throw new Error("Invalid email");
    }
    await requireAdmin(ctx, groupId, adminEmail);

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => q.eq("groupId", groupId).eq("userId", target))
      .unique();
    if (existing) return existing._id;

    return await ctx.db.insert("groupMembers", {
      groupId,
      userId: target,
      role: "member",
      joinedAt: Date.now(),
    });
  },
});

export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    targetEmail: v.string(),
    userEmail: v.string(),
  },
  handler: async (ctx, { groupId, targetEmail, userEmail }) => {
    const actor = normalizeEmail(userEmail);
    const target = normalizeEmail(targetEmail);
    if (!actor.includes("@") || !target.includes("@")) {
      throw new Error("Invalid email");
    }

    const targetRow = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) => q.eq("groupId", groupId).eq("userId", target))
      .unique();
    if (!targetRow) return;

    if (actor !== target) {
      await requireAdmin(ctx, groupId, actor);
    }

    if (targetRow.role === "admin") {
      const admins = await ctx.db
        .query("groupMembers")
        .withIndex("by_group", (q) => q.eq("groupId", groupId))
        .collect();
      const adminCount = admins.filter((m) => m.role === "admin").length;
      if (adminCount <= 1) {
        throw new Error("Cannot remove the last admin");
      }
    }

    await ctx.db.delete(targetRow._id);
  },
});
