import React from 'react'

/**
 * TaskCard - Display component for a single task
 * Props: { task, onComplete, onEdit, onDelete }
 */
function TaskCard({ task, onComplete, onEdit, onDelete }) {
  const isCompleted = task.status === 'Completed'

  // Determine if task is overdue: incomplete AND due_date < today
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = !isCompleted && task.due_date && task.due_date < today

  // Priority badge styles
  const priorityStyles = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-green-100 text-green-800',
  }

  const priorityBadge = priorityStyles[task.priority] || 'bg-gray-100 text-gray-800'

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 flex flex-col gap-2 transition-all ${
        isOverdue ? 'border-2 border-red-500' : 'border border-gray-200'
      }`}
    >
      {/* Header: status icon + title */}
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 text-lg leading-none flex-shrink-0 ${
            isCompleted ? 'text-green-500' : 'text-gray-400'
          }`}
          aria-label={isCompleted ? 'Selesai' : 'Belum selesai'}
        >
          {isCompleted ? '✓' : '○'}
        </span>
        <h3
          className={`text-base font-semibold break-words flex-1 ${
            isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {task.title}
        </h3>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 ml-7 break-words">{task.description}</p>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2 ml-7">
        {/* Priority badge */}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityBadge}`}>
          {task.priority}
        </span>

        {/* Status badge */}
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isCompleted
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {task.status}
        </span>

        {/* Due date */}
        {task.due_date && (
          <span className="text-xs text-gray-500">📅 {task.due_date}</span>
        )}

        {/* Overdue indicator — only for incomplete tasks */}
        {isOverdue && (
          <span className="text-xs font-semibold text-red-600">
            ⚠️ Terlambat
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-1 ml-7">
        <button
          onClick={() => onComplete(task.id)}
          disabled={isCompleted}
          className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
            isCompleted
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Selesai
        </button>
        <button
          onClick={() => onEdit(task)}
          className="text-xs px-3 py-1 rounded font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task)}
          className="text-xs px-3 py-1 rounded font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  )
}

export default TaskCard
