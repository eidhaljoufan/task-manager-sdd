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

  /**
   * Format task for display
   * @param {Object} task - Task object
   * @returns {string} - Formatted task string
   */
  formatTask(task) {
    const status = task.status === 'Completed' ? '✓ ' : '○ ';
    const completedStyle = task.status === 'Completed' ? '~~' : '';
    const title = `${completedStyle}${task.title}${completedStyle}`;
    
    let overdueIndicator = '';
    if (task.status === 'Incomplete' && task.due_date) {
      const today = new Date().toISOString().split('T')[0];
      if (task.due_date < today) {
        overdueIndicator = ' ⚠️ OVERDUE';
      }
    }

    let result = `${status}${title}`;
    if (task.description) {
      result += `\n   ${task.description}`;
    }
    result += `\n   Priority: ${task.priority} | Status: ${task.status}`;
    if (task.due_date) {
      result += ` | Due: ${task.due_date}${overdueIndicator}`;
    }
    result += `\n`;

    return result;
  }

  /**
   * Display task list
   * @param {Array} tasks - Tasks to display
   * @param {Object} pagination - Pagination metadata
   */
  displayTaskList(tasks, pagination) {
    if (tasks.length === 0) {
      console.log('Tidak ada tugas ditemukan');
      return;
    }

    console.log('\n========== DAFTAR TUGAS ==========');
    tasks.forEach((task, index) => {
      console.log(`[${index + 1}] ${this.formatTask(task)}`);
    });

    // Display pagination info
    console.log(`\nHalaman ${pagination.currentPage} dari ${pagination.totalPages}`);
    console.log(`Total tugas: ${pagination.totalCount}`);

    if (pagination.hasNextPage || pagination.hasPreviousPage) {
      let navOptions = [];
      if (pagination.hasPreviousPage) navOptions.push('Previous');
      if (pagination.hasNextPage) navOptions.push('Next');
      console.log(`Navigasi: ${navOptions.join(' | ')}`);
    }
    console.log('==================================\n');
  }

  /**
   * Display a single task
   * @param {Object} task - Task to display
   */
  displayTask(task) {
    console.log('\n========== DETAIL TUGAS ==========');
    console.log(this.formatTask(task));
    console.log('==================================\n');
  }

  /**
   * Display error message
   * @param {string} message - Error message to display
   */
  displayError(message) {
    console.error(`❌ Error: ${message}`);
  }

  /**
   * Display success message
   * @param {string} message - Success message to display
   */
  displaySuccess(message) {
    console.log(`✅ ${message}`);
  }

  /**
   * Create task via UI
   * @param {string} title - Task title
   * @param {string} description - Task description
   * @param {string} priority - Task priority (default: Medium)
   * @returns {Promise<Object>} - Created task or null if cancelled
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

  /**
   * Update task via UI with confirmation
   * @param {string} taskId - Task ID to update
   * @param {Object} fields - Fields to update
   * @returns {Promise<Object>} - Updated task or null if cancelled/failed
   */
  async updateTaskUI(taskId, fields) {
    try {
      // In a real UI, this would show a confirmation dialog
      const confirmCallback = async (task, newFields) => {
        console.log('\nTugas saat ini:');
        this.displayTask(task);
        console.log('Perubahan yang akan dibuat:');
        Object.entries(newFields).forEach(([key, value]) => {
          console.log(`  ${key}: ${task[key] || 'N/A'} → ${value}`);
        });
        // Auto-confirm for testing (in real UI, would wait for user interaction)
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

  /**
   * Mark task as complete via UI
   * @param {string} taskId - Task ID to mark complete
   * @returns {Promise<Object>} - Completed task or null if failed
   */
  async completeTaskUI(taskId) {
    try {
      const task = await this.taskManager.markTaskComplete(taskId);
      this.displaySuccess(`Tugas berhasil diselesaikan: "${task.title}"`);
      return task;
    } catch (error) {
      this.displayError(error.message);
      return null;
    }
  }

  /**
   * Delete task via UI with confirmation
   * @param {string} taskId - Task ID to delete
   * @returns {Promise<boolean>} - True if deleted, false if cancelled/failed
   */
  async deleteTaskUI(taskId) {
    try {
      const task = this.taskManager.getTask(taskId);
      
      // In a real UI, this would show a confirmation dialog
      const confirmCallback = async (taskToDelete) => {
        console.log('\nTugas yang akan dihapus:');
        this.displayTask(taskToDelete);
        console.log('Ketik "konfirmasi" untuk menghapus atau "batal" untuk membatalkan');
        // Auto-confirm for testing (in real UI, would wait for user interaction)
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

  /**
   * Display all tasks with pagination
   * @param {number} pageNumber - Page number (default: 1)
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

  /**
   * Search tasks via UI
   * @param {string} keyword - Search keyword
   * @param {number} pageNumber - Page number (default: 1)
   */
  async searchTasksUI(keyword, pageNumber = 1) {
    try {
      const result = this.taskManager.searchTasks(keyword, pageNumber);
      this.displayTaskList(result.items, result);
      this.currentPage = pageNumber;
      this.currentSearch = keyword;
      this.currentFilters = {};
      
      if (result.responseTime > 300) {
        console.warn(`⚠️  Pencarian memakan waktu ${result.responseTime}ms (batas: 300ms)`);
      }
    } catch (error) {
      this.displayError(error.message);
    }
  }

  /**
   * Filter tasks via UI
   * @param {string} status - Filter by status (Incomplete/Completed)
   * @param {string} priority - Filter by priority (High/Medium/Low)
   * @param {number} pageNumber - Page number (default: 1)
   */
  async filterTasksUI(status = null, priority = null, pageNumber = 1) {
    try {
      const result = this.taskManager.filterTasks(status, priority, pageNumber);
      this.displayTaskList(result.items, result);
      this.currentPage = pageNumber;
      this.currentFilters = { status, priority };
      this.currentSearch = '';
      
      if (result.responseTime > 500) {
        console.warn(`⚠️  Filter memakan waktu ${result.responseTime}ms (batas: 500ms)`);
      }
    } catch (error) {
      this.displayError(error.message);
    }
  }

  /**
   * Navigate to next page
   */
  async nextPage() {
    if (this.currentSearch) {
      await this.searchTasksUI(this.currentSearch, this.currentPage + 1);
    } else if (Object.keys(this.currentFilters).length > 0) {
      await this.filterTasksUI(
        this.currentFilters.status,
        this.currentFilters.priority,
        this.currentPage + 1
      );
    } else {
      await this.displayAllTasksUI(this.currentPage + 1);
    }
  }

  /**
   * Navigate to previous page
   */
  async previousPage() {
    if (this.currentPage > 1) {
      if (this.currentSearch) {
        await this.searchTasksUI(this.currentSearch, this.currentPage - 1);
      } else if (Object.keys(this.currentFilters).length > 0) {
        await this.filterTasksUI(
          this.currentFilters.status,
          this.currentFilters.priority,
          this.currentPage - 1
        );
      } else {
        await this.displayAllTasksUI(this.currentPage - 1);
      }
    }
  }
}

module.exports = UI;
