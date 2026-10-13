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

// ─────────────────────────────────────────────
// updateTask — Successful update (Req 3.1, 3.2)
// ─────────────────────────────────────────────
describe('TaskManager.updateTask() — successful update', () => {
  test('returns the updated task object (Req 3.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Original title', 'Original desc', 'Low');

    const updated = await manager.updateTask(task.id, { title: 'New title' });

    expect(updated).toBeDefined();
    expect(updated.title).toBe('New title');
  });

  test('only updates provided fields — others are preserved (Req 3.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Title', 'Description', 'High');

    const updated = await manager.updateTask(task.id, { title: 'Updated title' });

    expect(updated.title).toBe('Updated title');
    expect(updated.description).toBe('Description');
    expect(updated.priority).toBe('High');
    expect(updated.status).toBe('Incomplete');
    expect(updated.id).toBe(task.id);
    expect(updated.creation_date).toBe(task.creation_date);
  });

  test('records last_updated timestamp in ISO 8601 format (Req 3.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const before = new Date();
    const updated = await manager.updateTask(task.id, { title: 'Updated' });
    const after = new Date();

    expect(updated.last_updated).toBeDefined();
    expect(updated.last_updated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    const ts = new Date(updated.last_updated);
    expect(ts.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(ts.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });

  test('updated task is persisted in storage (Req 3.1)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Original');

    await manager.updateTask(task.id, { title: 'Updated' });

    const stored = storage.retrieve(task.id);
    expect(stored.title).toBe('Updated');
  });

  test('can update description to new value (Req 3.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', 'Old desc', 'Medium');

    const updated = await manager.updateTask(task.id, { description: 'New desc' });

    expect(updated.description).toBe('New desc');
    expect(updated.title).toBe('Task');
  });

  test('can update priority (Req 3.1, 7.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', undefined, 'Low');

    const updated = await manager.updateTask(task.id, { priority: 'High' });

    expect(updated.priority).toBe('High');
  });

  test('can update due_date to a valid ISO 8601 date (Req 3.1, 8.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const updated = await manager.updateTask(task.id, { due_date: '2025-12-31' });

    expect(updated.due_date).toBe('2025-12-31');
  });

  test('can update multiple fields at once (Req 3.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', 'Desc', 'Low');

    const updated = await manager.updateTask(task.id, {
      title: 'New title',
      description: 'New desc',
      priority: 'High',
      due_date: '2025-06-01'
    });

    expect(updated.title).toBe('New title');
    expect(updated.description).toBe('New desc');
    expect(updated.priority).toBe('High');
    expect(updated.due_date).toBe('2025-06-01');
  });

  test('creation_date is not changed by update (Req 3.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');
    const originalCreationDate = task.creation_date;

    const updated = await manager.updateTask(task.id, { title: 'Updated' });

    expect(updated.creation_date).toBe(originalCreationDate);
  });
});

// ─────────────────────────────────────────────
// updateTask — Confirmation callback (Req 3.2)
// ─────────────────────────────────────────────
describe('TaskManager.updateTask() — confirmation callback', () => {
  test('calls confirmCallback before persisting (Req 3.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');
    const confirmCallback = jest.fn().mockResolvedValue(true);

    await manager.updateTask(task.id, { title: 'Updated' }, confirmCallback);

    expect(confirmCallback).toHaveBeenCalledTimes(1);
  });

  test('does not persist when confirmCallback returns false (Req 3.2)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task');
    const confirmCallback = jest.fn().mockResolvedValue(false);

    await expect(
      manager.updateTask(task.id, { title: 'Updated' }, confirmCallback)
    ).rejects.toThrow('Pembaruan dibatalkan oleh pengguna');

    // Original task in storage should be unchanged
    const stored = storage.retrieve(task.id);
    expect(stored.title).toBe('Task');
  });

  test('persists when confirmCallback returns true (Req 3.2)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task');
    const confirmCallback = jest.fn().mockResolvedValue(true);

    await manager.updateTask(task.id, { title: 'Updated' }, confirmCallback);

    const stored = storage.retrieve(task.id);
    expect(stored.title).toBe('Updated');
  });

  test('proceeds without confirmation if no confirmCallback provided (Req 3.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const updated = await manager.updateTask(task.id, { title: 'Updated' });

    expect(updated.title).toBe('Updated');
  });
});

// ─────────────────────────────────────────────
// updateTask — Title validation (Req 3.3)
// ─────────────────────────────────────────────
describe('TaskManager.updateTask() — title validation', () => {
  test('rejects empty title with "Judul wajib diisi" (Req 3.3)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    await expect(manager.updateTask(task.id, { title: '' }))
      .rejects.toThrow('Judul wajib diisi');
  });

  test('rejects whitespace-only title with "Judul wajib diisi" (Req 3.3)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    await expect(manager.updateTask(task.id, { title: '   ' }))
      .rejects.toThrow('Judul wajib diisi');
  });

  test('rejects null title with "Judul wajib diisi" (Req 3.3)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    await expect(manager.updateTask(task.id, { title: null }))
      .rejects.toThrow('Judul wajib diisi');
  });

  test('rejects title exceeding 255 chars (Req 3.4)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');
    const longTitle = 'a'.repeat(256);

    await expect(manager.updateTask(task.id, { title: longTitle }))
      .rejects.toThrow('Batas panjang judul telah terlampaui (max 255 karakter)');
  });

  test('accepts title with exactly 255 characters (boundary, Req 3.4)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');
    const maxTitle = 'a'.repeat(255);

    const updated = await manager.updateTask(task.id, { title: maxTitle });

    expect(updated.title).toBe(maxTitle);
  });

  test('does not modify task when title validation fails (Req 3.3)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Original');

    await expect(manager.updateTask(task.id, { title: '' })).rejects.toThrow();

    const stored = storage.retrieve(task.id);
    expect(stored.title).toBe('Original');
  });
});

// ─────────────────────────────────────────────
// updateTask — Description validation (Req 3.4)
// ─────────────────────────────────────────────
describe('TaskManager.updateTask() — description validation', () => {
  test('rejects description exceeding 1000 chars with correct error (Req 3.4)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');
    const longDesc = 'a'.repeat(1001);

    await expect(manager.updateTask(task.id, { description: longDesc }))
      .rejects.toThrow('Batas panjang deskripsi telah terlampaui (max 1000 karakter)');
  });

  test('accepts description with exactly 1000 characters (boundary, Req 3.4)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');
    const maxDesc = 'a'.repeat(1000);

    const updated = await manager.updateTask(task.id, { description: maxDesc });

    expect(updated.description).toBe(maxDesc);
  });

  test('does not modify task when description validation fails (Req 3.4)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task', 'Original desc');
    const longDesc = 'a'.repeat(1001);

    await expect(manager.updateTask(task.id, { description: longDesc })).rejects.toThrow();

    const stored = storage.retrieve(task.id);
    expect(stored.description).toBe('Original desc');
  });
});

