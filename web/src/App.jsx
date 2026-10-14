import React, { useState, useEffect, useCallback, useRef } from 'react'
import TaskStorage from './core/task-storage.js'
import TaskManager from './core/task-manager.js'
import TaskList from './components/TaskList.jsx'
import TaskForm from './components/TaskForm.jsx'
import TaskCard from './components/TaskCard.jsx'
import PaginationControls from './components/PaginationControls.jsx'
import ConfirmationDialog from './components/ConfirmationDialog.jsx'
import FilterBar from './components/FilterBar.jsx'
import SearchBar from './components/SearchBar.jsx'

// Singleton instances — created once outside component
const storage = new TaskStorage()
const taskManager = new TaskManager(storage)

function App() {
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalCount: 0,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState({ status: null, priority: null })
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const successTimer = useRef(null)
  const errorTimer = useRef(null)

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const showSuccess = (msg) => {
    setSuccessMessage(msg)
    if (successTimer.current) clearTimeout(successTimer.current)
    successTimer.current = setTimeout(() => setSuccessMessage(''), 3000)
  }

  const showError = (msg) => {
    setErrorMessage(msg)
    if (errorTimer.current) clearTimeout(errorTimer.current)
    errorTimer.current = setTimeout(() => setErrorMessage(''), 3000)
  }

  // ─── Load tasks ───────────────────────────────────────────────────────────

  const loadTasks = useCallback(
    (page = 1) => {
      try {
        let result
        if (searchKeyword.trim()) {
          result = taskManager.searchTasks(searchKeyword, page)
        } else if (activeFilters.status || activeFilters.priority) {
          result = taskManager.filterTasks(activeFilters.status, activeFilters.priority, page)
        } else {
          result = taskManager.getAllTasks(page)
        }
        setTasks(result.items)
        setPagination(result)
        setCurrentPage(page)
      } catch (err) {
        showError(err.message || 'Gagal memuat tugas. Silakan refresh halaman')
      }
    },
    [searchKeyword, activeFilters]
  )

  // Reload when search or filters change
  useEffect(() => {
    loadTasks(1)
  }, [loadTasks])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current)
      if (errorTimer.current) clearTimeout(errorTimer.current)
    }
  }, [])

  // ─── Create ───────────────────────────────────────────────────────────────

  const handleCreate = async ({ title, description, priority, due_date }) => {
    try {
      const createdTask = await taskManager.createTask(title, description, priority)
      // Set due_date via update if provided
      if (due_date) {
        await taskManager.updateTask(createdTask.id, { due_date }, async () => true)
      }
      setShowCreateForm(false)
      showSuccess('Tugas berhasil dibuat!')
      loadTasks(1)
    } catch (err) {
      showError(err.message)
    }
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  const handleUpdate = async ({ title, description, priority, due_date }) => {
    try {
      await taskManager.updateTask(
        editingTask.id,
        { title, description, priority, due_date },
        async () => true
      )
      setEditingTask(null)
      showSuccess('Tugas berhasil diperbarui!')
      loadTasks(currentPage)
    } catch (err) {
      showError(err.message)
    }
  }

  // ─── Mark complete ────────────────────────────────────────────────────────

  const handleComplete = async (taskId) => {
    try {
      await taskManager.markTaskComplete(taskId)
      showSuccess('Tugas selesai!')
      loadTasks(currentPage)
    } catch (err) {
      showError(err.message)
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDeleteClick = (task) => {
    setDeleteConfirm(task)
  }

  const handleDeleteConfirm = async () => {
    try {
      await taskManager.deleteTask(deleteConfirm.id, async () => true)
      setDeleteConfirm(null)
      showSuccess('Tugas berhasil dihapus!')
      loadTasks(currentPage)
    } catch (err) {
      setDeleteConfirm(null)
      showError(err.message)
    }
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword)
    setCurrentPage(1)
  }

  // ─── Filter ───────────────────────────────────────────────────────────────

  const handleFilterChange = ({ status, priority }) => {
    setActiveFilters({ status, priority })
    setCurrentPage(1)
  }

  // ─── Pagination ───────────────────────────────────────────────────────────

  const handleNextPage = () => loadTasks(currentPage + 1)
  const handlePrevPage = () => loadTasks(currentPage - 1)

  // ─── Edit ─────────────────────────────────────────────────────────────────

  const handleEditClick = (task) => {
    setShowCreateForm(false) // close create form if open
    setEditingTask(task)
  }

  const handleCancelEdit = () => setEditingTask(null)
  const handleCancelCreate = () => setShowCreateForm(false)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">📝 Todolist App</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Toast messages */}
        {successMessage && (
          <div className="mb-4 px-4 py-3 rounded-md bg-green-100 text-green-800 text-sm font-medium border border-green-300">
            ✅ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 px-4 py-3 rounded-md bg-red-100 text-red-800 text-sm font-medium border border-red-300">
            ❌ {errorMessage}
          </div>
        )}

        {/* Top bar: Search + Create button */}
        <div className="flex items-center gap-3 mb-3">
          <SearchBar onSearch={handleSearch} />
          <button
            onClick={() => {
              setEditingTask(null)
              setShowCreateForm((prev) => !prev)
            }}
            className="flex-shrink-0 px-4 py-2 rounded font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Tutup Form' : '+ Buat Tugas Baru'}
          </button>
        </div>

        {/* Filter bar */}
        <FilterBar onFilterChange={handleFilterChange} />

        {/* Create form */}
        {showCreateForm && (
          <TaskForm
            isEdit={false}
            initialData={null}
            onSubmit={handleCreate}
            onCancel={handleCancelCreate}
          />
        )}

        {/* Edit form */}
        {editingTask && (
          <TaskForm
            isEdit={true}
            initialData={editingTask}
            onSubmit={handleUpdate}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Task list */}
        <TaskList
          tasks={tasks}
          onComplete={handleComplete}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        {/* Pagination */}
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
        />
      </main>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={!!deleteConfirm}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus "${deleteConfirm?.title}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}

export default App
