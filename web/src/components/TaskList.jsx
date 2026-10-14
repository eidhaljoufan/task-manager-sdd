import React from 'react'
import TaskCard from './TaskCard.jsx'

/**
 * TaskList - Renders a list of TaskCard components
 * Props: { tasks, onComplete, onEdit, onDelete }
 */
function TaskList({ tasks, onComplete, onEdit, onDelete }) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500 text-base">Tidak ada tugas ditemukan</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TaskList
