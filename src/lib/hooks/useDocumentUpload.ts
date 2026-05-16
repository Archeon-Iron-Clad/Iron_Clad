import { useMutation } from 'convex/react'
import { useCallback, useState } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'
import { api } from '../../../convex/_generated/api'

export function useDocumentUpload(sessionToken: string, groupId: Id<'groups'> | null | undefined) {
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)
  const createDocument = useMutation(api.documents.create)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPdf = useCallback(
    async (
      file: File,
      documentGroupId?: Id<'groups'> | null,
      options?: { quiet?: boolean },
    ): Promise<Id<'documents'> | null> => {
      let resolved: Id<'groups'> | undefined
      if (documentGroupId !== undefined) {
        resolved = documentGroupId === null ? undefined : documentGroupId
      } else {
        resolved = groupId ?? undefined
      }

      const quiet = options?.quiet ?? false
      if (!quiet) {
        setUploading(true)
        setError(null)
      }
      try {
        const postUrl = await generateUploadUrl({ sessionToken })
        const result = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type || 'application/pdf' },
          body: file,
        })
        if (!result.ok) throw new Error('Upload failed')
        const { storageId } = (await result.json()) as { storageId: Id<'_storage'> }
        const documentId = await createDocument({
          storageId,
          name: file.name,
          sessionToken,
          groupId: resolved,
        })
        return documentId
      } catch (e) {
        if (!quiet) setError(e instanceof Error ? e.message : 'Upload failed')
        return null
      } finally {
        if (!quiet) setUploading(false)
      }
    },
    [createDocument, generateUploadUrl, sessionToken, groupId],
  )

  return { uploadPdf, uploading, error }
}
