import { makeFunctionReference } from 'convex/server'

/** Untyped function references — works before `convex/_generated` exists; `convex dev` can add stronger types later. */
export const api = {
  documents: {
    create: makeFunctionReference<'mutation'>('documents:create'),
    get: makeFunctionReference<'query'>('documents:get'),
    listAccessible: makeFunctionReference<'query'>('documents:listAccessible'),
    generateUploadUrl: makeFunctionReference<'mutation'>('documents:generateUploadUrl'),
    getFileUrl: makeFunctionReference<'query'>('documents:getFileUrl'),
  },
  groups: {
    create: makeFunctionReference<'mutation'>('groups:create'),
    listMyGroups: makeFunctionReference<'query'>('groups:listMyGroups'),
    listMembers: makeFunctionReference<'query'>('groups:listMembers'),
    addMember: makeFunctionReference<'mutation'>('groups:addMember'),
    removeMember: makeFunctionReference<'mutation'>('groups:removeMember'),
  },
  exemptionCodes: {
    list: makeFunctionReference<'query'>('exemptionCodes:list'),
    create: makeFunctionReference<'mutation'>('exemptionCodes:create'),
    update: makeFunctionReference<'mutation'>('exemptionCodes:update'),
    archive: makeFunctionReference<'mutation'>('exemptionCodes:archive'),
    seedDefaults: makeFunctionReference<'mutation'>('exemptionCodes:seedDefaults'),
  },
  redactions: {
    listByDocument: makeFunctionReference<'query'>('redactions:listByDocument'),
    createBox: makeFunctionReference<'mutation'>('redactions:createBox'),
    updateBox: makeFunctionReference<'mutation'>('redactions:updateBox'),
    deleteBox: makeFunctionReference<'mutation'>('redactions:deleteBox'),
  },
  presence: {
    heartbeat: makeFunctionReference<'mutation'>('presence:heartbeat'),
    leaveDocument: makeFunctionReference<'mutation'>('presence:leaveDocument'),
    listPresentInDocument: makeFunctionReference<'query'>('presence:listPresentInDocument'),
  },
} as const
