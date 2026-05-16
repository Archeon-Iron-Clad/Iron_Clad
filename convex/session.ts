import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { isGroupMember, normalizeEmail } from "./lib/access";
import { getSessionDoc } from "./lib/sessionHelpers";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function randomTokenHex(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const signInWithEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = normalizeEmail(email);
    if (!normalized.includes("@")) throw new Error("Invalid email");

    const now = Date.now();
    const token = randomTokenHex();
    await ctx.db.insert("sessions", {
      token,
      email: normalized,
      preferredUploadGroupId: undefined,
      createdAt: now,
      expiresAt: now + SESSION_TTL_MS,
    });

    return { sessionToken: token };
  },
});

export const getSession = query({  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const s = await getSessionDoc(ctx, sessionToken);
    if (!s) return null;
    return {
      email: s.email,
      displayName: s.displayName ?? null,
      preferredUploadGroupId: s.preferredUploadGroupId ?? null,
      expiresAt: s.expiresAt,
    };
  },
});

export const revokeSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    const s = await getSessionDoc(ctx, sessionToken);
    if (s) await ctx.db.delete(s._id);
  },
});

export const setDisplayName = mutation({
  args: {
    sessionToken: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, { sessionToken, displayName }) => {
    const session = await getSessionDoc(ctx, sessionToken);
    if (!session) throw new Error("Unauthorized");
    const trimmed = displayName.trim();
    const next = trimmed.length === 0 ? undefined : trimmed.slice(0, 64);
    await ctx.db.patch(session._id, { displayName: next });
    return { ok: true as const };
  },
});

export const setPreferredUploadGroup = mutation({
  args: {
    sessionToken: v.string(),
    scope: v.union(v.literal("personal"), v.id("groups")),
  },
  handler: async (ctx, { sessionToken, scope }) => {
    const session = await getSessionDoc(ctx, sessionToken);
    if (!session) throw new Error("Unauthorized");
    const email = session.email;

    let nextGroup: typeof session.preferredUploadGroupId;
    if (scope === "personal") {
      nextGroup = undefined;
    } else {
      const ok = await isGroupMember(ctx, email, scope);
      if (!ok) throw new Error("Forbidden");
      nextGroup = scope;
    }

    await ctx.db.patch(session._id, { preferredUploadGroupId: nextGroup });
    return { ok: true as const };
  },
});
