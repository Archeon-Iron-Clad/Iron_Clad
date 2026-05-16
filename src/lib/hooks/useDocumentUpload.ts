import { useMutation } from 'convex/react'
import { useCallback, useState } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'
import { api } from '../../../convex/_generated/api'

export function useDocumentUpload(
  userEmail: string,
  groupId: Id<'groups'> | null | undefined,
) {
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl)
  const createDocument = useMutation(api.documents.create)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadPdf = useCallback(
    async (file: File): Promise<Id<'documents'> | null> => {
      setUploading(true)
      setError(null)
      try {
        const postUrl = await generateUploadUrl({ userEmail })
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
          userEmail,
          groupId: groupId ?? undefined,
        })
        return documentId
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed')
        return null
      } finally {
        setUploading(false)
      }
    },
    [createDocument, generateUploadUrl, userEmail, groupId],
  )

  return { uploadPdf, uploading, error }
}
