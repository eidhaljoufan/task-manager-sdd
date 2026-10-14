import React from 'react'

/**
 * PaginationControls - Navigation controls for paginated lists
 * Props: { currentPage, totalPages, hasNextPage, hasPreviousPage, onNext, onPrev }
 * Does not render if totalPages <= 1
 */
function PaginationControls({ currentPage, totalPages, hasNextPage, hasPreviousPage, onNext, onPrev }) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-4 py-3">
      <button
        onClick={onPrev}
        disabled={!hasPreviousPage}
        className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
          hasPreviousPage
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        ← Sebelumnya
      </button>

      <span className="text-sm text-gray-600 font-medium">
        Halaman {currentPage} dari {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNextPage}
        className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
          hasNextPage
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Berikutnya →
      </button>
    </div>
  )
}

export default PaginationControls
