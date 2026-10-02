/**
 * Unit Tests for TaskManager.createTask() — Task 4.1
 *
 * Covers: createTask(title, description, priority)
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2
 */

const TaskManager = require('./task-manager');
const TaskStorage = require('./task-storage');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Create a fresh manager+storage pair for each test */
function makeManager() {
  const storage = new TaskStorage();
  const manager = new TaskManager(storage);
  return { storage, manager };
}

// ─────────────────────────────────────────────
// createTask — Successful creation (Req 1.1, 1.2, 7.1)
// ─────────────────────────────────────────────
describe('TaskManager.createTask() — successful creation', () => {
  test('returns the created task object (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Buy groceries', 'Milk and eggs', 'High');

    expect(task).toBeDefined();
    expect(task.title).toBe('Buy groceries');
  });

  test('task has status set to "Incomplete" on creation (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Buy groceries');

    expect(task.status).toBe('Incomplete');
  });

  test('task has an auto-generated UUID id (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Buy groceries');

    expect(task.id).toBeDefined();
    expect(typeof task.id).toBe('string');
    expect(task.id.length).toBeGreaterThan(0);
    // UUID v4 pattern
    expect(task.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  test('task has auto-generated creation_date as ISO 8601 timestamp (Req 1.2)', async () => {
    const before = new Date();
    const { manager } = makeManager();
    const task = await manager.createTask('Buy groceries');
    const after = new Date();

    expect(task.creation_date).toBeDefined();
    const taskDate = new Date(task.creation_date);
    expect(taskDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(taskDate.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });

  test('creation_date is in ISO 8601 format (Req 1.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Some task');

    // Accept both with and without milliseconds: ...T...Z
    expect(task.creation_date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('task persists in storage after creation (Req 1.3)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Buy groceries');

    const retrieved = storage.retrieve(task.id);
    expect(retrieved).toEqual(task);
  });

  test('title is stored exactly as provided (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('  Task with spaces  ', undefined, 'Low');

    expect(task.title).toBe('  Task with spaces  ');
  });

  test('description is stored when provided (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', 'A description', 'Medium');

    expect(task.description).toBe('A description');
  });

  test('description is undefined when not provided (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task with no description');

    expect(task.description).toBeUndefined();
  });

  test('last_updated and completion_time are not set on creation (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    expect(task.last_updated).toBeUndefined();
    expect(task.completion_time).toBeUndefined();
  });

  test('due_date is not set on creation (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    expect(task.due_date).toBeUndefined();
  });

  test('each created task gets a unique id (Req 1.1)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Task 1');
    const task2 = await manager.createTask('Task 2');

    expect(task1.id).not.toBe(task2.id);
  });
});

// ─────────────────────────────────────────────
// createTask — Priority handling (Req 7.1, 7.2)
// ─────────────────────────────────────────────
describe('TaskManager.createTask() — priority handling', () => {
  test('stores "High" priority when provided (Req 7.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', undefined, 'High');

    expect(task.priority).toBe('High');
  });

  test('stores "Medium" priority when provided (Req 7.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', undefined, 'Medium');

    expect(task.priority).toBe('Medium');
  });

  test('stores "Low" priority when provided (Req 7.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', undefined, 'Low');

    expect(task.priority).toBe('Low');
  });

  test('defaults to "Medium" when priority is not provided (Req 7.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task without priority');

    expect(task.priority).toBe('Medium');
  });

  test('defaults to "Medium" when priority is explicitly undefined (Req 7.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', undefined, undefined);

    expect(task.priority).toBe('Medium');
  });
});

