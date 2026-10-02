/**
 * Task_Manager - Business Logic Layer
 * 
 * Responsibilities:
 * - Validate input constraints before storage operations
 * - Orchestrate CRUD operations
 * - Manage task state transitions
 * - Record timestamps automatically
 * - Provide error messages and user feedback (in Indonesian)
 */

const { v4: uuidv4 } = require('uuid');

class TaskManager {
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Get current ISO 8601 timestamp
   * @returns {string} - ISO 8601 timestamp
   */
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Get current date in ISO 8601 format (YYYY-MM-DD)
   * @returns {string} - Date in YYYY-MM-DD format
   */
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Validate title
   * @param {string} title - Title to validate
   * @throws {Error} if title is invalid
   */
  validateTitle(title) {
    if (!title || title.trim() === '') {
      throw new Error('Judul wajib diisi');
    }
    if (title.length > 255) {
      throw new Error('Batas panjang judul telah terlampaui (max 255 karakter)');
    }
  }

  /**
   * Validate description for create operation
   * @param {string} description - Description to validate
   * @throws {Error} if description is invalid
   */
  validateDescriptionCreate(description) {
    if (description && description.length > 2000) {
      throw new Error('Batas panjang deskripsi telah terlampaui (max 2000 karakter)');
    }
  }

  /**
   * Validate description for update operation
   * @param {string} description - Description to validate
   * @throws {Error} if description is invalid
   */
  validateDescriptionUpdate(description) {
    if (description && description.length > 1000) {
      throw new Error('Batas panjang deskripsi telah terlampaui (max 1000 karakter)');
    }
  }

  /**
   * Validate priority
   * @param {string} priority - Priority to validate
   * @throws {Error} if priority is invalid
   */
  validatePriority(priority) {
    const validPriorities = ['High', 'Medium', 'Low'];
    if (!validPriorities.includes(priority)) {
      throw new Error('Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low');
    }
  }

  /**
   * Validate due date format (ISO 8601: YYYY-MM-DD)
   * @param {string} dueDate - Due date to validate
   * @throws {Error} if due date is invalid
   */
  validateDueDate(dueDate) {
    if (!dueDate) {
      return; // null/undefined is allowed
    }
    
    // Check ISO 8601 date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      throw new Error('Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)');
    }

    // Validate that it's a valid date
    const date = new Date(dueDate + 'T00:00:00Z');
    if (isNaN(date.getTime())) {
      throw new Error('Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)');
    }
  }

  /**
   * Create a new task
   * @param {string} title - Task title (required)
   * @param {string} description - Task description (optional)
   * @param {string} priority - Task priority (High/Medium/Low, default: Medium)
   * @returns {Promise<Object>} - Created task
   * @throws {Error} if validation fails
   */
  async createTask(title, description, priority = 'Medium') {
    // Validate title
    this.validateTitle(title);

    // Validate description (max 2000 for create)
    this.validateDescriptionCreate(description);

    // Validate priority
    this.validatePriority(priority);

    const task = {
      id: uuidv4(),
      title: title,
      description: description || undefined,
      priority: priority,
      status: 'Incomplete',
      due_date: undefined,
      creation_date: this.getCurrentTimestamp(),
      last_updated: undefined,
      completion_time: undefined
    };

    // Save to storage
    return await this.storage.save(task);
  }

  /**
   * Update an existing task
   * @param {string} taskId - Task ID to update
   * @param {Object} fields - Fields to update {title, description, priority, due_date}
   * @param {Function} confirmCallback - Callback to request user confirmation
   * @returns {Promise<Object>} - Updated task
   * @throws {Error} if validation fails or task not found
   */
  async updateTask(taskId, fields = {}, confirmCallback = null) {
    // Retrieve existing task
    let task;
    try {
      task = this.storage.retrieve(taskId);
    } catch (error) {
      throw new Error('Tugas tidak ditemukan');
    }

    // Validate provided fields
    if (fields.title !== undefined) {
      this.validateTitle(fields.title);
    }
    if (fields.description !== undefined) {
      this.validateDescriptionUpdate(fields.description);
    }
    if (fields.priority !== undefined) {
      this.validatePriority(fields.priority);
    }
    if (fields.due_date !== undefined) {
      this.validateDueDate(fields.due_date);
    }

    // Request user confirmation if callback provided
    if (confirmCallback) {
      const confirmed = await confirmCallback(task, fields);
      if (!confirmed) {
        throw new Error('Pembaruan dibatalkan oleh pengguna');
      }
    }

    // Update task with new fields
    const updatedTask = {
      ...task,
      ...fields,
      last_updated: this.getCurrentTimestamp()
    };

    // Save to storage
    return await this.storage.save(updatedTask);
  }

  /**
   * Mark task as complete
   * @param {string} taskId - Task ID to mark complete
   * @returns {Promise<Object>} - Updated task
   * @throws {Error} if task not found
   */
  async markTaskComplete(taskId) {
    let task;
    try {
      task = this.storage.retrieve(taskId);
    } catch (error) {
      throw new Error('Tugas tidak ditemukan atau tidak valid untuk diselesaikan');
    }

    const completedTask = {
      ...task,
      status: 'Completed',
      completion_time: this.getCurrentTimestamp(),
      last_updated: this.getCurrentTimestamp()
    };

    return await this.storage.save(completedTask);
  }

  /**
   * Delete a task
   * @param {string} taskId - Task ID to delete
   * @param {Function} confirmCallback - Callback to request user confirmation
   * @returns {Promise<boolean>} - True if deleted
   * @throws {Error} if task not found or user cancels
   */
  async deleteTask(taskId, confirmCallback = null) {
    // Verify task exists
    let task;
    try {
      task = this.storage.retrieve(taskId);
    } catch (error) {
      throw new Error('Tugas tidak ditemukan');
    }

    // Request user confirmation if callback provided
    if (confirmCallback) {
      const confirmed = await confirmCallback(task);
      if (!confirmed) {
        throw new Error('Penghapusan dibatalkan oleh pengguna');
      }
    }

    // Delete from storage
    this.storage.delete(taskId);
    return true;
  }

  /**
   * Search tasks by keyword
   * @param {string} keyword - Search keyword
   * @param {number} pageNumber - Page number (default: 1)
   * @returns {Object} - Search results with pagination
   */
  searchTasks(keyword, pageNumber = 1) {
    return this.storage.search(keyword, pageNumber, 100);
  }

  /**
   * Filter tasks by status and/or priority
   * @param {string} status - Filter by status (Incomplete/Completed)
   * @param {string} priority - Filter by priority (High/Medium/Low)
   * @param {number} pageNumber - Page number (default: 1)
   * @returns {Object} - Filtered results with pagination
   */
  filterTasks(status = null, priority = null, pageNumber = 1) {
    const filters = {};
    if (status) {
      filters.status = status;
    }
    if (priority) {
      filters.priority = priority;
    }

    return this.storage.listWithFilter(filters, pageNumber, 50);
  }

  /**
   * Get all tasks with pagination
   * @param {number} pageNumber - Page number (default: 1)
   * @returns {Object} - Paginated tasks
   */
  getAllTasks(pageNumber = 1) {
    return this.storage.listTasks(pageNumber, 50);
  }

  /**
   * Get single task by ID
   * @param {string} taskId - Task ID to retrieve
   * @returns {Object} - Task object
   * @throws {Error} if task not found
   */
  getTask(taskId) {
    return this.storage.retrieve(taskId);
  }
}

module.exports = TaskManager;
