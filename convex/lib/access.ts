import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isGroupMember(
  ctx: Ctx,
  userEmail: string,
  groupId: Id<"groups">,
): Promise<boolean> {
  const row = await ctx.db
    .query("groupMembers")
    .withIndex("by_group_and_user", (q) => q.eq("groupId", groupId).eq("userId", userEmail))
    .unique();
  return row !== null;
}

export async function canAccessDocument(
  ctx: Ctx,
  userEmail: string,
  document: Doc<"documents"> | null,
): Promise<boolean> {
  if (!document) return false;
  if (document.groupId !== undefined) {
    return await isGroupMember(ctx, userEmail, document.groupId);
  }
  if (document.createdBy === undefined) return false;
  return document.createdBy === userEmail;
}

export async function requireDocumentAccess(
  ctx: Ctx,
  userEmail: string,
  documentId: Id<"documents">,
): Promise<Doc<"documents">> {
  const doc = await ctx.db.get(documentId);
  if (!doc) throw new Error("Not found");
  if (!(await canAccessDocument(ctx, userEmail, doc))) {
    throw new Error("Forbidden");
  }
  return doc;
}
