import { useMutation } from 'convex/react'
import { useCallback, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

export function useDocumentUpload(sessionToken: string, activeCaseId: Id<'cases'> | null | undefined) {
  const [error, setError] = useState<string | null>(null)
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)
  const createDocument = useMutation(api.documents.create)

  const uploadPdf = useCallback(
    async (
      file: File,
      documentCaseId?: Id<'cases'> | null,
      opts?: { quiet?: boolean },
    ): Promise<Id<'documents'> | undefined> => {
      const resolvedCase = documentCaseId !== undefined && documentCaseId !== null ? documentCaseId : activeCaseId
      if (!resolvedCase) {
        if (!opts?.quiet) setError('Choose a matter (case) before uploading.')
        return undefined
      }
      setError(null)
      try {
        const uploadUrl = await generateUploadUrl({ sessionToken })

        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type || 'application/pdf' },
          body: file,
        })
        const json = (await res.json()) as { storageId?: Id<'_storage'> }
        const storageId = json.storageId
        if (!storageId) throw new Error('Missing storage handle from upload response.')

        const documentId = await createDocument({
          storageId,
          name: file.name,
          sessionToken,
          caseId: resolvedCase,
        })
        return documentId as Id<'documents'>
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not upload file.'
        if (!opts?.quiet) setError(msg)
        return undefined
      }
    },
    [createDocument, generateUploadUrl, sessionToken, activeCaseId],
  )

  return { uploadPdf, error }
}
