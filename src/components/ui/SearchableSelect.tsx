import { useState, useRef, useEffect, useCallback } from 'react'

export interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  onLoadMore: () => void
  hasMore: boolean
  isLoading?: boolean
  placeholder?: string
  allLabel?: string
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  onSearch,
  onLoadMore,
  hasMore,
  isLoading = false,
  placeholder = 'Search...',
  allLabel = 'All',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus search input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, onSearch])

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el || isLoading || !hasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      onLoadMore()
    }
  }, [isLoading, hasMore, onLoadMore])

  const displayLabel = selectedLabel || options.find((o) => o.value === value)?.label

  const handleSelect = (val: string) => {
    const opt = options.find((o) => o.value === val)
    setSelectedLabel(opt?.label ?? '')
    onChange(val)
    setIsOpen(false)
    setSearch('')
    onSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        className="input-field w-full text-left flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? displayLabel || value : allLabel}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Options list */}
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto"
            onScroll={handleScroll}
          >
            {/* "All" option */}
            <button
              type="button"
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                !value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
              }`}
              onClick={() => handleSelect('')}
            >
              {allLabel}
            </button>

            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  value === option.value
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700'
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}

            {isLoading && (
              <div className="px-4 py-3 text-center text-sm text-gray-400">
                Loading...
              </div>
            )}

            {!isLoading && options.length === 0 && (
              <div className="px-4 py-3 text-center text-sm text-gray-400">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
