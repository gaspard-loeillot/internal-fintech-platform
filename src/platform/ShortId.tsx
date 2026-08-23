// Traceability ids are long cuids; show the tail and keep the full id on hover.
export default function ShortId({ id }: { id?: string | null }) {
  if (!id) return <span className="text-xs text-gray-400">—</span>
  return (
    <span title={id} className="font-mono text-xs text-gray-600">
      {id.slice(-6)}
    </span>
  )
}
