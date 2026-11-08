import { useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { fontCategories, fontFamilies, fontLibrary, fontStack } from './fonts'
import type { FontFamily } from './fonts'

const pageSize = 6

type Props = {
  value?: FontFamily
  onChange: (family?: FontFamily) => void
}

export default function FontPicker({ value, onChange }: Props) {
  const panelId = useId()
  const toggle = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(0)

  const search = query.trim().toLowerCase()
  const matches = fontFamilies.filter(
    (family) =>
      (!category || fontLibrary[family] === category) &&
      family.toLowerCase().includes(search)
  )
  const options = matches.slice(page * pageSize, (page + 1) * pageSize)
  const pageCount = Math.ceil(matches.length / pageSize)

  const close = () => {
    setOpen(false)
    toggle.current?.focus()
  }
  const choose = (family?: FontFamily) => {
    onChange(family)
    close()
  }

  return (
    <div
      className="font-picker"
      onKeyDown={(event) => {
        if (open && event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          close()
        }
      }}
    >
      <button
        ref={toggle}
        className="font-picker-toggle"
        type="button"
        aria-controls={panelId}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Font family
        <span style={{ fontFamily: value && fontStack(value) }}>
          {value ?? 'Default'}
        </span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>
      <div id={panelId} hidden={!open}>
        {open && (
          <div className="font-picker-panel">
            <div className="font-picker-filters">
              <input
                type="search"
                aria-label="Search fonts"
                placeholder="Search fonts"
                value={query}
                onChange={(event) => {
                  setQuery(event.currentTarget.value)
                  setPage(0)
                }}
              />
              <select
                aria-label="Font category"
                value={category}
                onChange={(event) => {
                  setCategory(event.currentTarget.value)
                  setPage(0)
                }}
              >
                <option value="">All categories</option>
                {fontCategories.map((name) => (
                  <option key={name}>{name}</option>
                ))}
              </select>
            </div>
            {options.length ? (
              <div className="font-picker-results">
                {options.map((family) => (
                  <button
                    type="button"
                    key={family}
                    aria-pressed={family === value}
                    style={{ fontFamily: fontStack(family) }}
                    onClick={() => choose(family)}
                  >
                    {family}
                  </button>
                ))}
              </div>
            ) : (
              <p role="status">No matching fonts.</p>
            )}
            <div className="font-picker-footer">
              <button type="button" onClick={() => choose()} disabled={!value}>
                Use default
              </button>
              {pageCount > 1 && (
                <div
                  className="font-picker-pages"
                  aria-label="Font pages"
                  role="group"
                >
                  <button
                    type="button"
                    disabled={!page}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>
                  <span aria-live="polite">
                    {page + 1} / {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={page === pageCount - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
