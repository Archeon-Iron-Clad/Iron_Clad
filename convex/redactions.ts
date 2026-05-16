import { v } from "convex/values";
import { resolveExemptionForBox } from "./exemptionCodes";
import { mutation, query } from "./_generated/server";
import { requireDocumentAccess } from "./lib/access";
import { logDocumentAudit } from "./lib/auditLog";
import { requireUserEmail } from "./lib/sessionHelpers";

export const listByDocument = query({
  args: { documentId: v.id("documents"), sessionToken: v.string() },
  handler: async (ctx, { documentId, sessionToken }) => {
    const u = await requireUserEmail(ctx, sessionToken);
    await requireDocumentAccess(ctx, u, documentId);
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
    status: v.union(v.literal("draft"), v.literal("locked")),
    sessionToken: v.string(),
    exemptionCodeId: v.optional(v.id("exemptionCodes")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserEmail(ctx, args.sessionToken);

    await requireDocumentAccess(ctx, userId, args.documentId);

    const now = Date.now();
    const exemption = args.exemptionCodeId
      ? await resolveExemptionForBox(ctx, args.exemptionCodeId)
      : {};

    const boxId = await ctx.db.insert("redactionBoxes", {
      documentId: args.documentId,
      pageNumber: args.pageNumber,
      x: args.x,
      y: args.y,
      width: args.width,
      height: args.height,
      status: args.status,
      userId,
      updatedAt: now,
      ...exemption,
    });

    await logDocumentAudit(ctx, {
      documentId: args.documentId,
      userId,
      action: "box_created",
      pageNumber: args.pageNumber,
      boxId,
      summary: `Added redaction on page ${args.pageNumber}`,
    });

    return boxId;
  },
});

export const updateBox = mutation({
  args: {
    boxId: v.id("redactionBoxes"),
    sessionToken: v.string(),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    status: v.optional(v.union(v.literal("draft"), v.literal("locked"))),
    exemptionCodeId: v.optional(v.id("exemptionCodes")),
    clearExemption: v.optional(v.literal(true)),
  },
  handler: async (ctx, { boxId, sessionToken, exemptionCodeId, clearExemption, ...patch }) => {
    if (clearExemption && exemptionCodeId !== undefined) {
      throw new Error("Cannot set exemptionCodeId and clearExemption together");
    }

    const userId = await requireUserEmail(ctx, sessionToken);
    const box = await ctx.db.get(boxId);
    if (!box) throw new Error("Not found");
    await requireDocumentAccess(ctx, userId, box.documentId);
    if (box.userId !== userId) {
      throw new Error("Forbidden");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    const moved =
      patch.x !== undefined ||
      patch.y !== undefined ||
      patch.width !== undefined ||
      patch.height !== undefined;

    if (patch.x !== undefined) updates.x = patch.x;
    if (patch.y !== undefined) updates.y = patch.y;
    if (patch.width !== undefined) updates.width = patch.width;
    if (patch.height !== undefined) updates.height = patch.height;
    if (patch.status !== undefined) updates.status = patch.status;

    if (clearExemption) {
      updates.exemptionCodeId = undefined;
      updates.exemptionShortCodeSnapshot = undefined;
      updates.exemptionTitleSnapshot = undefined;
    } else if (exemptionCodeId !== undefined) {
      const exemption = await resolveExemptionForBox(ctx, exemptionCodeId);
      Object.assign(updates, exemption);
    }

    await ctx.db.patch(boxId, updates);

    if (moved) {
      await logDocumentAudit(ctx, {
        documentId: box.documentId,
        userId,
        action: "box_moved",
        pageNumber: box.pageNumber,
        boxId,
        summary: `Moved redaction on page ${box.pageNumber}`,
      });
    }

    if (patch.status === "locked") {
      await logDocumentAudit(ctx, {
        documentId: box.documentId,
        userId,
        action: "box_locked",
        pageNumber: box.pageNumber,
        boxId,
        summary: `Locked redaction on page ${box.pageNumber}`,
      });
    }

    if (clearExemption) {
      await logDocumentAudit(ctx, {
        documentId: box.documentId,
        userId,
        action: "box_exemption_cleared",
        pageNumber: box.pageNumber,
        boxId,
        summary: `Cleared exemption on page ${box.pageNumber}`,
      });
    } else if (exemptionCodeId !== undefined) {
      const code = await ctx.db.get(exemptionCodeId);
      const label = code?.shortCode ?? "exemption";
      await logDocumentAudit(ctx, {
        documentId: box.documentId,
        userId,
        action: "box_exemption_set",
        pageNumber: box.pageNumber,
        boxId,
        summary: `Applied exemption ${label} on page ${box.pageNumber}`,
      });
    }
  },
});

export const deleteBox = mutation({
  args: { boxId: v.id("redactionBoxes"), sessionToken: v.string() },
  handler: async (ctx, { boxId, sessionToken }) => {
    const userId = await requireUserEmail(ctx, sessionToken);
    const box = await ctx.db.get(boxId);
    if (!box) throw new Error("Not found");
    await requireDocumentAccess(ctx, userId, box.documentId);
    if (box.userId !== userId) {
      throw new Error("Forbidden");
    }
    await logDocumentAudit(ctx, {
      documentId: box.documentId,
      userId,
      action: "box_deleted",
      pageNumber: box.pageNumber,
      boxId,
      summary: `Deleted redaction on page ${box.pageNumber}`,
    });

    await ctx.db.delete(boxId);
  },
});
