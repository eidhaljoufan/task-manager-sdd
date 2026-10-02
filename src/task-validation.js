/**
 * Task Validation Functions
 * Validates task input fields and returns error messages in Indonesian
 */

const { VALID_PRIORITIES } = require("./task-model");

/**
 * Validate task title
 * - Required: non-empty, non-whitespace
 * - Max length: 255 characters
 *
 * @param {string} title - The title to validate
 * @returns {object} { valid: boolean, error?: string }
 */
function validateTitle(title) {
  // Check if title is missing or only whitespace
  if (!title || typeof title !== "string" || title.trim() === "") {
    return {
      valid: false,
      error: "Judul wajib diisi",
    };
  }

  // Check if title exceeds max length
  if (title.length > 255) {
    return {
      valid: false,
      error: "Batas panjang judul telah terlampaui (max 255 karakter)",
    };
  }

  return { valid: true };
}

/**
 * Validate task description
 * - Optional field
 * - Max length varies: 2000 for create, 1000 for update
 *
 * @param {string} description - The description to validate
 * @param {string} mode - 'create' or 'update' (default: 'create')
 * @returns {object} { valid: boolean, error?: string }
 */
function validateDescription(description, mode = "create") {
  // Description is optional, so undefined or null is valid
  if (description === undefined || description === null) {
    return { valid: true };
  }

  // If provided, it must be a string
  if (typeof description !== "string") {
    return {
      valid: false,
      error:
        "Deskripsi harus berupa teks" +
        (mode === "create"
          ? " (max 2000 karakter)"
          : " (max 1000 karakter)"),
    };
  }

  const maxLength = mode === "create" ? 2000 : 1000;

  // Check length constraint
  if (description.length > maxLength) {
    return {
      valid: false,
      error: `Batas panjang deskripsi telah terlampaui (max ${maxLength} karakter)`,
    };
  }

  return { valid: true };
}

/**
 * Validate priority level
 * - Must be one of: High, Medium, Low
 *
 * @param {string} priority - The priority to validate
 * @returns {object} { valid: boolean, error?: string }
 */
function validatePriority(priority) {
  // Priority is optional and defaults to "Medium", so undefined is valid
  if (priority === undefined || priority === null) {
    return { valid: true };
  }

  // Must be a string
  if (typeof priority !== "string") {
    return {
      valid: false,
      error: "Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low",
    };
  }

  // Must be one of the valid priorities
  if (!VALID_PRIORITIES.includes(priority)) {
    return {
      valid: false,
      error: "Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low",
    };
  }

  return { valid: true };
}

/**
 * Validate due date
 * - Optional field
 * - Must be in ISO 8601 format (YYYY-MM-DD)
 *
 * @param {string} dueDate - The due date to validate
 * @returns {object} { valid: boolean, error?: string }
 */
function validateDueDate(dueDate) {
  // Due date is optional
  if (dueDate === undefined || dueDate === null) {
    return { valid: true };
  }

  // If provided, must be a string
  if (typeof dueDate !== "string") {
    return {
      valid: false,
      error: "Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)",
    };
  }

  // Must match ISO 8601 date format (YYYY-MM-DD)
  const iso8601DateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso8601DateRegex.test(dueDate)) {
    return {
      valid: false,
      error: "Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)",
    };
  }

  // Validate that it's a valid date
  const date = new Date(dueDate + "T00:00:00Z");
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      error: "Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)",
    };
  }

  // Ensure the date didn't change due to timezone adjustments
  const [year, month, day] = dueDate.split("-");
  if (
    date.getUTCFullYear() !== parseInt(year) ||
    date.getUTCMonth() + 1 !== parseInt(month) ||
    date.getUTCDate() !== parseInt(day)
  ) {
    return {
      valid: false,
      error: "Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)",
    };
  }

  return { valid: true };
}

/**
 * Validate task ID
 * - Must be a non-empty string
 *
 * @param {string} taskId - The task ID to validate
 * @returns {object} { valid: boolean, error?: string }
 */
function validateTaskId(taskId) {
  if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
    return {
      valid: false,
      error: "ID tugas tidak valid",
    };
  }

  return { valid: true };
}

module.exports = {
  validateTitle,
  validateDescription,
  validatePriority,
  validateDueDate,
  validateTaskId,
};
