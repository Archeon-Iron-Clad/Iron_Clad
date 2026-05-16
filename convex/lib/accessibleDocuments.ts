import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

/** Personal + group documents accessible to normalized email `u`. */
export async function listAccessibleDocuments(ctx: Ctx, u: string): Promise<Doc<"documents">[]> {
  if (!u.includes("@")) return [];

  const personal = await ctx.db
    .query("documents")
    .withIndex("by_createdBy", (q) => q.eq("createdBy", u))
    .collect();

  const memberships = await ctx.db
    .query("groupMembers")
    .withIndex("by_user", (q) => q.eq("userId", u))
    .collect();

  const groupDocs: Doc<"documents">[] = [];
  for (const m of memberships) {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_group", (q) => q.eq("groupId", m.groupId))
      .collect();
    groupDocs.push(...docs);
  }

  const seen = new Set<string>();
  const merged: Doc<"documents">[] = [];
  for (const d of [...personal, ...groupDocs]) {
    const id = d._id as string;
    if (seen.has(id)) continue;
    seen.add(id);
    merged.push(d);
  }

  return merged.sort((a, b) => b.createdAt - a.createdAt);
}
