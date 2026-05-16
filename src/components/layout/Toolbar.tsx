import { Download, FileLock2, Upload } from 'lucide-react'
import { Button } from '../ui/Button'

type Props = {
  onUploadClick?: () => void
  onExportClick?: () => void
}

export function Toolbar({ onUploadClick, onExportClick }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <FileLock2 className="size-6 text-zinc-800" aria-hidden />
        <div>
          <h1 className="text-base font-semibold text-zinc-900">Iron-Clad</h1>
          <p className="text-xs text-zinc-500">Collaborative legal redactor</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="gap-1.5" onClick={onUploadClick}>
          <Upload className="size-4" />
          Upload PDF
        </Button>
        <Button className="gap-1.5" onClick={onExportClick}>
          <Download className="size-4" />
          Export
        </Button>
      </div>
    </header>
  )
}
