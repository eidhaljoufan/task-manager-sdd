import React from 'react'

/**
 * ConfirmationDialog - Reusable modal confirmation dialog
 * Props: { isOpen, title, message, onConfirm, onCancel }
 * Only renders when isOpen === true
 */
function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    /* Dark overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onCancel}
    >
      {/* Dialog box */}
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded font-medium text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded font-medium text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
