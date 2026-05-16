import { v } from "convex/values";
import { query } from "./_generated/server";
import { listAccessibleDocuments } from "./lib/accessibleDocuments";
import { requireUserEmail } from "./lib/sessionHelpers";

export const recentRedactionActivity = query({
  args: { sessionToken: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { sessionToken, limit }) => {
    const u = await requireUserEmail(ctx, sessionToken);
    const docs = await listAccessibleDocuments(ctx, u);
    const lim = Math.min(Math.max(limit ?? 40, 1), 100);

    const rows: {
      boxId: string;
      documentId: string;
      documentName: string;
      pageNumber: number;
      status: "draft" | "locked";
      userId: string;
      updatedAt: number;
      exemptionShortCodeSnapshot: string | undefined;
    }[] = [];

    for (const d of docs) {
      const boxes = await ctx.db
        .query("redactionBoxes")
        .withIndex("by_document", (q) => q.eq("documentId", d._id))
        .collect();

      for (const b of boxes) {
        rows.push({
          boxId: b._id,
          documentId: d._id,
          documentName: d.name,
          pageNumber: b.pageNumber,
          status: b.status,
          userId: b.userId,
          updatedAt: b.updatedAt,
          exemptionShortCodeSnapshot: b.exemptionShortCodeSnapshot,
        });
      }
    }

    rows.sort((a, b) => b.updatedAt - a.updatedAt);
    return rows.slice(0, lim);
  },
});
