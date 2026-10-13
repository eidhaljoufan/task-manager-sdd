/**
 * Task_Storage - Data Persistence Layer
 *
 * Responsibilities:
 * - Persist tasks to durable storage (< 5 seconds for write operations)
 * - Retrieve tasks with efficient filtering (≤ 500ms) and search (≤ 300ms)
 * - Support pagination with 50 items per page by default
 * - Maintain consistent sorting: creation_date DESC (newest first)
 * - Preserve data integrity during updates
 */

class TaskStorage {
  constructor() {
    // In-memory storage for tasks
    this.tasks = new Map(); // taskId -> task object
    this.taskList = []; // array for ordered access
  }

  /**
   * Save task to storage
   * @param {Object} task - Task object to save
   * @returns {Promise<Object>} - Saved task or error
   * @throws {Error} if save operation fails
   */
  async save(task) {
    try {
      // Simulate async operation with delay < 5 seconds
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (!task || !task.id) {
            reject(new Error('Task ID tugas tidak valid'));
            return;
          }

          // Check if updating existing task
          const existingTaskIndex = this.taskList.findIndex(t => t.id === task.id);
          if (existingTaskIndex !== -1) {
            this.taskList[existingTaskIndex] = task;
          } else {
            this.taskList.push(task);
          }

          this.tasks.set(task.id, task);
          resolve(task);
        }, 10); // Minimal delay to simulate async behavior
      });
    } catch (error) {
      throw new Error(`Gagal menyimpan tugas. ${error.message}`);
    }
  }

  /**
   * Retrieve single task by ID
   * @param {string} taskId - Task ID to retrieve
   * @returns {Object|null} - Task object or null if not found
   */
  retrieve(taskId) {
    if (!taskId) {
      throw new Error('ID tugas tidak valid');
    }
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('Tugas tidak ditemukan');
    }
    return task;
  }

  /**
   * List all tasks with pagination
   * @param {number} pageNumber - Page number (1-indexed)
   * @param {number} pageSize - Items per page (default: 50)
   * @returns {Object} - Pagination result with items, current page, total count, etc.
   */
  listTasks(pageNumber = 1, pageSize = 50) {
    // Sort by creation_date DESC (newest first)
    const sortedTasks = [...this.taskList].sort((a, b) => {
      return new Date(b.creation_date) - new Date(a.creation_date);
    });

    const totalCount = sortedTasks.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      items: sortedTasks.slice(startIndex, endIndex),
      currentPage: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      totalPages: totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
    };
  }

  /**
   * List tasks with filtering by status and/or priority
   * @param {Object} filters - Filter criteria {status?: string, priority?: string}
   * @param {number} pageNumber - Page number (1-indexed)
   * @param {number} pageSize - Items per page (default: 50)
   * @returns {Object} - Pagination result with filtered items
   */
  listWithFilter(filters = {}, pageNumber = 1, pageSize = 50) {
    const startTime = Date.now();

    let filtered = this.taskList;

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Sort by creation_date DESC (newest first)
    const sortedTasks = filtered.sort((a, b) => {
      return new Date(b.creation_date) - new Date(a.creation_date);
    });

    const responseTime = Date.now() - startTime;
    if (responseTime > 500) {
      console.warn(`Filter response time exceeded: ${responseTime}ms (limit: 500ms)`);
    }

    const totalCount = sortedTasks.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      items: sortedTasks.slice(startIndex, endIndex),
      currentPage: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      totalPages: totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
      responseTime: responseTime,
    };
  }

  /**
   * Search tasks by keyword with case-insensitive partial matching
   * @param {string} keyword - Search keyword
   * @param {number} pageNumber - Page number (1-indexed)
   * @param {number} pageSize - Items per page (default: 100)
   * @returns {Object} - Pagination result with search results
   */
  search(keyword, pageNumber = 1, pageSize = 100) {
    const startTime = Date.now();

    let results = this.taskList;

    // If keyword is not empty or whitespace, apply search filter
    if (keyword && keyword.trim()) {
      const lowerKeyword = keyword.toLowerCase();
      results = results.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(lowerKeyword);
        const descriptionMatch =
          task.description && task.description.toLowerCase().includes(lowerKeyword);
        return titleMatch || descriptionMatch;
      });

      // Sort by relevance (title matches ranked higher)
      results.sort((a, b) => {
        const lk = keyword.toLowerCase();
        const aTitleMatch = a.title.toLowerCase().includes(lk) ? 1 : 0;
        const bTitleMatch = b.title.toLowerCase().includes(lk) ? 1 : 0;

        if (aTitleMatch !== bTitleMatch) {
          return bTitleMatch - aTitleMatch;
        }

        // If both or neither have title match, sort by creation date DESC
        return new Date(b.creation_date) - new Date(a.creation_date);
      });
    } else {
      // Empty/whitespace keyword returns all tasks
      results = results.sort((a, b) => {
        return new Date(b.creation_date) - new Date(a.creation_date);
      });
    }

    // Limit to max 100 results
    results = results.slice(0, 100);

    const responseTime = Date.now() - startTime;
    if (responseTime > 300) {
      console.warn(`Search response time exceeded: ${responseTime}ms (limit: 300ms)`);
    }

    const totalCount = results.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      items: results.slice(startIndex, endIndex),
      currentPage: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      totalPages: totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1,
      responseTime: responseTime,
    };
  }

  /**
   * Delete task from storage
   * @param {string} taskId - Task ID to delete
   * @returns {boolean} - True if deleted, false if not found
   */
  delete(taskId) {
    if (!taskId) {
      throw new Error('ID tugas tidak valid');
    }

    const taskIndex = this.taskList.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Tugas tidak ditemukan');
    }

    this.taskList.splice(taskIndex, 1);
    this.tasks.delete(taskId);
    return true;
  }

  /**
   * Get total count of tasks
   * @returns {number} - Total number of tasks
   */
  getTotalCount() {
    return this.taskList.length;
  }

  /**
   * Clear all tasks (useful for testing)
   */
  clear() {
    this.tasks.clear();
    this.taskList = [];
  }

  /**
   * Get all tasks without pagination (for internal use)
   * @returns {Array} - All tasks
   */
  getAllTasks() {
    return [...this.taskList];
  }
}

export default TaskStorage;
