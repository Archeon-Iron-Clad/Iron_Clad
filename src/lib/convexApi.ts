import { makeFunctionReference } from 'convex/server'

/** Untyped function references — works before `convex/_generated` exists; `convex dev` can add stronger types later. */
export const api = {
  documents: {
    create: makeFunctionReference<'mutation'>('documents:create'),
    get: makeFunctionReference<'query'>('documents:get'),
    generateUploadUrl: makeFunctionReference<'mutation'>('documents:generateUploadUrl'),
    getFileUrl: makeFunctionReference<'query'>('documents:getFileUrl'),
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
  profile: {
    current: makeFunctionReference<'query'>('profile:current'),
  },
} as const
