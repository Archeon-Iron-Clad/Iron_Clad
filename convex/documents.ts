import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { canAccessDocument, canAccessCase, requireDocumentAccess } from "./lib/access";
import { listAccessibleDocuments } from "./lib/accessibleDocuments";
import { logDocumentAudit } from "./lib/auditLog";
import { requireUserEmail } from "./lib/sessionHelpers";

export const create = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    sessionToken: v.string(),
    caseId: v.id("cases"),
  },
  handler: async (ctx, args) => {
    const createdBy = await requireUserEmail(ctx, args.sessionToken);
    const ok = await canAccessCase(ctx, createdBy, args.caseId);
    if (!ok) throw new Error("Forbidden");
    const now = Date.now();
    const documentId = await ctx.db.insert("documents", {
      storageId: args.storageId,
      name: args.name,
      createdBy,
      createdAt: now,
      caseId: args.caseId,
    });

    await logDocumentAudit(ctx, {
      documentId,
      userId: createdBy,
      action: "document_uploaded",
      summary: `Uploaded document "${args.name}"`,
    });

    return documentId;
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

export const rename = mutation({
  args: {
    documentId: v.id("documents"),
    sessionToken: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { documentId, sessionToken, name }) => {
    const userId = await requireUserEmail(ctx, sessionToken);
    const doc = await requireDocumentAccess(ctx, userId, documentId);
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name required");
    await ctx.db.patch(documentId, { name: trimmed });
    await logDocumentAudit(ctx, {
      documentId,
      userId,
      action: "document_renamed",
      summary: `Renamed document from "${doc.name}" to "${trimmed}"`,
    });
  },
});

export const removeDocument = mutation({
  args: {
    documentId: v.id("documents"),
    sessionToken: v.string(),
  },
  handler: async (ctx, { documentId, sessionToken }) => {
    const userId = await requireUserEmail(ctx, sessionToken);
    const doc = await requireDocumentAccess(ctx, userId, documentId);

    await logDocumentAudit(ctx, {
      documentId,
      userId,
      action: "document_deleted",
      summary: `Deleted document "${doc.name}"`,
    });

    const boxes = await ctx.db
      .query("redactionBoxes")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .collect();
    for (const box of boxes) {
      await ctx.db.delete(box._id);
    }

    const peers = await ctx.db
      .query("presencePeers")
      .withIndex("by_document_lastSeen", (q) => q.eq("documentId", documentId))
      .collect();
    for (const peer of peers) {
      await ctx.db.delete(peer._id);
    }

    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(documentId);
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
