export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700 ring-gray-300',
  info: 'bg-blue-100 text-blue-700 ring-blue-300',
  success: 'bg-green-100 text-green-700 ring-green-300',
  warning: 'bg-amber-100 text-amber-800 ring-amber-300',
  danger: 'bg-red-100 text-red-700 ring-red-300',
}

export default function StatusBadge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  )
}
