import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  exemptionCodes: defineTable({
    shortCode: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
  }).index("by_active_sort", ["isActive", "sortOrder"]),

  groups: defineTable({
    name: v.string(),
    /** Self-declared email (no verification). */
    createdBy: v.string(),
    createdAt: v.number(),
  }),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    /** Normalized email */
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  documents: defineTable({
    storageId: v.id("_storage"),
    name: v.string(),
    /** Self-declared email (no verification). */
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    /** Set when the document is shared with everyone in this group. */
    groupId: v.optional(v.id("groups")),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_createdBy", ["createdBy"])
    .index("by_group", ["groupId"])
    .index("by_storageId", ["storageId"]),

  redactionBoxes: defineTable({
    documentId: v.id("documents"),
    pageNumber: v.number(),
    /** Normalized 0–1 relative to page width/height (see `src/lib/pdf/coordinateMap.ts`). */
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    status: v.union(v.literal("draft"), v.literal("locked")),
    /** Self-declared user email (no verification). */
    userId: v.string(),
    updatedAt: v.number(),
    exemptionCodeId: v.optional(v.id("exemptionCodes")),
    exemptionShortCodeSnapshot: v.optional(v.string()),
    exemptionTitleSnapshot: v.optional(v.string()),
  })
    .index("by_document", ["documentId"])
    .index("by_document_page", ["documentId", "pageNumber"])
    .index("by_user_document", ["userId", "documentId"]),

  presencePeers: defineTable({
    /** Self-declared user email (no verification). */
    userId: v.string(),
    displayName: v.optional(v.string()),
    documentId: v.optional(v.id("documents")),
    color: v.optional(v.string()),
    lastSeen: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_document_lastSeen", ["documentId", "lastSeen"]),
});
