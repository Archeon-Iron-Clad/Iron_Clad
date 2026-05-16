import { Icon } from '../ui/Icon'

export function RedactionGuidance() {
  return (
    <details className="mb-4 rounded border border-outline-variant bg-surface-container-low text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2 font-semibold text-on-surface">
        <Icon name="info" size={18} className="text-secondary" />
        How redaction works in Iron Clad
      </summary>
      <div className="space-y-3 border-t border-outline-variant px-4 py-3 text-on-surface-variant">
        <p>
          <strong className="text-on-surface">Review here (PDF).</strong> Mark regions on the PDF;
          coordinates are stored relative to the page viewport so boxes stay aligned when you zoom.
        </p>
        <p>
          <strong className="text-on-surface">Office sources.</strong> If the original was Word,
          run Inspect Document and replace confidential text with placeholders such as{' '}
          <code className="rounded bg-surface px-1">[Redacted]</code> before converting to PDF —
          that step is not done inside this app.
        </p>
        <p>
          <strong className="text-on-surface">Preview export</strong> draws black rectangles for
          reading only — text under them can still be copied.
        </p>
        <p>
          <strong className="text-on-surface">Release export</strong> rasterizes each page that has
          redactions so underlying text is gone (not copy-pasteable). Use Release for production.
        </p>
        <p className="text-xs">
          Browser Ctrl+A does not perform secure redaction; use Marquee or Select text tools to mark
          regions deliberately.
        </p>
      </div>
    </details>
  )
}