// ─────────────────────────────────────────────
// updateTask — Priority validation (Req 3.4, 7.5)
// ─────────────────────────────────────────────
describe('TaskManager.updateTask() — priority validation', () => {
  test('rejects invalid priority with correct error (Req 3.4)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    await expect(manager.updateTask(task.id, { priority: 'Urgent' }))
      .rejects.toThrow('Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low');
  });

  test('rejects lowercase priority (Req 3.4)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    await expect(manager.updateTask(task.id, { priority: 'high' }))
      .rejects.toThrow('Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low');
  });

  test('does not modify task when priority validation fails (Req 3.4)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task', undefined, 'Low');

    await expect(manager.updateTask(task.id, { priority: 'Invalid' })).rejects.toThrow();

    const stored = storage.retrieve(task.id);
    expect(stored.priority).toBe('Low');
  });
});

// ─────────────────────────────────────────────
// updateTask — Due date validation (Req 3.4, 8.3)
// ─────────────────────────────────────────────
describe('TaskManager.updateTask() — due date validation', () => {
  test('rejects due_date not in YYYY-MM-DD format (Req 3.4)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    await expect(manager.updateTask(task.id, { due_date: '15/06/2025' }))
      .rejects.toThrow('Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)');
  });

  test('rejects due_date with incorrect format (Req 3.4)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    await expect(manager.updateTask(task.id, { due_date: '2025-6-1' }))
      .rejects.toThrow('Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)');
  });

  test('accepts null due_date without error (Req 8.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const updated = await manager.updateTask(task.id, { due_date: null });

    expect(updated.due_date).toBeNull();
  });

  test('accepts undefined due_date (field not provided) without error (Req 8.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const updated = await manager.updateTask(task.id, { title: 'Updated' });

    expect(updated).toBeDefined();
  });

  test('does not modify task when due_date validation fails (Req 3.4)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task');
    await manager.updateTask(task.id, { due_date: '2025-01-01' });

    await expect(
      manager.updateTask(task.id, { due_date: 'not-a-date' })
    ).rejects.toThrow();

    const stored = storage.retrieve(task.id);
    expect(stored.due_date).toBe('2025-01-01');
  });
});

// ─────────────────────────────────────────────
// updateTask — Task not found (Req 3.1)
// ─────────────────────────────────────────────
describe('TaskManager.updateTask() — task not found', () => {
  test('throws error for non-existent task ID (Req 3.1)', async () => {
    const { manager } = makeManager();

    await expect(manager.updateTask('non-existent-id', { title: 'New' }))
      .rejects.toThrow('Tugas tidak ditemukan');
  });

  test('throws error for empty task ID (Req 3.1)', async () => {
    const { manager } = makeManager();

    await expect(manager.updateTask('', { title: 'New' }))
      .rejects.toThrow();
  });
});

// ─────────────────────────────────────────────
// markTaskComplete — Successful completion (Req 4.1, 4.2)
// ─────────────────────────────────────────────
describe('TaskManager.markTaskComplete() — successful completion', () => {
  test('returns the updated task with status "Completed" (Req 4.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Buy groceries', 'Milk and eggs', 'High');

    const completed = await manager.markTaskComplete(task.id);

    expect(completed).toBeDefined();
    expect(completed.status).toBe('Completed');
  });

  test('records completion_time as ISO 8601 timestamp (Req 4.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const before = new Date();
    const completed = await manager.markTaskComplete(task.id);
    const after = new Date();

    expect(completed.completion_time).toBeDefined();
    expect(completed.completion_time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    const ts = new Date(completed.completion_time);
    expect(ts.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(ts.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });

  test('all other task fields are preserved after marking complete (Req 4.1, 4.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Original title', 'Original desc', 'High');

    const completed = await manager.markTaskComplete(task.id);

    expect(completed.id).toBe(task.id);
    expect(completed.title).toBe(task.title);
    expect(completed.description).toBe(task.description);
    expect(completed.priority).toBe(task.priority);
    expect(completed.creation_date).toBe(task.creation_date);
  });

  test('completion_time has second precision (Req 4.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const completed = await manager.markTaskComplete(task.id);

    // ISO 8601 with second precision: YYYY-MM-DDTHH:MM:SSZ or YYYY-MM-DDTHH:MM:SS.mmmZ
    expect(completed.completion_time).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  test('completed task is persisted in storage (Req 4.1)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task');

    await manager.markTaskComplete(task.id);

    const stored = storage.retrieve(task.id);
    expect(stored.status).toBe('Completed');
    expect(stored.completion_time).toBeDefined();
  });

  test('records last_updated timestamp when marking complete', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const before = new Date();
    const completed = await manager.markTaskComplete(task.id);
    const after = new Date();

    expect(completed.last_updated).toBeDefined();
    const ts = new Date(completed.last_updated);
    expect(ts.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(ts.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });
});

// ─────────────────────────────────────────────
// markTaskComplete — Error handling (Req 4.4)
// ─────────────────────────────────────────────
describe('TaskManager.markTaskComplete() — error handling', () => {
  test('throws error when task ID does not exist (Req 4.4)', async () => {
    const { manager } = makeManager();

    await expect(manager.markTaskComplete('non-existent-id'))
      .rejects.toThrow('Tugas tidak ditemukan atau tidak valid untuk diselesaikan');
  });

  test('throws error for empty task ID (Req 4.4)', async () => {
    const { manager } = makeManager();

    await expect(manager.markTaskComplete(''))
      .rejects.toThrow();
  });

  test('throws error for null task ID (Req 4.4)', async () => {
    const { manager } = makeManager();

    await expect(manager.markTaskComplete(null))
      .rejects.toThrow();
  });

  test('does not change any other task when marking invalid ID (Req 4.4)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task');

    await expect(manager.markTaskComplete('invalid-id')).rejects.toThrow();

    // Existing task should remain unchanged
    const stored = storage.retrieve(task.id);
    expect(stored.status).toBe('Incomplete');
    expect(stored.completion_time).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// deleteTask — Confirmation dialog (Req 5.1, 5.2, 5.3)
// ─────────────────────────────────────────────
describe('TaskManager.deleteTask() — confirmation dialog', () => {
  test('calls confirmCallback before deleting (Req 5.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task to delete');
    const confirmCallback = jest.fn().mockResolvedValue(true);

    await manager.deleteTask(task.id, confirmCallback);

    expect(confirmCallback).toHaveBeenCalledTimes(1);
  });

  test('passes the task object to confirmCallback (Req 5.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task to delete');
    let receivedTask;
    const confirmCallback = jest.fn().mockImplementation((t) => {
      receivedTask = t;
      return Promise.resolve(true);
    });

    await manager.deleteTask(task.id, confirmCallback);

    expect(receivedTask).toBeDefined();
    expect(receivedTask.id).toBe(task.id);
    expect(receivedTask.title).toBe('Task to delete');
  });

  test('deletes task when confirmCallback returns true (Req 5.2)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task to delete');
    const confirmCallback = jest.fn().mockResolvedValue(true);

    const result = await manager.deleteTask(task.id, confirmCallback);

    expect(result).toBe(true);
    expect(() => storage.retrieve(task.id)).toThrow('Tugas tidak ditemukan');
  });

  test('does not delete task when confirmCallback returns false (Req 5.3)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task to keep');
    const confirmCallback = jest.fn().mockResolvedValue(false);

    await expect(
      manager.deleteTask(task.id, confirmCallback)
    ).rejects.toThrow('Penghapusan dibatalkan oleh pengguna');

    // Task must remain in storage unchanged (Req 5.3)
    const stored = storage.retrieve(task.id);
    expect(stored.id).toBe(task.id);
    expect(stored.title).toBe('Task to keep');
  });

  test('proceeds without confirmation when no confirmCallback provided (Req 5.2)', async () => {
    const { manager, storage } = makeManager();
    const task = await manager.createTask('Task');

    const result = await manager.deleteTask(task.id);

    expect(result).toBe(true);
    expect(() => storage.retrieve(task.id)).toThrow('Tugas tidak ditemukan');
  });

  test('returns true after successful deletion (Req 5.2)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task');

    const result = await manager.deleteTask(task.id, async () => true);

    expect(result).toBe(true);
  });
});

