import { v } from "convex/values";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

type MutationCtx = GenericMutationCtx<DataModel>;

export async function resolveExemptionForBox(
  ctx: MutationCtx,
  exemptionCodeId: Id<"exemptionCodes">,
) {
  const code = await ctx.db.get(exemptionCodeId);
  if (!code) {
    throw new Error("Exemption code not found");
  }
  if (!code.isActive) {
    throw new Error("Exemption code is archived");
  }
  return {
    exemptionCodeId,
    exemptionShortCodeSnapshot: code.shortCode,
    exemptionTitleSnapshot: code.title,
  };
}

export const list = query({
  args: { includeInactive: v.optional(v.boolean()) },
  handler: async (ctx, { includeInactive }) => {
    const rows = includeInactive
      ? await ctx.db.query("exemptionCodes").collect()
      : await ctx.db
          .query("exemptionCodes")
          .withIndex("by_active_sort", (q) => q.eq("isActive", true))
          .collect();
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    shortCode: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("exemptionCodes").collect();
    const maxSort =
      existing.length === 0
        ? 0
        : Math.max(...existing.map((c) => c.sortOrder));
    return await ctx.db.insert("exemptionCodes", {
      shortCode: args.shortCode,
      title: args.title,
      description: args.description,
      category: args.category,
      sortOrder: args.sortOrder ?? maxSort + 1,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    codeId: v.id("exemptionCodes"),
    shortCode: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { codeId, ...patch }) => {
    const updates: Record<string, unknown> = {};
    if (patch.shortCode !== undefined) updates.shortCode = patch.shortCode;
    if (patch.title !== undefined) updates.title = patch.title;
    if (patch.description !== undefined) updates.description = patch.description;
    if (patch.category !== undefined) updates.category = patch.category;
    if (patch.sortOrder !== undefined) updates.sortOrder = patch.sortOrder;
    if (patch.isActive !== undefined) updates.isActive = patch.isActive;
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(codeId, updates);
    }
  },
});

export const archive = mutation({
  args: { codeId: v.id("exemptionCodes") },
  handler: async (ctx, { codeId }) => {
    await ctx.db.patch(codeId, { isActive: false });
  },
});

const DEFAULT_EXEMPTION_CODES: Array<{
  shortCode: string;
  title: string;
  category: string;
  sortOrder: number;
}> = [
  { shortCode: "(b)(1)", title: "National defense / foreign policy", category: "FOIA", sortOrder: 1 },
  { shortCode: "(b)(2)", title: "Internal personnel rules and practices", category: "FOIA", sortOrder: 2 },
  { shortCode: "(b)(3)", title: "Statute-protected information", category: "FOIA", sortOrder: 3 },
  { shortCode: "(b)(4)", title: "Trade secrets / commercial or financial", category: "FOIA", sortOrder: 4 },
  { shortCode: "(b)(5)", title: "Deliberative process / attorney work product", category: "FOIA", sortOrder: 5 },
  { shortCode: "(b)(6)", title: "Personal privacy", category: "FOIA", sortOrder: 6 },
  { shortCode: "(b)(7)(A)", title: "Law enforcement — interference with proceedings", category: "FOIA", sortOrder: 7 },
  { shortCode: "(b)(7)(B)", title: "Law enforcement — fair trial / impartial adjudication", category: "FOIA", sortOrder: 8 },
  { shortCode: "(b)(7)(C)", title: "Law enforcement — personal privacy", category: "FOIA", sortOrder: 9 },
  { shortCode: "(b)(7)(D)", title: "Law enforcement — confidential source", category: "FOIA", sortOrder: 10 },
  { shortCode: "(b)(7)(E)", title: "Law enforcement — techniques and procedures", category: "FOIA", sortOrder: 11 },
  { shortCode: "(b)(7)(F)", title: "Law enforcement — physical safety", category: "FOIA", sortOrder: 12 },
  { shortCode: "(b)(8)", title: "Financial institution supervision", category: "FOIA", sortOrder: 13 },
  { shortCode: "(b)(9)", title: "Geological and geophysical information", category: "FOIA", sortOrder: 14 },
  { shortCode: "A-C Priv", title: "Attorney-client privilege", category: "privilege", sortOrder: 15 },
  { shortCode: "W-P Priv", title: "Work product privilege", category: "privilege", sortOrder: 16 },
  { shortCode: "Delib", title: "Deliberative material", category: "privilege", sortOrder: 17 },
  { shortCode: "PII", title: "Personally identifiable information", category: "privacy", sortOrder: 18 },
  { shortCode: "HIPAA", title: "Health information (HIPAA)", category: "privacy", sortOrder: 19 },
  { shortCode: "FERPA", title: "Student education records (FERPA)", category: "privacy", sortOrder: 20 },
  { shortCode: "SSN", title: "Social Security numbers", category: "privacy", sortOrder: 21 },
  { shortCode: "FIN", title: "Financial account numbers", category: "privacy", sortOrder: 22 },
  { shortCode: "LE", title: "Law enforcement sensitive", category: "law enforcement", sortOrder: 23 },
  { shortCode: "HS", title: "Homeland security sensitive", category: "security", sortOrder: 24 },
  { shortCode: "CI", title: "Confidential informant", category: "law enforcement", sortOrder: 25 },
  { shortCode: "VIC", title: "Victim identifying information", category: "privacy", sortOrder: 26 },
  { shortCode: "MINOR", title: "Minor identifying information", category: "privacy", sortOrder: 27 },
  { shortCode: "OTHER", title: "Other — see notes", category: "general", sortOrder: 28 },
];

/** Idempotent seed: adds any standard codes missing by shortCode. */
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("exemptionCodes").collect();
    const have = new Set(existing.map((c) => c.shortCode));
    let added = 0;
    for (const row of DEFAULT_EXEMPTION_CODES) {
      if (have.has(row.shortCode)) continue;
      await ctx.db.insert("exemptionCodes", {
        ...row,
        isActive: true,
      });
      added++;
    }
    return { seeded: added > 0, added, total: DEFAULT_EXEMPTION_CODES.length };
  },
});
