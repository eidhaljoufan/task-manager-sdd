/**
 * UI Layer - Presentation and User Interaction
 *
 * Responsibilities:
 * - Display task list with formatting
 * - Handle user interactions (create, update, delete, search, filter)
 * - Show confirmation dialogs
 * - Display error and success messages
 * - Manage pagination navigation
 * - Show visual indicators for task status (completed, overdue)
 */

class UI {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.currentPage = 1;
    this.currentFilters = {};
    this.currentSearch = '';
  }

  // ---------------------------------------------------------------------------
  // Helper: overdue detection (6.17)
  // ---------------------------------------------------------------------------

  /**
   * Determine whether a task is overdue.
   * A task is overdue when:
   *   - its status is "Incomplete", AND
   *   - it has a due_date that is earlier than today's date (YYYY-MM-DD)
   *
   * Completed tasks are NEVER considered overdue regardless of due_date.
   *
   * @param {Object} task - Task object
   * @returns {boolean}
   */
  isOverdue(task) {
    if (!task || task.status === 'Completed') {
      return false;
    }
    if (!task.due_date) {
      return false;
    }
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return task.due_date < today;
  }

  // ---------------------------------------------------------------------------
  // 6.1 Task display components
  // ---------------------------------------------------------------------------

  /**
   * Format a single task for console display.
   *
   * Completed tasks: ✓ + ~~strikethrough title~~
   * Incomplete tasks: ○ + plain title
   * Overdue incomplete tasks: ⚠️ OVERDUE indicator appended to due_date line
   *
   * @param {Object} task - Task object
   * @returns {string} Multi-line formatted string (no trailing newline)
   */
  formatTask(task) {
    const isCompleted = task.status === 'Completed';
    const statusIcon = isCompleted ? '✓ ' : '○ ';
    const titleFormatted = isCompleted
      ? `~~${task.title}~~`
      : task.title;

    let lines = [`${statusIcon}${titleFormatted}`];

    if (task.description) {
      lines.push(`   Deskripsi : ${task.description}`);
    }

    let statusLine = `   Prioritas : ${task.priority} | Status: ${task.status}`;
    lines.push(statusLine);

    if (task.due_date) {
      const overdueText = this.isOverdue(task) ? ' \x1b[31m⚠️  TERLAMBAT\x1b[0m' : '';
      lines.push(`   Tenggat   : ${task.due_date}${overdueText}`);
    }

    if (task.creation_date) {
      lines.push(`   Dibuat    : ${task.creation_date}`);
    }

    if (task.last_updated) {
      lines.push(`   Diperbarui: ${task.last_updated}`);
    }

    if (task.completion_time) {
      lines.push(`   Selesai   : ${task.completion_time}`);
    }

    return lines.join('\n');
  }

  /**
   * Display task list with pagination info.
   * Shows "Tidak ada tugas ditemukan" when list is empty.
   *
   * @param {Array}  tasks      - Tasks to display
   * @param {Object} pagination - Pagination metadata
   */
  displayTaskList(tasks, pagination) {
    if (!tasks || tasks.length === 0) {
      console.log('Tidak ada tugas ditemukan');
      return;
    }

    console.log('\n========== DAFTAR TUGAS ==========');
    tasks.forEach((task, index) => {
      console.log(`[${index + 1}] ${this.formatTask(task)}`);
    });

    // Pagination info
    console.log(`\nHalaman ${pagination.currentPage} dari ${pagination.totalPages}`);
    console.log(`Total tugas: ${pagination.totalCount}`);

    const navOptions = [];
    if (pagination.hasPreviousPage) navOptions.push('Sebelumnya');
    if (pagination.hasNextPage)     navOptions.push('Berikutnya');
    if (navOptions.length > 0) {
      console.log(`Navigasi: ${navOptions.join(' | ')}`);
    }
    console.log('==================================\n');
  }

  /**
   * Display a single task detail.
   * @param {Object} task - Task to display
   */
  displayTask(task) {
    console.log('\n========== DETAIL TUGAS ==========');
    console.log(this.formatTask(task));
    console.log('==================================\n');
  }

  // ---------------------------------------------------------------------------
  // 6.19 Error / success feedback
  // ---------------------------------------------------------------------------

  /**
   * Display an error message (❌ prefix).
   * @param {string} message - Error message (in Indonesian)
   */
  displayError(message) {
    console.error(`❌ Error: ${message}`);
  }

  /**
   * Display a success message (✅ prefix).
   * @param {string} message - Success message (in Indonesian)
   */
  displaySuccess(message) {
    console.log(`✅ ${message}`);
  }

  // ---------------------------------------------------------------------------
  // 6.9 Task creation UI
  // ---------------------------------------------------------------------------

  /**
   * Create a new task via UI.
   * Displays validation errors in Indonesian; shows success message on completion.
   *
   * @param {string} title       - Task title (required)
   * @param {string} description - Task description (optional)
   * @param {string} priority    - Task priority (default: 'Medium')
   * @returns {Promise<Object|null>} Created task, or null on failure
   */
  async createTaskUI(title, description = '', priority = 'Medium') {
    try {
      const task = await this.taskManager.createTask(title, description, priority);
      this.displaySuccess(`Tugas berhasil dibuat: "${task.title}"`);
      return task;
    } catch (error) {
      this.displayError(error.message);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 6.11 Task update UI
  // ---------------------------------------------------------------------------

  /**
   * Update a task via UI with a confirmation dialog.
   * Shows current values vs. proposed changes before confirming.
   *
   * @param {string} taskId  - Task ID to update
   * @param {Object} fields  - Fields to update {title?, description?, priority?, due_date?}
   * @returns {Promise<Object|null>} Updated task, or null on failure/cancellation
   */
  async updateTaskUI(taskId, fields) {
    try {
      const confirmCallback = async (currentTask, newFields) => {
        console.log('\nKonfirmasi Pembaruan Tugas');
        console.log('Tugas saat ini:');
        this.displayTask(currentTask);
        console.log('Perubahan yang akan diterapkan:');
        Object.entries(newFields).forEach(([key, value]) => {
          const oldValue = currentTask[key] !== undefined ? currentTask[key] : '(kosong)';
          console.log(`  ${key}: ${oldValue} → ${value}`);
        });
        // Auto-confirm (in a real interactive UI this would wait for user input)
        return true;
      };

      const task = await this.taskManager.updateTask(taskId, fields, confirmCallback);
      this.displaySuccess(`Tugas berhasil diperbarui: "${task.title}"`);
      return task;
    } catch (error) {
      this.displayError(error.message);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 6.13 Task completion UI
  // ---------------------------------------------------------------------------

  /**
   * Mark a task as complete via UI.
   * Updates the display to show completed state (strikethrough, checkmark).
   *
   * @param {string} taskId - Task ID to mark complete
   * @returns {Promise<Object|null>} Completed task, or null on failure
   */
  async completeTaskUI(taskId) {
    try {
      const task = await this.taskManager.markTaskComplete(taskId);
      this.displaySuccess(`Tugas berhasil diselesaikan: "${task.title}"`);
      // Show the updated task with completed visual indicators
      this.displayTask(task);
      return task;
    } catch (error) {
      this.displayError(error.message);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 6.15 Task deletion UI
  // ---------------------------------------------------------------------------

  /**
   * Delete a task via UI with a confirmation dialog.
   * Shows the task title before asking for confirmation.
   *
   * @param {string} taskId - Task ID to delete
   * @returns {Promise<boolean>} True if deleted, false on cancellation/failure
   */
  async deleteTaskUI(taskId) {
    try {
      // Retrieve task first so we can show its title in the success message
      const task = this.taskManager.getTask(taskId);

      const confirmCallback = async (taskToDelete) => {
        console.log('\nKonfirmasi Penghapusan Tugas');
        console.log('Tugas yang akan dihapus:');
        this.displayTask(taskToDelete);
        console.log('Ketik "konfirmasi" untuk menghapus atau "batal" untuk membatalkan.');
        // Auto-confirm (in a real interactive UI this would wait for user input)
        return true;
      };

      await this.taskManager.deleteTask(taskId, confirmCallback);
      this.displaySuccess(`Tugas berhasil dihapus: "${task.title}"`);
      return true;
    } catch (error) {
      this.displayError(error.message);
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // 6.1 / 6.3 View all tasks with pagination
  // ---------------------------------------------------------------------------

  /**
   * Display all tasks with pagination.
   * Resets current search/filter state and sets current page.
   *
   * @param {number} pageNumber - Page to display (default: 1)
   */
  async displayAllTasksUI(pageNumber = 1) {
    try {
      const result = this.taskManager.getAllTasks(pageNumber);
      this.displayTaskList(result.items, result);
      this.currentPage = pageNumber;
      this.currentFilters = {};
      this.currentSearch = '';
    } catch (error) {
      this.displayError(error.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 6.7 Search UI controls
  // ---------------------------------------------------------------------------

  /**
   * Search tasks via UI.
   * Empty/whitespace keyword returns all tasks (no filter).
   * Warns when response exceeds 300 ms.
   *
   * @param {string} keyword    - Search keyword
   * @param {number} pageNumber - Page number (default: 1)
   */
  async searchTasksUI(keyword, pageNumber = 1) {
    try {
      const result = this.taskManager.searchTasks(keyword, pageNumber);
      this.displayTaskList(result.items, result);
      this.currentPage = pageNumber;
      this.currentSearch = keyword;
      this.currentFilters = {};

      if (result.responseTime !== undefined && result.responseTime > 300) {
        console.warn(
          `⚠️  Pencarian memakan waktu ${result.responseTime}ms (batas: 300ms)`
        );
      }
    } catch (error) {
      this.displayError(error.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 6.5 Filtering UI controls
  // ---------------------------------------------------------------------------

  /**
   * Filter tasks via UI.
   * Warns when response exceeds 500 ms.
   *
   * @param {string|null} status     - Filter by status ('Incomplete'/'Completed'), or null for all
   * @param {string|null} priority   - Filter by priority ('High'/'Medium'/'Low'), or null for all
   * @param {number}      pageNumber - Page number (default: 1)
   */
  async filterTasksUI(status = null, priority = null, pageNumber = 1) {
    try {
      const result = this.taskManager.filterTasks(status, priority, pageNumber);
      this.displayTaskList(result.items, result);
      this.currentPage = pageNumber;
      this.currentFilters = { status, priority };
      this.currentSearch = '';

      if (result.responseTime !== undefined && result.responseTime > 500) {
        console.warn(
          `⚠️  Filter memakan waktu ${result.responseTime}ms (batas: 500ms)`
        );
      }
    } catch (error) {
      this.displayError(error.message);
    }
  }

  // ---------------------------------------------------------------------------
  // 6.3 Pagination navigation
  // ---------------------------------------------------------------------------

  /**
   * Navigate to the next page.
   * Respects the current search/filter context.
   * Page loads are expected to complete in < 1 second.
   */
  async nextPage() {
    const nextPageNumber = this.currentPage + 1;

    if (this.currentSearch) {
      await this.searchTasksUI(this.currentSearch, nextPageNumber);
    } else if (
      this.currentFilters.status !== undefined ||
      this.currentFilters.priority !== undefined
    ) {
      await this.filterTasksUI(
        this.currentFilters.status,
        this.currentFilters.priority,
        nextPageNumber
      );
    } else {
      await this.displayAllTasksUI(nextPageNumber);
    }
  }

  /**
   * Navigate to the previous page.
   * Does nothing if already on page 1.
   * Respects the current search/filter context.
   */
  async previousPage() {
    if (this.currentPage <= 1) {
      return;
    }

    const prevPageNumber = this.currentPage - 1;

    if (this.currentSearch) {
      await this.searchTasksUI(this.currentSearch, prevPageNumber);
    } else if (
      this.currentFilters.status !== undefined ||
      this.currentFilters.priority !== undefined
    ) {
      await this.filterTasksUI(
        this.currentFilters.status,
        this.currentFilters.priority,
        prevPageNumber
      );
    } else {
      await this.displayAllTasksUI(prevPageNumber);
    }
  }
}

module.exports = UI;