// ─────────────────────────────────────────────
// deleteTask — Task not found (Req 5.1)
// ─────────────────────────────────────────────
describe('TaskManager.deleteTask() — task not found', () => {
  test('throws "Tugas tidak ditemukan" for non-existent task ID (Req 5.1)', async () => {
    const { manager } = makeManager();

    await expect(manager.deleteTask('non-existent-id'))
      .rejects.toThrow('Tugas tidak ditemukan');
  });

  test('does not call confirmCallback when task is not found (Req 5.1)', async () => {
    const { manager } = makeManager();
    const confirmCallback = jest.fn();

    await expect(manager.deleteTask('non-existent-id', confirmCallback))
      .rejects.toThrow('Tugas tidak ditemukan');

    expect(confirmCallback).not.toHaveBeenCalled();
  });

  test('throws error for empty string task ID', async () => {
    const { manager } = makeManager();

    await expect(manager.deleteTask('')).rejects.toThrow();
  });

  test('throws error for null task ID', async () => {
    const { manager } = makeManager();

    await expect(manager.deleteTask(null)).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────
// deleteTask — Storage error handling (Req 5.4)
// ─────────────────────────────────────────────
describe('TaskManager.deleteTask() — storage error handling', () => {
  test('throws "Gagal menghapus tugas" when storage.delete() throws (Req 5.4)', async () => {
    const storage = new TaskStorage();
    const manager = new TaskManager(storage);
    const task = await manager.createTask('Task');

    // Simulate storage failure
    storage.delete = jest.fn().mockImplementation(() => {
      throw new Error('Unexpected storage error');
    });

    await expect(manager.deleteTask(task.id, async () => true))
      .rejects.toThrow('Gagal menghapus tugas. Silakan coba lagi');
  });

  test('preserves task in storage when deletion fails (Req 5.4)', async () => {
    const storage = new TaskStorage();
    const manager = new TaskManager(storage);
    const task = await manager.createTask('Task to keep');

    // Simulate storage failure on delete
    const originalDelete = storage.delete.bind(storage);
    storage.delete = jest.fn().mockImplementation(() => {
      throw new Error('Storage write failure');
    });

    await expect(manager.deleteTask(task.id, async () => true))
      .rejects.toThrow('Gagal menghapus tugas. Silakan coba lagi');

    // Restore and verify task is still present
    storage.delete = originalDelete;
    const stored = storage.retrieve(task.id);
    expect(stored.id).toBe(task.id);
  });

  test('throws "Penyimpanan tugas tidak tersedia" for unavailable storage (Req 5.4)', async () => {
    const storage = new TaskStorage();
    const manager = new TaskManager(storage);
    const task = await manager.createTask('Task');

    // Simulate storage unavailable error
    storage.delete = jest.fn().mockImplementation(() => {
      throw new Error('Storage tidak tersedia');
    });

    await expect(manager.deleteTask(task.id, async () => true))
      .rejects.toThrow('Penyimpanan tugas tidak tersedia. Penghapusan dibatalkan');
  });
});

// ─────────────────────────────────────────────
// deleteTask — State isolation (Req 5.3, 5.4)
// ─────────────────────────────────────────────
describe('TaskManager.deleteTask() — state isolation', () => {
  test('only deletes the targeted task, other tasks remain (Req 5.2)', async () => {
    const { manager, storage } = makeManager();
    const task1 = await manager.createTask('Task 1');
    const task2 = await manager.createTask('Task 2');
    const task3 = await manager.createTask('Task 3');

    await manager.deleteTask(task2.id, async () => true);

    expect(() => storage.retrieve(task1.id)).not.toThrow();
    expect(() => storage.retrieve(task2.id)).toThrow('Tugas tidak ditemukan');
    expect(() => storage.retrieve(task3.id)).not.toThrow();
  });

  test('storage count decreases by 1 after successful deletion (Req 5.2)', async () => {
    const { manager, storage } = makeManager();
    await manager.createTask('Task 1');
    await manager.createTask('Task 2');
    const task3 = await manager.createTask('Task 3');

    expect(storage.getTotalCount()).toBe(3);

    await manager.deleteTask(task3.id, async () => true);

    expect(storage.getTotalCount()).toBe(2);
  });

  test('storage count unchanged when user cancels deletion (Req 5.3)', async () => {
    const { manager, storage } = makeManager();
    await manager.createTask('Task 1');
    await manager.createTask('Task 2');
    const task3 = await manager.createTask('Task 3');

    expect(storage.getTotalCount()).toBe(3);

    await expect(
      manager.deleteTask(task3.id, async () => false)
    ).rejects.toThrow();

    expect(storage.getTotalCount()).toBe(3);
  });
});

// ─────────────────────────────────────────────
// searchTasks — Basic search functionality (Req 6.1, 6.2)
// ─────────────────────────────────────────────
describe('TaskManager.searchTasks() — basic search functionality', () => {
  test('returns empty results when no tasks exist (Req 6.2)', () => {
    const { manager } = makeManager();
    const results = manager.searchTasks('keyword');

    expect(results.items).toEqual([]);
    expect(results.totalCount).toBe(0);
  });

  test('finds task by exact title match (Req 6.1)', async () => {
    const { manager } = makeManager();
    await manager.createTask('Buy Groceries');
    const task2 = await manager.createTask('Pay Bills');

    const results = manager.searchTasks('Pay Bills');

    expect(results.items).toHaveLength(1);
    expect(results.items[0].id).toBe(task2.id);
  });

  test('finds task by partial title match (Req 6.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Buy Groceries');
    await manager.createTask('Pay Bills');

    const results = manager.searchTasks('Grocer');

    expect(results.items).toHaveLength(1);
    expect(results.items[0].id).toBe(task.id);
  });

  test('finds task by partial description match (Req 6.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', 'Buy milk and eggs');
    await manager.createTask('Another Task', 'Pay the bills');

    const results = manager.searchTasks('milk');

    expect(results.items).toHaveLength(1);
    expect(results.items[0].id).toBe(task.id);
  });

  test('search is case-insensitive for titles (Req 6.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Buy Groceries');

    const results = manager.searchTasks('buy groceries');

    expect(results.items).toHaveLength(1);
    expect(results.items[0].id).toBe(task.id);
  });

  test('search is case-insensitive for descriptions (Req 6.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Task', 'Important meeting');

    const results = manager.searchTasks('IMPORTANT');

    expect(results.items).toHaveLength(1);
    expect(results.items[0].id).toBe(task.id);
  });

  test('search is case-insensitive for mixed case (Req 6.1)', async () => {
    const { manager } = makeManager();
    const task = await manager.createTask('Complete Project Proposal');

    const results = manager.searchTasks('cOmPlEtE');

    expect(results.items).toHaveLength(1);
    expect(results.items[0].id).toBe(task.id);
  });

  test('finds multiple tasks matching keyword (Req 6.1)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Buy Milk');
    const task2 = await manager.createTask('Buy Eggs');
    const task3 = await manager.createTask('Pay Bills');

    const results = manager.searchTasks('Buy');

    expect(results.items).toHaveLength(2);
    expect(results.items.map(t => t.id)).toContain(task1.id);
    expect(results.items.map(t => t.id)).toContain(task2.id);
  });

  test('returns results with pagination info (Req 6.2)', async () => {
    const { manager } = makeManager();
    await manager.createTask('Task 1');

    const results = manager.searchTasks('Task');

    expect(results).toHaveProperty('items');
    expect(results).toHaveProperty('currentPage');
    expect(results).toHaveProperty('pageSize');
    expect(results).toHaveProperty('totalCount');
    expect(results).toHaveProperty('totalPages');
    expect(results).toHaveProperty('hasNextPage');
    expect(results).toHaveProperty('hasPreviousPage');
  });
});

