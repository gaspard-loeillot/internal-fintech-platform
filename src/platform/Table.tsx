'use client'

import { useMemo, useState, type ReactNode } from 'react'

export type TableColumn = {
  header: string
  sortable?: boolean
  align?: 'left' | 'right'
}

export type TableRow = {
  key: string
  cells: ReactNode[]
  // One entry per column; only read for sortable columns. Dates are passed as
  // epoch millis so ordering stays chronological.
  sortValues?: (string | number | null | undefined)[]
}

type Sort = { index: number; dir: 'asc' | 'desc' }

function compare(a: string | number | null | undefined, b: string | number | null | undefined) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true })
}

export default function Table({
  columns,
  rows,
  empty = 'Nothing here yet.',
  emptyHint,
}: {
  columns: TableColumn[]
  rows: TableRow[]
  empty?: string
  emptyHint?: string
}) {
  const [sort, setSort] = useState<Sort | null>(null)

  const sorted = useMemo(() => {
    if (!sort) return rows
    const factor = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort(
      (a, b) => factor * compare(a.sortValues?.[sort.index], b.sortValues?.[sort.index]),
    )
  }, [rows, sort])

  function toggle(index: number) {
    setSort((current) =>
      current?.index === index
        ? { index, dir: current.dir === 'asc' ? 'desc' : 'asc' }
        : { index, dir: 'asc' },
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            {columns.map((column, index) => {
              const active = sort?.index === index
              const alignment = column.align === 'right' ? 'text-right' : 'text-left'
              if (!column.sortable) {
                return (
                  <th
                    key={column.header}
                    className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 ${alignment}`}
                  >
                    {column.header}
                  </th>
                )
              }
              return (
                <th key={column.header} className={`p-0 ${alignment}`}>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-label={`Sort by ${column.header}`}
                    className={`flex w-full cursor-pointer items-center gap-1 px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 transition-all duration-150 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset ${
                      column.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {column.header}
                    <span
                      aria-hidden
                      className={active ? 'text-blue-600' : 'text-gray-300'}
                    >
                      {active && sort.dir === 'desc' ? '▼' : '▲'}
                    </span>
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <p className="text-sm text-gray-500">{empty}</p>
                {emptyHint && <p className="mt-1 text-xs text-gray-500">{emptyHint}</p>}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={row.key}
                className="border-t border-gray-100 align-middle transition-colors duration-150 hover:bg-gray-50"
              >
                {row.cells.map((cell, index) => (
                  <td
                    key={columns[index]?.header ?? index}
                    className={`px-4 py-3 ${columns[index]?.align === 'right' ? 'text-right tabular-nums' : ''}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
