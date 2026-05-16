type Collaborator = { userId: string; displayName?: string; color?: string }

type Props = {
  collaborators: Collaborator[]
}

export function CollaboratorList({ collaborators }: Props) {
  if (collaborators.length === 0) {
    return <p className="text-sm text-zinc-500">No one else in this document yet.</p>
  }

  return (
    <ul className="flex flex-col gap-1 text-sm">
      {collaborators.map((c) => (
        <li key={c.userId} className="flex items-center gap-2 text-zinc-700">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: c.color ?? '#71717a' }}
          />
          <span>{c.displayName ?? c.userId.slice(0, 8)}</span>
        </li>
      ))}
    </ul>
  )
}
