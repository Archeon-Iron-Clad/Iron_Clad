type Props = { title: string; description: string }

export function SimpleRightPanel({ title, description }: Props) {
  return (
    <aside className="fixed right-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-80 flex-col border-l border-outline-variant bg-surface-bright p-6">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
    </aside>
  )
}
