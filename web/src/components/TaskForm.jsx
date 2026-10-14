import React, { useState, useEffect } from 'react'

/**
 * TaskForm - Form for creating or editing a task
 * Props: { initialData, onSubmit, onCancel, isEdit }
 *
 * initialData: task object when editing, null when creating
 * isEdit: boolean — true shows "Perbarui Tugas", false shows "Buat Tugas Baru"
 * onSubmit({ title, description, priority, due_date }): called with form values
 * onCancel(): called when user clicks cancel
 */
function TaskForm({ initialData = null, onSubmit, onCancel, isEdit = false }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [errors, setErrors] = useState({})

  // Pre-fill fields when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setPriority(initialData.priority || 'Medium')
      setDueDate(initialData.due_date || '')
    } else {
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setDueDate('')
    }
    setErrors({})
  }, [initialData])

  const validate = () => {
    const newErrors = {}
    if (!title || title.trim() === '') {
      newErrors.title = 'Judul wajib diisi'
    } else if (title.length > 255) {
      newErrors.title = 'Batas panjang judul telah terlampaui (max 255 karakter)'
    }
    if (description) {
      const maxDesc = isEdit ? 1000 : 2000
      if (description.length > maxDesc) {
        newErrors.description = `Batas panjang deskripsi telah terlampaui (max ${maxDesc} karakter)`
      }
    }
    if (dueDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(dueDate)) {
        newErrors.dueDate = 'Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)'
      }
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
    })
  }

  const isTitleEmpty = !title || title.trim() === ''

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4">
        {isEdit ? 'Perbarui Tugas' : 'Buat Tugas Baru'}
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-1">
            Judul <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }))
            }}
            placeholder="Masukkan judul tugas..."
            maxLength={255}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="text-red-600 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1">
            Deskripsi <span className="text-gray-400">(opsional)</span>
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }))
            }}
            placeholder="Masukkan deskripsi tugas..."
            rows={3}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="text-red-600 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700 mb-1">
            Prioritas
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Due Date */}
        <div className="mb-6">
          <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700 mb-1">
            Tenggat Waktu <span className="text-gray-400">(opsional)</span>
          </label>
          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }))
            }}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dueDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dueDate && (
            <p className="text-red-600 text-xs mt-1">{errors.dueDate}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isTitleEmpty}
            className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
              isTitleEmpty
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Simpan
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded font-medium text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

export default TaskForm