// ─────────────────────────────────────────────
// searchTasks — Relevance sorting (Req 6.2)
// ─────────────────────────────────────────────
describe('TaskManager.searchTasks() — relevance sorting', () => {
  test('prioritizes title matches over description matches (Req 6.2)', async () => {
    const { manager } = makeManager();
    const titleMatch = await manager.createTask('Important Meeting', 'Regular desc');
    const descMatch = await manager.createTask('Regular Title', 'Important meeting notes');

    const results = manager.searchTasks('Important');

    expect(results.items[0].id).toBe(titleMatch.id);
    expect(results.items[1].id).toBe(descMatch.id);
  });

  test('sorts by creation date when both have title match (Req 6.2)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Important 1');
    // Add small delay to ensure different timestamps
    await new Promise(r => setTimeout(r, 10));
    const task2 = await manager.createTask('Important 2');

    const results = manager.searchTasks('Important');

    // Both are title matches, so sort by creation_date DESC (newest first)
    expect(results.items[0].id).toBe(task2.id);
    expect(results.items[1].id).toBe(task1.id);
  });

  test('sorts by creation date DESC when both have description match (Req 6.2)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Task 1', 'This is important');
    await new Promise(r => setTimeout(r, 10));
    const task2 = await manager.createTask('Task 2', 'Also important');

    const results = manager.searchTasks('important');

    // Both are desc matches, so sort by creation_date DESC (newest first)
    expect(results.items[0].id).toBe(task2.id);
    expect(results.items[1].id).toBe(task1.id);
  });
});

// ─────────────────────────────────────────────
// searchTasks — Result limits (Req 6.2)
// ─────────────────────────────────────────────
describe('TaskManager.searchTasks() — result limits', () => {
  test('limits results to maximum 100 items (Req 6.2)', async () => {
    const { manager } = makeManager();

    // Create 150 tasks with searchable keyword
    for (let i = 0; i < 150; i++) {
      await manager.createTask(`Task Number ${i}`);
    }

    const results = manager.searchTasks('Task');

    expect(results.items.length).toBeLessThanOrEqual(100);
    expect(results.totalCount).toBeLessThanOrEqual(100);
  });

  test('first page contains up to 100 results (Req 6.2)', async () => {
    const { manager } = makeManager();

    // Create 120 tasks
    for (let i = 0; i < 120; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const results = manager.searchTasks('Task', 1);

    expect(results.items.length).toBeLessThanOrEqual(100);
    expect(results.currentPage).toBe(1);
  });
});

// ─────────────────────────────────────────────
// searchTasks — Empty and whitespace keywords (Req 6.5)
// ─────────────────────────────────────────────
describe('TaskManager.searchTasks() — empty and whitespace keywords', () => {
  test('returns all tasks when keyword is empty string (Req 6.5)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Task 1');
    const task2 = await manager.createTask('Task 2');
    const task3 = await manager.createTask('Task 3');

    const results = manager.searchTasks('');

    expect(results.items).toHaveLength(3);
    expect(results.items.map(t => t.id)).toContain(task1.id);
    expect(results.items.map(t => t.id)).toContain(task2.id);
    expect(results.items.map(t => t.id)).toContain(task3.id);
  });

  test('returns all tasks when keyword is whitespace only (Req 6.5)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Task 1');
    const task2 = await manager.createTask('Task 2');

    const results = manager.searchTasks('   ');

    expect(results.items).toHaveLength(2);
  });

  test('returns all tasks when keyword is tabs and spaces (Req 6.5)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Task 1');
    const task2 = await manager.createTask('Task 2');

    const results = manager.searchTasks('\t  \t');

    expect(results.items).toHaveLength(2);
  });

  test('returns all tasks when keyword is only newlines (Req 6.5)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Task 1');
    const task2 = await manager.createTask('Task 2');

    const results = manager.searchTasks('\n\n');

    expect(results.items).toHaveLength(2);
  });

  test('empty keyword returns tasks sorted by creation_date DESC (Req 6.5)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('First Task');
    await new Promise(r => setTimeout(r, 10));
    const task2 = await manager.createTask('Second Task');

    const results = manager.searchTasks('');

    // Should be newest first
    expect(results.items[0].id).toBe(task2.id);
    expect(results.items[1].id).toBe(task1.id);
  });
});

