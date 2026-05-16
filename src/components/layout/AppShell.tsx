import type { ReactNode } from 'react'
import { Toolbar } from './Toolbar'

type Props = {
  children: ReactNode
  onUploadClick?: () => void
  onExportClick?: () => void
}

export function AppShell({ children, onUploadClick, onExportClick }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900">
      <Toolbar onUploadClick={onUploadClick} onExportClick={onExportClick} />
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
    </div>
  )
}
