import React, { useState } from 'react'

/**
 * FilterBar - Filter controls for status and priority
 * Props: { onFilterChange }
 * onFilterChange({ status, priority }) — null for "Semua" options
 */
function FilterBar({ onFilterChange }) {
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')

  const handleStatusChange = (e) => {
    const value = e.target.value
    setStatus(value)
    onFilterChange({ status: value || null, priority: priority || null })
  }

  const handlePriorityChange = (e) => {
    const value = e.target.value
    setPriority(value)
    onFilterChange({ status: status || null, priority: value || null })
  }

  const handleReset = () => {
    setStatus('')
    setPriority('')
    onFilterChange({ status: null, priority: null })
  }

  const hasActiveFilter = status || priority

  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      {/* Status filter */}
      <select
        value={status}
        onChange={handleStatusChange}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        aria-label="Filter status"
      >
        <option value="">Semua Status</option>
        <option value="Incomplete">Incomplete</option>
        <option value="Completed">Completed</option>
      </select>

      {/* Priority filter */}
      <select
        value={priority}
        onChange={handlePriorityChange}
        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        aria-label="Filter prioritas"
      >
        <option value="">Semua Prioritas</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      {/* Reset button — only show when filter is active */}
      {hasActiveFilter && (
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          Reset Filter
        </button>
      )}
    </div>
  )
}

export default FilterBar