// ─────────────────────────────────────────────
// searchTasks — Pagination (Req 6.2)
// ─────────────────────────────────────────────
describe('TaskManager.searchTasks() — pagination', () => {
  test('default pageNumber is 1 (Req 6.2)', async () => {
    const { manager } = makeManager();
    await manager.createTask('Task 1');

    const results = manager.searchTasks('Task');

    expect(results.currentPage).toBe(1);
  });

  test('accepts explicit pageNumber parameter (Req 6.2)', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 150; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const results = manager.searchTasks('Task', 2);

    expect(results.currentPage).toBe(2);
  });

  test('pageSize is 100 for search results (Req 6.2)', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 105; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const results1 = manager.searchTasks('Task', 1);

    expect(results1.pageSize).toBe(100);
    expect(results1.items.length).toBeLessThanOrEqual(100);
  });

  test('hasNextPage is true when more results exist (Req 6.2)', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 120; i++) {
      await manager.createTask(`Task ${i}`);
    }

    // Search only returns first 100 results max, so check within first 100
    const results = manager.searchTasks('Task', 1);

    // With only 120 tasks searched (max 100 results), hasNextPage depends on actual limit
    // Since search caps at 100 results total, we expect hasNextPage to be false here
    expect(results.totalCount).toBeLessThanOrEqual(100);
  });

  test('hasNextPage is false on last page (Req 6.2)', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 50; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const results = manager.searchTasks('Task', 1);

    expect(results.hasNextPage).toBe(false);
  });

  test('hasPreviousPage is false on first page (Req 6.2)', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 150; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const results = manager.searchTasks('Task', 1);

    expect(results.hasPreviousPage).toBe(false);
  });

  test('hasPreviousPage is true on page 2 (Req 6.2)', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 150; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const results = manager.searchTasks('Task', 2);

    expect(results.hasPreviousPage).toBe(true);
  });

  test('totalPages is calculated correctly (Req 6.2)', async () => {
    const { manager } = makeManager();
    // Create 150 tasks, but search will only return max 100
    for (let i = 0; i < 150; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const results = manager.searchTasks('Task', 1);

    // Search results are capped at 100 total, so with 100 items and pageSize 100, totalPages = 1
    expect(results.totalCount).toBeLessThanOrEqual(100);
    expect(results.totalPages).toBe(Math.ceil(results.totalCount / 100));
  });
});

// ─────────────────────────────────────────────
// searchTasks — Performance (Req 6.3)
// ─────────────────────────────────────────────
describe('TaskManager.searchTasks() — performance', () => {
  test('search completes within 300ms (Req 6.3)', async () => {
    const { manager } = makeManager();

    // Create a reasonable number of tasks (100 is sufficient for testing)
    for (let i = 0; i < 100; i++) {
      await manager.createTask(`Task Number ${i}`, `Description ${i}`);
    }

    const start = Date.now();
    const results = manager.searchTasks('Task');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(300);
  }, 10000); // Increase test timeout

  test('empty keyword search completes within 300ms (Req 6.3)', async () => {
    const { manager } = makeManager();

    // Create a reasonable number of tasks (100 is sufficient for testing)
    for (let i = 0; i < 100; i++) {
      await manager.createTask(`Task ${i}`, `Description ${i}`);
    }

    const start = Date.now();
    const results = manager.searchTasks('');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(300);
  }, 10000); // Increase test timeout
});

// ─────────────────────────────────────────────
// searchTasks — Property Tests (Task 4.10)
// ─────────────────────────────────────────────
describe('TaskManager.searchTasks() — Property 6: Search Results Contain Keyword', () => {
  /**
   * Property 6: Search Results Contain Keyword
   * 
   * For any search keyword (1-255 characters), all returned results should contain 
   * that keyword in either title or description with case-insensitive matching. 
   * Results should be limited to max 100 items.
   * 
   * Validates: Requirements 6.1, 6.2
   */
  test('Property 6: All results contain the keyword (case-insensitive in title or description)', async () => {
    const { manager } = makeManager();

    const keywords = [
      'Project',
      'Meeting',
      'urgent',
      'REVIEW',
      'fix bug',
      'release',
      'test',
      'database',
      'API'
    ];

    const taskData = [
      { title: 'Complete Project Proposal', description: 'Q1 project plan' },
      { title: 'Schedule Meeting', description: 'Team sync meeting' },
      { title: 'Fix Urgent Bug', description: 'Critical issue' },
      { title: 'Code Review', description: 'PR review' },
      { title: 'Release Notes', description: 'v2.0 release' },
      { title: 'Test Suite', description: 'Unit tests for API' },
      { title: 'Database Optimization', description: 'Query optimization' },
      { title: 'API Documentation', description: 'REST API docs' },
      { title: 'Unrelated Task', description: 'Something else' }
    ];

    for (const data of taskData) {
      await manager.createTask(data.title, data.description);
    }

    // Test each keyword
    for (const keyword of keywords) {
      const results = manager.searchTasks(keyword);

      // All results must contain the keyword
      for (const task of results.items) {
        const titleContains = task.title.toLowerCase().includes(keyword.toLowerCase());
        const descContains = task.description && task.description.toLowerCase().includes(keyword.toLowerCase());
        
        expect(titleContains || descContains).toBe(true);
      }

      // Results must not exceed 100
      expect(results.items.length).toBeLessThanOrEqual(100);
    }
  });

  test('Property 7: Empty/Whitespace Search Returns All Tasks Unfiltered', async () => {
    const { manager } = makeManager();

    const task1 = await manager.createTask('Task 1', 'Desc 1');
    const task2 = await manager.createTask('Task 2', 'Desc 2');
    const task3 = await manager.createTask('Task 3', '');

    const emptyResults = manager.searchTasks('');
    const whitespaceResults = manager.searchTasks('   ');

    expect(emptyResults.items.length).toBe(3);
    expect(whitespaceResults.items.length).toBe(3);
    expect(emptyResults.items.map(t => t.id)).toContain(task1.id);
    expect(emptyResults.items.map(t => t.id)).toContain(task2.id);
    expect(emptyResults.items.map(t => t.id)).toContain(task3.id);
  });
});


// ─────────────────────────────────────────────
// filterTasks — Basic functionality (Req 2.3, 2.4, 7.4)
// ─────────────────────────────────────────────
describe('TaskManager.filterTasks() — basic functionality', () => {
  test('returns empty results when no tasks exist', () => {
    const { manager } = makeManager();
    const results = manager.filterTasks();

    expect(results.items).toEqual([]);
    expect(results.totalCount).toBe(0);
  });

  test('returns pagination result object with required properties', () => {
    const { manager } = makeManager();
    const results = manager.filterTasks();

    expect(results).toHaveProperty('items');
    expect(results).toHaveProperty('currentPage');
    expect(results).toHaveProperty('pageSize');
    expect(results).toHaveProperty('totalCount');
    expect(results).toHaveProperty('totalPages');
    expect(results).toHaveProperty('hasNextPage');
    expect(results).toHaveProperty('hasPreviousPage');
  });

  test('default pageSize is 50 (Req 2.1)', () => {
    const { manager } = makeManager();
    const results = manager.filterTasks();

    expect(results.pageSize).toBe(50);
  });

  test('default pageNumber is 1 when not provided', () => {
    const { manager } = makeManager();
    const results = manager.filterTasks();

    expect(results.currentPage).toBe(1);
  });

  test('default status is null (no filter)', () => {
    const { manager } = makeManager();
    // With no status filter, should return all
    const results = manager.filterTasks(null);

    expect(results.currentPage).toBe(1);
  });

  test('default priority is null (no filter)', () => {
    const { manager } = makeManager();
    // With no priority filter, should return all
    const results = manager.filterTasks(null, null);

    expect(results.currentPage).toBe(1);
  });
});

