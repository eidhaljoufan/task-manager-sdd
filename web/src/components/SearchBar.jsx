import React, { useState, useEffect, useRef } from 'react'

/**
 * SearchBar - Search input with debounce
 * Props: { onSearch }
 * Debounces 300ms before calling onSearch(keyword)
 * Clear button resets the search
 */
function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')
  const debounceTimer = useRef(null)

  useEffect(() => {
    // Clear any pending timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      onSearch(value)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClear = () => {
    setValue('')
    // Clear immediately without waiting for debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    onSearch('')
  }

  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Cari tugas..."
        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Cari tugas"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
          aria-label="Bersihkan pencarian"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SearchBar
