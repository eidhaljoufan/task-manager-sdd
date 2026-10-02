/**
 * Task Data Model
 * Defines the Task interface and related constants
 */

// Enums for Priority Level
const Priority_Level = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

// Enums for Completion Status
const Completion_Status = {
  INCOMPLETE: "Incomplete",
  COMPLETED: "Completed",
};

// Valid priority values
const VALID_PRIORITIES = Object.values(Priority_Level);

// Valid status values
const VALID_STATUSES = Object.values(Completion_Status);

/**
 * Task class representing a task entity
 */
class Task {
  constructor(
    title,
    priority = Priority_Level.MEDIUM,
    description = undefined,
    status = Completion_Status.INCOMPLETE,
    due_date = undefined,
    id = generateId(),
    creation_date = generateTimestamp(),
    last_updated = undefined,
    completion_time = undefined
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.priority = priority;
    this.status = status;
    this.due_date = due_date;
    this.creation_date = creation_date;
    this.last_updated = last_updated;
    this.completion_time = completion_time;
  }

  /**
   * Convert task to plain object
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      priority: this.priority,
      status: this.status,
      due_date: this.due_date,
      creation_date: this.creation_date,
      last_updated: this.last_updated,
      completion_time: this.completion_time,
    };
  }

  /**
   * Create Task from plain object
   */
  static fromObject(obj) {
    return new Task(
      obj.title,
      obj.priority || Priority_Level.MEDIUM,
      obj.description,
      obj.status || Completion_Status.INCOMPLETE,
      obj.due_date,
      obj.id,
      obj.creation_date,
      obj.last_updated,
      obj.completion_time
    );
  }
}

/**
 * Generate a unique ID
 * Using simple UUID v4 implementation
 */
function generateId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate ISO 8601 timestamp with second precision
 * Format: YYYY-MM-DDTHH:mm:ssZ
 */
function generateTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Generate ISO 8601 date string (without time)
 * Format: YYYY-MM-DD
 */
function generateDateOnly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  Task,
  Priority_Level,
  Completion_Status,
  VALID_PRIORITIES,
  VALID_STATUSES,
  generateId,
  generateTimestamp,
  generateDateOnly,
};