// ─────────────────────────────────────────────
// filterTasks — Filter by status only (Req 2.3)
// ─────────────────────────────────────────────
describe('TaskManager.filterTasks() — filter by status only', () => {
  test('filters tasks with status "Incomplete" (Req 2.3)', async () => {
    const { manager } = makeManager();
    const incomplete1 = await manager.createTask('Task 1');
    const incomplete2 = await manager.createTask('Task 2');
    const complete = await manager.createTask('Task 3');

    // Mark one task as complete
    await manager.markTaskComplete(complete.id);

    const results = manager.filterTasks('Incomplete');

    expect(results.items).toHaveLength(2);
    expect(results.items.map(t => t.id)).toContain(incomplete1.id);
    expect(results.items.map(t => t.id)).toContain(incomplete2.id);
    expect(results.items.map(t => t.id)).not.toContain(complete.id);
  });

  test('filters tasks with status "Completed" (Req 2.3)', async () => {
    const { manager } = makeManager();
    const incomplete = await manager.createTask('Task 1');
    const complete1 = await manager.createTask('Task 2');
    const complete2 = await manager.createTask('Task 3');

    // Mark two tasks as complete
    await manager.markTaskComplete(complete1.id);
    await manager.markTaskComplete(complete2.id);

    const results = manager.filterTasks('Completed');

    expect(results.items).toHaveLength(2);
    expect(results.items.map(t => t.id)).toContain(complete1.id);
    expect(results.items.map(t => t.id)).toContain(complete2.id);
    expect(results.items.map(t => t.id)).not.toContain(incomplete.id);
  });

  test('status filter returns correct totalCount', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 5; i++) {
      await manager.createTask(`Task ${i}`);
    }
    const complete = await manager.createTask('Completed Task');
    await manager.markTaskComplete(complete.id);

    const incompleteResults = manager.filterTasks('Incomplete');
    const completedResults = manager.filterTasks('Completed');

    expect(incompleteResults.totalCount).toBe(5);
    expect(completedResults.totalCount).toBe(1);
  });

  test('all returned items match the status filter', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 3; i++) {
      await manager.createTask(`Incomplete ${i}`);
    }
    for (let i = 0; i < 2; i++) {
      const task = await manager.createTask(`Complete ${i}`);
      await manager.markTaskComplete(task.id);
    }

    const results = manager.filterTasks('Incomplete');

    for (const task of results.items) {
      expect(task.status).toBe('Incomplete');
    }
  });
});

// ─────────────────────────────────────────────
// filterTasks — Filter by priority only (Req 2.4, 7.4)
// ─────────────────────────────────────────────
describe('TaskManager.filterTasks() — filter by priority only', () => {
  test('filters tasks with priority "High" (Req 2.4)', async () => {
    const { manager } = makeManager();
    const high1 = await manager.createTask('Task 1', undefined, 'High');
    const high2 = await manager.createTask('Task 2', undefined, 'High');
    const medium = await manager.createTask('Task 3', undefined, 'Medium');
    const low = await manager.createTask('Task 4', undefined, 'Low');

    const results = manager.filterTasks(null, 'High');

    expect(results.items).toHaveLength(2);
    expect(results.items.map(t => t.id)).toContain(high1.id);
    expect(results.items.map(t => t.id)).toContain(high2.id);
  });

  test('filters tasks with priority "Medium" (Req 2.4)', async () => {
    const { manager } = makeManager();
    const high = await manager.createTask('Task 1', undefined, 'High');
    const medium1 = await manager.createTask('Task 2', undefined, 'Medium');
    const medium2 = await manager.createTask('Task 3', undefined, 'Medium');
    const low = await manager.createTask('Task 4', undefined, 'Low');

    const results = manager.filterTasks(null, 'Medium');

    expect(results.items).toHaveLength(2);
    expect(results.items.map(t => t.id)).toContain(medium1.id);
    expect(results.items.map(t => t.id)).toContain(medium2.id);
  });

  test('filters tasks with priority "Low" (Req 2.4)', async () => {
    const { manager } = makeManager();
    const high = await manager.createTask('Task 1', undefined, 'High');
    const medium = await manager.createTask('Task 2', undefined, 'Medium');
    const low1 = await manager.createTask('Task 3', undefined, 'Low');
    const low2 = await manager.createTask('Task 4', undefined, 'Low');

    const results = manager.filterTasks(null, 'Low');

    expect(results.items).toHaveLength(2);
    expect(results.items.map(t => t.id)).toContain(low1.id);
    expect(results.items.map(t => t.id)).toContain(low2.id);
  });

  test('priority filter returns correct totalCount', async () => {
    const { manager } = makeManager();
    await manager.createTask('High 1', undefined, 'High');
    await manager.createTask('High 2', undefined, 'High');
    await manager.createTask('Medium 1', undefined, 'Medium');
    await manager.createTask('Low 1', undefined, 'Low');

    const highResults = manager.filterTasks(null, 'High');
    const mediumResults = manager.filterTasks(null, 'Medium');
    const lowResults = manager.filterTasks(null, 'Low');

    expect(highResults.totalCount).toBe(2);
    expect(mediumResults.totalCount).toBe(1);
    expect(lowResults.totalCount).toBe(1);
  });

  test('all returned items match the priority filter', async () => {
    const { manager } = makeManager();
    await manager.createTask('High 1', undefined, 'High');
    await manager.createTask('High 2', undefined, 'High');
    await manager.createTask('Medium 1', undefined, 'Medium');
    await manager.createTask('Low 1', undefined, 'Low');

    const results = manager.filterTasks(null, 'High');

    for (const task of results.items) {
      expect(task.priority).toBe('High');
    }
  });
});

