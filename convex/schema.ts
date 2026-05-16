import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    storageId: v.id("_storage"),
    name: v.string(),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  redactionBoxes: defineTable({
    documentId: v.id("documents"),
    pageNumber: v.number(),
    /** Normalized 0–1 relative to page width/height (see `src/lib/pdf/coordinateMap.ts`). */
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    status: v.union(v.literal("draft"), v.literal("locked")),
    userId: v.string(),
    updatedAt: v.number(),
  })
    .index("by_document", ["documentId"])
    .index("by_document_page", ["documentId", "pageNumber"])
    .index("by_user_document", ["userId", "documentId"]),

  users: defineTable({
    userId: v.string(),
    displayName: v.optional(v.string()),
    documentId: v.optional(v.id("documents")),
    color: v.optional(v.string()),
    lastSeen: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_document_lastSeen", ["documentId", "lastSeen"]),
});
