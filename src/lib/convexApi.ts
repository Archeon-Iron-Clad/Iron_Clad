import { makeFunctionReference } from 'convex/server'

/** Untyped function references — works before `convex/_generated` exists; `convex dev` can add stronger types later. */
export const api = {
  documents: {
    create: makeFunctionReference<'mutation'>('documents:create'),
    get: makeFunctionReference<'query'>('documents:get'),
    listAccessible: makeFunctionReference<'query'>('documents:listAccessible'),
    generateUploadUrl: makeFunctionReference<'mutation'>('documents:generateUploadUrl'),
    getFileUrl: makeFunctionReference<'query'>('documents:getFileUrl'),
    rename: makeFunctionReference<'mutation'>('documents:rename'),
    removeDocument: makeFunctionReference<'mutation'>('documents:removeDocument'),
  },
  teams: {
    createCollaborative: makeFunctionReference<'mutation'>('teams:createCollaborative'),
    listTeamsWithCases: makeFunctionReference<'query'>('teams:listTeamsWithCases'),
    listMembers: makeFunctionReference<'query'>('teams:listMembers'),
    addMember: makeFunctionReference<'mutation'>('teams:addMember'),
    removeMember: makeFunctionReference<'mutation'>('teams:removeMember'),
    deleteCollaborativeTeam: makeFunctionReference<'mutation'>('teams:deleteCollaborativeTeam'),
  },
  cases: {
    create: makeFunctionReference<'mutation'>('cases:create'),
    deleteCaseAndDocuments: makeFunctionReference<'mutation'>('cases:deleteCaseAndDocuments'),
    getTeamForCase: makeFunctionReference<'query'>('cases:getTeamForCase'),
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
  exportRedaction: {
    requestReleaseExport: makeFunctionReference<'action'>('exportRedaction:requestReleaseExport'),
  },
  presence: {
    heartbeat: makeFunctionReference<'mutation'>('presence:heartbeat'),
    leaveDocument: makeFunctionReference<'mutation'>('presence:leaveDocument'),
    listPresentInDocument: makeFunctionReference<'query'>('presence:listPresentInDocument'),
  },
} as const