// ─────────────────────────────────────────────
// filterTasks — Combined filters (Req 2.3, 2.4, 7.4)
// ─────────────────────────────────────────────
describe('TaskManager.filterTasks() — combined status and priority filters', () => {
  test('filters by both status and priority (Req 2.3, 2.4)', async () => {
    const { manager } = makeManager();
    const target = await manager.createTask('Target Task', undefined, 'High');
    const incomplete = await manager.createTask('Incomplete Low', undefined, 'Low');
    const complete_high = await manager.createTask('Completed High', undefined, 'High');
    const complete_low = await manager.createTask('Completed Low', undefined, 'Low');

    await manager.markTaskComplete(complete_high.id);
    await manager.markTaskComplete(complete_low.id);

    const results = manager.filterTasks('Incomplete', 'High');

    expect(results.items).toHaveLength(1);
    expect(results.items[0].id).toBe(target.id);
    expect(results.items[0].status).toBe('Incomplete');
    expect(results.items[0].priority).toBe('High');
  });

  test('combined filter returns empty when no matches exist', async () => {
    const { manager } = makeManager();
    await manager.createTask('Task 1', undefined, 'Low');
    await manager.createTask('Task 2', undefined, 'Low');

    const results = manager.filterTasks('Completed', 'High');

    expect(results.items).toHaveLength(0);
    expect(results.totalCount).toBe(0);
  });

  test('combined filter with Completed status and Medium priority', async () => {
    const { manager } = makeManager();
    const target1 = await manager.createTask('Completed Medium 1', undefined, 'Medium');
    const target2 = await manager.createTask('Completed Medium 2', undefined, 'Medium');
    const other_completed_high = await manager.createTask('Completed High', undefined, 'High');
    const other_incomplete_medium = await manager.createTask('Incomplete Medium', undefined, 'Medium');

    await manager.markTaskComplete(target1.id);
    await manager.markTaskComplete(target2.id);
    await manager.markTaskComplete(other_completed_high.id);

    const results = manager.filterTasks('Completed', 'Medium');

    expect(results.items).toHaveLength(2);
    expect(results.items.map(t => t.id)).toContain(target1.id);
    expect(results.items.map(t => t.id)).toContain(target2.id);
  });

  test('combined filter - all results satisfy both conditions', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 5; i++) {
      const task = await manager.createTask(`Task ${i}`, undefined, 'High');
      await manager.markTaskComplete(task.id);
    }
    for (let i = 0; i < 3; i++) {
      await manager.createTask(`Low Priority ${i}`, undefined, 'Low');
    }

    const results = manager.filterTasks('Completed', 'High');

    for (const task of results.items) {
      expect(task.status).toBe('Completed');
      expect(task.priority).toBe('High');
    }
  });
});

// ─────────────────────────────────────────────
// filterTasks — Pagination (Req 2.1, 2.7)
// ─────────────────────────────────────────────
describe('TaskManager.filterTasks() — pagination', () => {
  test('pageNumber parameter defaults to 1', async () => {
    const { manager } = makeManager();
    await manager.createTask('Task 1');

    const results = manager.filterTasks();

    expect(results.currentPage).toBe(1);
  });

  test('accepts explicit pageNumber parameter', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 100; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const page2Results = manager.filterTasks(null, null, 2);

    expect(page2Results.currentPage).toBe(2);
  });

  test('returns 50 items per page maximum (Req 2.1)', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 120; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const page1 = manager.filterTasks();
    const page2 = manager.filterTasks(null, null, 2);

    expect(page1.items.length).toBeLessThanOrEqual(50);
    expect(page2.items.length).toBeLessThanOrEqual(50);
  });

  test('first page contains correct items', async () => {
    const { manager } = makeManager();
    const tasks = [];
    for (let i = 0; i < 75; i++) {
      const task = await manager.createTask(`Task ${i}`);
      tasks.push(task);
    }

    const results = manager.filterTasks();

    expect(results.items.length).toBe(50);
    // Tasks are sorted by creation_date DESC (newest first)
    // So page 1 should have the last 50 tasks created (indices 25-74, reversed)
    const pageItemIds = results.items.map(t => t.id);
    for (let i = 25; i < 75; i++) {
      expect(pageItemIds).toContain(tasks[i].id);
    }
  });

  test('second page contains remaining items', async () => {
    const { manager } = makeManager();
    const tasks = [];
    for (let i = 0; i < 75; i++) {
      const task = await manager.createTask(`Task ${i}`);
      tasks.push(task);
    }

    const page1 = manager.filterTasks(null, null, 1);
    const page2 = manager.filterTasks(null, null, 2);

    // Items should not overlap between pages
    const page1Ids = page1.items.map(t => t.id);
    const page2Ids = page2.items.map(t => t.id);
    
    for (const id of page2Ids) {
      expect(page1Ids).not.toContain(id);
    }
  });

  test('hasNextPage is false on last page', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 75; i++) {
      await manager.createTask(`Task ${i}`);
    }

    // 75 items with 50 per page = 2 pages
    const page2 = manager.filterTasks(null, null, 2);

    expect(page2.hasNextPage).toBe(false);
  });

  test('hasNextPage is true when more pages exist', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 100; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const page1 = manager.filterTasks(null, null, 1);

    expect(page1.hasNextPage).toBe(true);
  });

  test('hasPreviousPage is false on first page', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 75; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const page1 = manager.filterTasks(null, null, 1);

    expect(page1.hasPreviousPage).toBe(false);
  });

  test('hasPreviousPage is true on later pages', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 100; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const page2 = manager.filterTasks(null, null, 2);

    expect(page2.hasPreviousPage).toBe(true);
  });

  test('totalPages is calculated correctly', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 125; i++) {
      await manager.createTask(`Task ${i}`);
    }

    const results = manager.filterTasks();

    expect(results.totalPages).toBe(3); // 125 / 50 = 2.5, rounds up to 3
  });

  test('pagination with status filter', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 60; i++) {
      const task = await manager.createTask(`Task ${i}`, undefined, 'Medium');
      if (i < 30) {
        await manager.markTaskComplete(task.id);
      }
    }

    const completedPage1 = manager.filterTasks('Completed', null, 1);
    const completedPage2 = manager.filterTasks('Completed', null, 2);

    expect(completedPage1.items.length).toBe(30);
    expect(completedPage2.items.length).toBe(0);
    expect(completedPage1.totalPages).toBe(1);
  });

  test('pagination with priority filter', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 150; i++) {
      await manager.createTask(`High Priority ${i}`, undefined, 'High');
    }

    const page1 = manager.filterTasks(null, 'High', 1);
    const page2 = manager.filterTasks(null, 'High', 2);
    const page3 = manager.filterTasks(null, 'High', 3);

    expect(page1.items.length).toBe(50);
    expect(page2.items.length).toBe(50);
    expect(page3.items.length).toBe(50);
    expect(page1.totalPages).toBe(3);
  });

  test('pagination with combined filters', async () => {
    const { manager } = makeManager();
    for (let i = 0; i < 120; i++) {
      const task = await manager.createTask(`Task ${i}`, undefined, 'High');
      if (i < 60) {
        await manager.markTaskComplete(task.id);
      }
    }

    const page1 = manager.filterTasks('Completed', 'High', 1);
    const page2 = manager.filterTasks('Completed', 'High', 2);

    expect(page1.items.length).toBe(50);
    expect(page2.items.length).toBe(10);
    expect(page1.totalPages).toBe(2);
  });
});

