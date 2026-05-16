import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { isTeamMember } from "./lib/access";
import {
  DEFAULT_CASE_NAME,
  ensureSoloTeamAndDefaultCase,
  getDefaultCaseIdForTeam,
} from "./lib/workspace";
import { requireUserEmail } from "./lib/sessionHelpers";
import { getSessionDoc } from "./lib/sessionHelpers";

type Ctx = QueryCtx | MutationCtx;

async function requireTeamMember(ctx: Ctx, teamId: Id<"teams">, email: string) {
  const ok = await isTeamMember(ctx, email, teamId);
  if (!ok) throw new Error("Forbidden");
}

async function requireTeamAdmin(ctx: Ctx, teamId: Id<"teams">, email: string) {
  const m = await ctx.db
    .query("teamMembers")
    .withIndex("by_team_and_user", (q) => q.eq("teamId", teamId).eq("userId", email))
    .unique();
  if (!m || m.role !== "admin") throw new Error("Forbidden");
}

/** Matter row under team; rejects reserved default naming and solo teams (create extra matters on collab teams or use default on solo). */
export const create = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const email = await requireUserEmail(ctx, args.sessionToken);
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found");
    await requireTeamAdmin(ctx, args.teamId, email);

    const trimmed = args.name.trim();
    if (!trimmed) throw new Error("Name required");
    const reserved = trimmed.toLowerCase() === DEFAULT_CASE_NAME.toLowerCase();
    if (reserved) throw new Error("That name is reserved for the team's default matter");

    const now = Date.now();
    const caseId = await ctx.db.insert("cases", {
      teamId: args.teamId,
      name: trimmed,
      createdBy: email,
      createdAt: now,
      isDefault: false,
    });
    return caseId;
  },
});

async function purgeCaseDocuments(ctx: MutationCtx, caseId: Id<"cases">) {
  const docs = await ctx.db
    .query("documents")
    .withIndex("by_case", (q) => q.eq("caseId", caseId))
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
}

/** Admin deletes a non-default matter and its docs. Default case shell cannot be deleted. */
export const deleteCaseAndDocuments = mutation({
  args: {
    caseId: v.id("cases"),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    const email = await requireUserEmail(ctx, args.sessionToken);
    const c = await ctx.db.get(args.caseId);
    if (!c) return;
    if (c.isDefault) {
      throw new Error("Cannot delete the team's default matter");
    }
    await requireTeamAdmin(ctx, c.teamId, email);

    const session = await getSessionDoc(ctx, args.sessionToken);

    await purgeCaseDocuments(ctx, args.caseId);
    await ctx.db.delete(args.caseId);

    if (
      session &&
      session.preferredUploadCaseId &&
      session.preferredUploadCaseId === args.caseId
    ) {
      const fallback = await getDefaultCaseIdForTeam(ctx, c.teamId);
      if (fallback) {
        await ctx.db.patch(session._id, { preferredUploadCaseId: fallback });
      } else {
        const { defaultCaseId } = await ensureSoloTeamAndDefaultCase(ctx, email);
        await ctx.db.patch(session._id, { preferredUploadCaseId: defaultCaseId });
      }
    }
  },
});

/** Internal helper parity for UI lookups; verifies membership without admin. */
export const getTeamForCase = query({
  args: { caseId: v.id("cases"), sessionToken: v.string() },
  handler: async (ctx, { caseId, sessionToken }) => {
    const email = await requireUserEmail(ctx, sessionToken);
    const c = await ctx.db.get(caseId);
    if (!c) return null;
    await requireTeamMember(ctx, c.teamId, email);
    const team = await ctx.db.get(c.teamId);
    return team;
  },
});
