import { Icon } from '../components/ui/Icon'

type Props = {
  title: string
  description: string
  icon?: string
}

export function PlaceholderPage({ title, description, icon = 'construction' }: Props) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface p-12 text-center">
      <Icon name={icon} className="mb-4 text-on-surface-variant" size={56} />
      <h2 className="text-2xl font-bold text-on-surface">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-on-surface-variant">{description}</p>
    </div>
  )
}