// ─────────────────────────────────────────────
// createTask — Title validation (Req 1.4, 1.5)
// ─────────────────────────────────────────────
describe('TaskManager.createTask() — title validation', () => {
  test('rejects empty string title with "Judul wajib diisi" (Req 1.4)', async () => {
    const { manager } = makeManager();

    await expect(manager.createTask('')).rejects.toThrow('Judul wajib diisi');
  });

  test('rejects whitespace-only title with "Judul wajib diisi" (Req 1.4)', async () => {
    const { manager } = makeManager();

    await expect(manager.createTask('   ')).rejects.toThrow('Judul wajib diisi');
  });

  test('rejects null title with "Judul wajib diisi" (Req 1.4)', async () => {
    const { manager } = makeManager();

    await expect(manager.createTask(null)).rejects.toThrow('Judul wajib diisi');
  });

  test('rejects undefined title with "Judul wajib diisi" (Req 1.4)', async () => {
    const { manager } = makeManager();

    await expect(manager.createTask(undefined)).rejects.toThrow('Judul wajib diisi');
  });

  test('rejects title exceeding 255 chars with correct error (Req 1.5)', async () => {
    const { manager } = makeManager();
    const longTitle = 'a'.repeat(256);

    await expect(manager.createTask(longTitle)).rejects.toThrow(
      'Batas panjang judul telah terlampaui (max 255 karakter)'
    );
  });

  test('accepts title with exactly 255 characters (boundary, Req 1.5)', async () => {
    const { manager } = makeManager();
    const maxTitle = 'a'.repeat(255);

    const task = await manager.createTask(maxTitle);
    expect(task.title).toBe(maxTitle);
  });

  test('accepts title with exactly 1 character (Req 1.1)', async () => {
    const { manager } = makeManager();

    const task = await manager.createTask('A');
    expect(task.title).toBe('A');
  });

  test('does not persist task when title is invalid (Req 1.4)', async () => {
    const { manager, storage } = makeManager();

    await expect(manager.createTask('')).rejects.toThrow();
    expect(storage.getTotalCount()).toBe(0);
  });
});

// ─────────────────────────────────────────────
// createTask — Description validation (Req 1.5)
// ─────────────────────────────────────────────
describe('TaskManager.createTask() — description validation', () => {
  test('accepts description with 2000 characters (boundary, Req 1.5)', async () => {
    const { manager } = makeManager();
    const desc = 'a'.repeat(2000);

    const task = await manager.createTask('Task', desc);
    expect(task.description).toBe(desc);
  });

  test('rejects description exceeding 2000 chars with correct error (Req 1.5)', async () => {
    const { manager } = makeManager();
    const longDesc = 'a'.repeat(2001);

    await expect(manager.createTask('Task', longDesc)).rejects.toThrow(
      'Batas panjang deskripsi telah terlampaui (max 2000 karakter)'
    );
  });

  test('does not persist task when description is too long (Req 1.5)', async () => {
    const { manager, storage } = makeManager();
    const longDesc = 'a'.repeat(2001);

    await expect(manager.createTask('Task', longDesc)).rejects.toThrow();
    expect(storage.getTotalCount()).toBe(0);
  });

  test('accepts no description (optional field, Req 1.1)', async () => {
    const { manager } = makeManager();

    const task = await manager.createTask('Task');
    expect(task).toBeDefined();
  });
});

// ─────────────────────────────────────────────
// createTask — Priority validation (Req 7.1, 7.5)
// ─────────────────────────────────────────────
describe('TaskManager.createTask() — priority validation', () => {
  test('rejects invalid priority with correct error (Req 7.5)', async () => {
    const { manager } = makeManager();

    await expect(manager.createTask('Task', undefined, 'Critical')).rejects.toThrow(
      'Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low'
    );
  });

  test('rejects lowercase priority (Req 7.5)', async () => {
    const { manager } = makeManager();

    await expect(manager.createTask('Task', undefined, 'high')).rejects.toThrow(
      'Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low'
    );
  });

  test('rejects numeric priority (Req 7.5)', async () => {
    const { manager } = makeManager();

    await expect(manager.createTask('Task', undefined, 1)).rejects.toThrow(
      'Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low'
    );
  });

  test('does not persist task when priority is invalid (Req 7.5)', async () => {
    const { manager, storage } = makeManager();

    await expect(manager.createTask('Task', undefined, 'Invalid')).rejects.toThrow();
    expect(storage.getTotalCount()).toBe(0);
  });
});

// ─────────────────────────────────────────────
// createTask — Performance (Req 1.3)
// ─────────────────────────────────────────────
describe('TaskManager.createTask() — performance', () => {
  test('completes within 500ms (Req 1.3)', async () => {
    const { manager } = makeManager();
    const start = Date.now();
    await manager.createTask('Performance test task');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(500);
  });

  test('task is persisted within 5 seconds of creation (Req 1.3)', async () => {
    const { manager, storage } = makeManager();
    const start = Date.now();
    const task = await manager.createTask('Persistence test');
    const elapsed = Date.now() - start;

    // Task should be in storage
    expect(() => storage.retrieve(task.id)).not.toThrow();
    expect(elapsed).toBeLessThan(5000);
  });
});
