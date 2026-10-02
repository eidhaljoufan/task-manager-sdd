/**
 * Initial test to verify project setup
 */

const { TaskStorage, TaskManager, UI } = require('./index');

describe('Project Setup', () => {
  test('TaskStorage should be instantiable', () => {
    const storage = new TaskStorage();
    expect(storage).toBeDefined();
    expect(storage.getTotalCount()).toBe(0);
  });

  test('TaskManager should be instantiable', () => {
    const storage = new TaskStorage();
    const taskManager = new TaskManager(storage);
    expect(taskManager).toBeDefined();
  });

  test('UI should be instantiable', () => {
    const storage = new TaskStorage();
    const taskManager = new TaskManager(storage);
    const ui = new UI(taskManager);
    expect(ui).toBeDefined();
  });
});
