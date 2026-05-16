import { v } from "convex/values";
import { query } from "./_generated/server";
import { listAccessibleDocuments } from "./lib/accessibleDocuments";
import { requireUserEmail } from "./lib/sessionHelpers";

export const summaryForUser = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const u = await requireUserEmail(ctx, sessionToken);
    const docs = await listAccessibleDocuments(ctx, u);

    let totalDraft = 0;
    let totalLocked = 0;
    const items: {
      documentId: string;
      name: string;
      createdAt: number;
      caseId: string;
      draftCount: number;
      lockedCount: number;
      lastActivityAt: number;
    }[] = [];

    for (const d of docs) {
      const boxes = await ctx.db
        .query("redactionBoxes")
        .withIndex("by_document", (q) => q.eq("documentId", d._id))
        .collect();

      let draftCount = 0;
      let lockedCount = 0;
      let lastBox = 0;
      for (const b of boxes) {
        if (b.status === "draft") draftCount += 1;
        else lockedCount += 1;
        if (b.updatedAt > lastBox) lastBox = b.updatedAt;
      }
      totalDraft += draftCount;
      totalLocked += lockedCount;
      items.push({
        documentId: d._id,
        name: d.name,
        createdAt: d.createdAt,
        caseId: d.caseId as string,
        draftCount,
        lockedCount,
        lastActivityAt: Math.max(lastBox, d.createdAt),
      });
    }

    items.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

    return {
      totals: {
        documentCount: docs.length,
        draftBoxes: totalDraft,
        lockedBoxes: totalLocked,
      },
      documents: items,
    };
  },
});
