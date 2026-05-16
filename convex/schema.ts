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
    /** "team" = shared folder/roster only; "case" = matter shown on Cases. Undefined = legacy (treated as team in UI lists). */
    kind: v.optional(v.union(v.literal("team"), v.literal("case"))),
    /** When creating a case, optional label for the Team roster copied into editors. */
    sourceTeamName: v.optional(v.string()),
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

  documentAuditEvents: defineTable({
    documentId: v.id("documents"),
    /** Self-declared user email (no verification). */
    userId: v.string(),
    action: v.union(
      v.literal("document_uploaded"),
      v.literal("document_renamed"),
      v.literal("document_deleted"),
      v.literal("box_created"),
      v.literal("box_moved"),
      v.literal("box_exemption_set"),
      v.literal("box_exemption_cleared"),
      v.literal("box_locked"),
      v.literal("box_deleted"),
    ),
    createdAt: v.number(),
    pageNumber: v.optional(v.number()),
    boxId: v.optional(v.id("redactionBoxes")),
    /** Human-readable summary for the audit UI. */
    summary: v.string(),
  }).index("by_document_time", ["documentId", "createdAt"]),

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

  sessions: defineTable({
    token: v.string(),
    email: v.string(),
    /** Shown in the UI and sent with presence heartbeats; optional. */
    displayName: v.optional(v.string()),
    preferredUploadGroupId: v.optional(v.id("groups")),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"]),
});
