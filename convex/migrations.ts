import { internalMutation } from "./_generated/server";

/**
 * Wipes workspace data: documents (+ storage blobs), redactions, audit, presence,
 * cases, teams, and sessions.
 * Keeps exemption codes — run sign-in flow again afterward.
 */
export const wipeAllApplicationData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db.query("documents").collect();
    let storageDeleted = 0;
    for (const doc of docs) {
      try {
        await ctx.storage.delete(doc.storageId);
        storageDeleted++;
      } catch {
        /* blob may already be gone */
      }
      await ctx.db.delete(doc._id);
    }

    for (const row of await ctx.db.query("redactionBoxes").collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of await ctx.db.query("documentAuditEvents").collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of await ctx.db.query("presencePeers").collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of await ctx.db.query("cases").collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of await ctx.db.query("teamMembers").collect()) {
      await ctx.db.delete(row._id);
    }
    for (const row of await ctx.db.query("teams").collect()) {
      await ctx.db.delete(row._id);
    }

    const sessions = await ctx.db.query("sessions").collect();
    for (const s of sessions) {
      await ctx.db.delete(s._id);
    }

    return {
      documents: docs.length,
      storageDeleted,
      sessions: sessions.length,
    };
  },
});