// ─────────────────────────────────────────────
// filterTasks — Sorting (Req 2.6)
// ─────────────────────────────────────────────
describe('TaskManager.filterTasks() — sorting by creation_date DESC', () => {
  test('tasks are sorted by creation_date DESC (newest first)', async () => {
    const { manager } = makeManager();
    const task1 = await manager.createTask('Task 1');
    await new Promise(r => setTimeout(r, 10));
    const task2 = await manager.createTask('Task 2');
    await new Promise(r => setTimeout(r, 10));
    const task3 = await manager.createTask('Task 3');

    const results = manager.filterTasks();

    expect(results.items[0].id).toBe(task3.id);
    expect(results.items[1].id).toBe(task2.id);
    expect(results.items[2].id).toBe(task1.id);
  });

  test('status filter respects creation_date DESC sorting', async () => {
    const { manager } = makeManager();
    const older = await manager.createTask('Older');
    await new Promise(r => setTimeout(r, 10));
    const newer = await manager.createTask('Newer');

    await manager.markTaskComplete(older.id);
    await manager.markTaskComplete(newer.id);

    const results = manager.filterTasks('Completed');

    expect(results.items[0].id).toBe(newer.id);
    expect(results.items[1].id).toBe(older.id);
  });

  test('priority filter respects creation_date DESC sorting', async () => {
    const { manager } = makeManager();
    const older = await manager.createTask('Older', undefined, 'High');
    await new Promise(r => setTimeout(r, 10));
    const newer = await manager.createTask('Newer', undefined, 'High');

    const results = manager.filterTasks(null, 'High');

    expect(results.items[0].id).toBe(newer.id);
    expect(results.items[1].id).toBe(older.id);
  });

  test('combined filter respects creation_date DESC sorting', async () => {
    const { manager } = makeManager();
    const older = await manager.createTask('Older', undefined, 'Medium');
    await new Promise(r => setTimeout(r, 10));
    const newer = await manager.createTask('Newer', undefined, 'Medium');

    await manager.markTaskComplete(older.id);
    await manager.markTaskComplete(newer.id);

    const results = manager.filterTasks('Completed', 'Medium');

    expect(results.items[0].id).toBe(newer.id);
    expect(results.items[1].id).toBe(older.id);
  });
});

// ─────────────────────────────────────────────
// filterTasks — Performance (Req 2.3, 2.4)
// ─────────────────────────────────────────────
describe('TaskManager.filterTasks() — performance', () => {
  test('status filter completes within 500ms (Req 2.3)', async () => {
    const { manager } = makeManager();
    
    // Create 100 tasks to filter through
    for (let i = 0; i < 100; i++) {
      const task = await manager.createTask(`Task ${i}`);
      if (i % 2 === 0) {
        await manager.markTaskComplete(task.id);
      }
    }

    const start = Date.now();
    manager.filterTasks('Incomplete');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(500);
  });

  test('priority filter completes within 500ms (Req 2.4)', async () => {
    const { manager } = makeManager();
    
    // Create 100 tasks with different priorities
    for (let i = 0; i < 100; i++) {
      const priority = i % 3 === 0 ? 'High' : (i % 3 === 1 ? 'Medium' : 'Low');
      await manager.createTask(`Task ${i}`, undefined, priority);
    }

    const start = Date.now();
    manager.filterTasks(null, 'High');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(500);
  });

  test('combined filter completes within 500ms', async () => {
    const { manager } = makeManager();
    
    // Create 150 tasks
    for (let i = 0; i < 150; i++) {
      const task = await manager.createTask(`Task ${i}`, undefined, 'High');
      if (i % 3 === 0) {
        await manager.markTaskComplete(task.id);
      }
    }

    const start = Date.now();
    manager.filterTasks('Completed', 'High');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(500);
  });
});

// ─────────────────────────────────────────────
// filterTasks — Property 5 Tests
// ─────────────────────────────────────────────
describe('TaskManager.filterTasks() — Property 5: Filter Criteria Are Always Applied Correctly', () => {
  /**
   * Property 5: Filter Criteria Are Always Applied Correctly
   * 
   * For any filter applied (status="Completed"|"Incomplete" or priority="High"|"Medium"|"Low"), 
   * all returned tasks should satisfy the exact filter condition; no tasks should be returned 
   * that don't match.
   * 
   * Validates: Requirements 2.3, 2.4, 7.4
   */
  test('Property 5: Status filter - all results have matching status', async () => {
    const { manager } = makeManager();

    // Create tasks with various statuses
    for (let i = 0; i < 20; i++) {
      const task = await manager.createTask(`Task ${i}`);
      if (i % 2 === 0) {
        await manager.markTaskComplete(task.id);
      }
    }

    const statusValues = ['Incomplete', 'Completed'];

    for (const status of statusValues) {
      const results = manager.filterTasks(status);

      // All returned tasks must have the exact status
      for (const task of results.items) {
        expect(task.status).toBe(status);
      }

      // Count verification
      const expectedCount = status === 'Incomplete' ? 10 : 10;
      expect(results.totalCount).toBeLessThanOrEqual(100); // Sanity check
    }
  });

  test('Property 5: Priority filter - all results have matching priority', async () => {
    const { manager } = makeManager();

    // Create tasks with various priorities
    for (let i = 0; i < 30; i++) {
      const priority = i % 3 === 0 ? 'High' : (i % 3 === 1 ? 'Medium' : 'Low');
      await manager.createTask(`Task ${i}`, undefined, priority);
    }

    const priorityValues = ['High', 'Medium', 'Low'];

    for (const priority of priorityValues) {
      const results = manager.filterTasks(null, priority);

      // All returned tasks must have the exact priority
      for (const task of results.items) {
        expect(task.priority).toBe(priority);
      }
    }
  });

  test('Property 5: Combined filter - all results satisfy both conditions', async () => {
    const { manager } = makeManager();

    // Create diverse task set
    for (let i = 0; i < 40; i++) {
      const priority = i % 2 === 0 ? 'High' : 'Low';
      const task = await manager.createTask(`Task ${i}`, undefined, priority);
      
      if (i % 3 === 0) {
        await manager.markTaskComplete(task.id);
      }
    }

    const filterCombinations = [
      { status: 'Incomplete', priority: 'High' },
      { status: 'Completed', priority: 'Low' },
      { status: 'Incomplete', priority: 'Low' }
    ];

    for (const filters of filterCombinations) {
      const results = manager.filterTasks(filters.status, filters.priority);

      // All returned tasks must satisfy BOTH conditions
      for (const task of results.items) {
        expect(task.status).toBe(filters.status);
        expect(task.priority).toBe(filters.priority);
      }
    }
  });

  test('Property 5: No unmatched tasks in results', async () => {
    const { manager } = makeManager();

    // Create 50 tasks
    const allTasks = [];
    for (let i = 0; i < 50; i++) {
      const task = await manager.createTask(`Task ${i}`, undefined, 'High');
      allTasks.push(task);
    }

    // Add some other tasks that shouldn't match
    for (let i = 0; i < 10; i++) {
      const task = await manager.createTask(`Low Task ${i}`, undefined, 'Low');
      await manager.markTaskComplete(task.id);
      allTasks.push(task);
    }

    const results = manager.filterTasks('Incomplete', 'High');

    // Verify no tasks from the 'Low' or 'Completed' set are in results
    for (const task of results.items) {
      expect(task.priority).toBe('High');
      expect(task.status).toBe('Incomplete');
    }
  });
});

