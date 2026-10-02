/**
 * Todolist App - Main Entry Point
 * 
 * Initializes the application with the three-layer architecture:
 * - UI Layer (Presentation)
 * - Task_Manager (Business Logic)
 * - Task_Storage (Data Persistence)
 */

const TaskStorage = require('./task-storage');
const TaskManager = require('./task-manager');
const UI = require('./ui');

// Initialize the layers
const storage = new TaskStorage();
const taskManager = new TaskManager(storage);
const ui = new UI(taskManager);

// Export for use in other modules/tests
module.exports = {
  TaskStorage,
  TaskManager,
  UI,
  storage,
  taskManager,
  ui
};
