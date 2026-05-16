import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export type AuditAction =
  | "document_uploaded"
  | "document_renamed"
  | "document_deleted"
  | "box_created"
  | "box_moved"
  | "box_exemption_set"
  | "box_exemption_cleared"
  | "box_locked"
  | "box_deleted";

export async function logDocumentAudit(
  ctx: MutationCtx,
  args: {
    documentId: Id<"documents">;
    userId: string;
    action: AuditAction;
    summary: string;
    pageNumber?: number;
    boxId?: Id<"redactionBoxes">;
  },
): Promise<void> {
  await ctx.db.insert("documentAuditEvents", {
    documentId: args.documentId,
    userId: args.userId,
    action: args.action,
    summary: args.summary,
    createdAt: Date.now(),
    pageNumber: args.pageNumber,
    boxId: args.boxId,
  });
}
