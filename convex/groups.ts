import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { normalizeEmail } from "./lib/access";
import { requireUserEmail } from "./lib/sessionHelpers";

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
  args: {
    name: v.string(),
    sessionToken: v.string(),
    kind: v.union(v.literal("team"), v.literal("case")),
    sourceTeamName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userEmail = await requireUserEmail(ctx, args.sessionToken);
    const name = args.name.trim();
    if (!name) throw new Error("Name required");
    const rosterLabel = args.sourceTeamName?.trim();
    const now = Date.now();
    const groupId = await ctx.db.insert("groups", {
      name,
      createdBy: userEmail,
      createdAt: now,
      kind: args.kind,
      ...(args.kind === "case" && rosterLabel
        ? { sourceTeamName: rosterLabel }
        : {}),
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
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const u = await requireUserEmail(ctx, sessionToken);

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
  args: { groupId: v.id("groups"), sessionToken: v.string() },
  handler: async (ctx, { groupId, sessionToken }) => {
    const u = await requireUserEmail(ctx, sessionToken);

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
    sessionToken: v.string(),
  },
  handler: async (ctx, { groupId, targetEmail, sessionToken }) => {
    const adminEmail = await requireUserEmail(ctx, sessionToken);
    const target = normalizeEmail(targetEmail);
    if (!target.includes("@")) {
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
    sessionToken: v.string(),
  },
  handler: async (ctx, { groupId, targetEmail, sessionToken }) => {
    const actor = await requireUserEmail(ctx, sessionToken);
    const target = normalizeEmail(targetEmail);
    if (!target.includes("@")) {
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

/** Lead-only: removes the group, memberships, linked documents (storage + boxes + presence), redactions. */
export const deleteGroup = mutation({
  args: {
    groupId: v.id("groups"),
    userEmail: v.string(),
  },
  handler: async (ctx, { groupId, userEmail }) => {
    const actor = normalizeEmail(userEmail);
    if (!actor.includes("@")) throw new Error("Invalid email");
    await requireAdmin(ctx, groupId, actor);

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();

    for (const doc of docs) {
      const boxes = await ctx.db
        .query("redactionBoxes")
        .withIndex("by_document", (q) => q.eq("documentId", doc._id))
        .collect();
      for (const b of boxes) {
        await ctx.db.delete(b._id);
      }
      const peers = await ctx.db
        .query("presencePeers")
        .withIndex("by_document_lastSeen", (q) => q.eq("documentId", doc._id))
        .collect();
      for (const p of peers) {
        await ctx.db.delete(p._id);
      }
      await ctx.storage.delete(doc.storageId);
      await ctx.db.delete(doc._id);
    }

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();
    for (const m of members) {
      await ctx.db.delete(m._id);
    }

    await ctx.db.delete(groupId);
  },
});
