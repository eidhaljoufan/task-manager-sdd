/**
 * Unit Tests for TaskStorage - Task 3.1
 * 
 * Covers: save(task), retrieve(taskId), delete(taskId)
 * Requirements: 1.3, 3.1, 5.2
 */

const TaskStorage = require('./task-storage');

// Helper to build a minimal valid task object
function makeTask(overrides = {}) {
  return {
    id: 'task-001',
    title: 'Test Task',
    description: 'A test description',
    priority: 'Medium',
    status: 'Incomplete',
    due_date: null,
    creation_date: '2024-01-20T10:30:00Z',
    last_updated: null,
    completion_time: null,
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// save(task)
// ─────────────────────────────────────────────
describe('TaskStorage.save()', () => {
  let storage;

  beforeEach(() => {
    storage = new TaskStorage();
  });

  test('saves a new task and resolves with the task object', async () => {
    const task = makeTask();
    const saved = await storage.save(task);

    expect(saved).toEqual(task);
  });

  test('persisted task can be retrieved immediately after save', async () => {
    const task = makeTask();
    await storage.save(task);

    const retrieved = storage.retrieve(task.id);
    expect(retrieved).toEqual(task);
  });

  test('save operation completes within 5 seconds (Req 1.3)', async () => {
    const task = makeTask();
    const start = Date.now();
    await storage.save(task);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(5000);
  });

  test('saving a task with an existing ID updates it in-place (Req 3.1)', async () => {
    const original = makeTask({ title: 'Original Title' });
    await storage.save(original);

    const updated = makeTask({ title: 'Updated Title' });
    await storage.save(updated);

    const retrieved = storage.retrieve(original.id);
    expect(retrieved.title).toBe('Updated Title');
    // Only one entry should exist for this ID
    expect(storage.getTotalCount()).toBe(1);
  });

  test('saving multiple distinct tasks increments the stored count', async () => {
    await storage.save(makeTask({ id: 'task-001' }));
    await storage.save(makeTask({ id: 'task-002' }));
    await storage.save(makeTask({ id: 'task-003' }));

    expect(storage.getTotalCount()).toBe(3);
  });

  test('all task fields are preserved after save', async () => {
    const task = makeTask({
      id: 'task-full',
      title: 'Full Task',
      description: 'Full description',
      priority: 'High',
      status: 'Incomplete',
      due_date: '2024-12-31',
      creation_date: '2024-01-20T10:30:00Z',
      last_updated: '2024-01-21T08:00:00Z',
      completion_time: null,
    });

    await storage.save(task);
    const retrieved = storage.retrieve(task.id);

    expect(retrieved).toEqual(task);
  });
});

// ─────────────────────────────────────────────
// retrieve(taskId)
// ─────────────────────────────────────────────
describe('TaskStorage.retrieve()', () => {
  let storage;

  beforeEach(() => {
    storage = new TaskStorage();
  });

  test('returns the correct task for a valid ID', async () => {
    const task = makeTask({ id: 'abc-123' });
    await storage.save(task);

    const result = storage.retrieve('abc-123');
    expect(result).toEqual(task);
  });

  test('throws "Tugas tidak ditemukan" when task ID does not exist', () => {
    expect(() => storage.retrieve('non-existent')).toThrow('Tugas tidak ditemukan');
  });

  test('throws "ID tugas tidak valid" when called with no argument', () => {
    expect(() => storage.retrieve()).toThrow('ID tugas tidak valid');
  });

  test('throws "ID tugas tidak valid" when called with null', () => {
    expect(() => storage.retrieve(null)).toThrow('ID tugas tidak valid');
  });

  test('throws "ID tugas tidak valid" when called with empty string', () => {
    expect(() => storage.retrieve('')).toThrow('ID tugas tidak valid');
  });

  test('retrieves the correct task when multiple tasks are stored', async () => {
    const task1 = makeTask({ id: 'id-1', title: 'Task One' });
    const task2 = makeTask({ id: 'id-2', title: 'Task Two' });
    const task3 = makeTask({ id: 'id-3', title: 'Task Three' });

    await Promise.all([storage.save(task1), storage.save(task2), storage.save(task3)]);

    expect(storage.retrieve('id-2').title).toBe('Task Two');
  });
});

// ─────────────────────────────────────────────
// delete(taskId)
// ─────────────────────────────────────────────
describe('TaskStorage.delete()', () => {
  let storage;

  beforeEach(() => {
    storage = new TaskStorage();
  });

  test('returns true when a task is successfully deleted (Req 5.2)', async () => {
    const task = makeTask();
    await storage.save(task);

    const result = storage.delete(task.id);
    expect(result).toBe(true);
  });

  test('deleted task is no longer retrievable', async () => {
    const task = makeTask({ id: 'delete-me' });
    await storage.save(task);
    storage.delete(task.id);

    expect(() => storage.retrieve(task.id)).toThrow('Tugas tidak ditemukan');
  });

  test('total count decrements after deletion', async () => {
    await storage.save(makeTask({ id: 'task-001' }));
    await storage.save(makeTask({ id: 'task-002' }));

    storage.delete('task-001');
    expect(storage.getTotalCount()).toBe(1);
  });

  test('deleting one task does not affect other tasks', async () => {
    const task1 = makeTask({ id: 'keep-1', title: 'Keep Me' });
    const task2 = makeTask({ id: 'delete-2', title: 'Delete Me' });
    await storage.save(task1);
    await storage.save(task2);

    storage.delete('delete-2');

    expect(storage.getTotalCount()).toBe(1);
    expect(storage.retrieve('keep-1').title).toBe('Keep Me');
  });

  test('throws "Tugas tidak ditemukan" when deleting a non-existent task ID', () => {
    expect(() => storage.delete('non-existent')).toThrow('Tugas tidak ditemukan');
  });

  test('throws "ID tugas tidak valid" when called with no argument', () => {
    expect(() => storage.delete()).toThrow('ID tugas tidak valid');
  });

  test('throws "ID tugas tidak valid" when called with null', () => {
    expect(() => storage.delete(null)).toThrow('ID tugas tidak valid');
  });

  test('throws "ID tugas tidak valid" when called with empty string', () => {
    expect(() => storage.delete('')).toThrow('ID tugas tidak valid');
  });

  test('double-delete of same ID throws after first successful delete', async () => {
    const task = makeTask({ id: 'once-only' });
    await storage.save(task);
    storage.delete(task.id);

    expect(() => storage.delete(task.id)).toThrow('Tugas tidak ditemukan');
  });
});

// ─────────────────────────────────────────────
// listTasks(pageNumber, pageSize)
// Requirements: 2.1, 2.6
// ─────────────────────────────────────────────
describe('TaskStorage.listTasks()', () => {
  let storage;

  // Helper to seed storage with n tasks, each with a deterministic
  // creation_date so sort order is predictable.
  async function seedTasks(count) {
    const tasks = [];
    for (let i = 1; i <= count; i++) {
      const task = makeTask({
        id: `list-task-${i}`,
        title: `Task ${i}`,
        // Space timestamps 1 minute apart so sort is unambiguous
        creation_date: new Date(Date.UTC(2024, 0, 1, 0, i)).toISOString(),
      });
      await storage.save(task);
      tasks.push(task);
    }
    return tasks;
  }

  beforeEach(() => {
    storage = new TaskStorage();
  });

  test('returns empty items array when no tasks exist (Req 2.5)', () => {
    const result = storage.listTasks();
    expect(result.items).toEqual([]);
    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
  });

  test('returns correct pagination metadata for first page (Req 2.1)', async () => {
    await seedTasks(10);
    const result = storage.listTasks(1, 5);

    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(5);
    expect(result.totalCount).toBe(10);
    expect(result.totalPages).toBe(2);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(false);
    expect(result.items).toHaveLength(5);
  });

  test('returns correct pagination metadata for last page (Req 2.1)', async () => {
    await seedTasks(10);
    const result = storage.listTasks(2, 5);

    expect(result.currentPage).toBe(2);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(true);
    expect(result.items).toHaveLength(5);
  });

  test('tasks are sorted by creation_date DESC (newest first) (Req 2.6)', async () => {
    await seedTasks(5);
    const result = storage.listTasks(1, 10);

    const dates = result.items.map(t => new Date(t.creation_date).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
    }
  });

  test('uses default pageSize of 50 (Req 2.1)', async () => {
    await seedTasks(10);
    const result = storage.listTasks(1);

    expect(result.pageSize).toBe(50);
    expect(result.items).toHaveLength(10); // only 10 tasks, all fit in one page
  });

  test('partial last page returns correct item count (Req 2.1)', async () => {
    await seedTasks(7);
    const result = storage.listTasks(2, 5);

    expect(result.items).toHaveLength(2);
    expect(result.hasNextPage).toBe(false);
  });

  test('each returned item contains all task fields (Req 2.2)', async () => {
    const task = makeTask({
      id: 'full-task',
      title: 'Full Task',
      description: 'Full desc',
      priority: 'High',
      status: 'Incomplete',
      due_date: '2024-12-31',
    });
    await storage.save(task);
    const result = storage.listTasks(1, 50);

    expect(result.items[0]).toMatchObject({
      id: 'full-task',
      title: 'Full Task',
      description: 'Full desc',
      priority: 'High',
      status: 'Incomplete',
      due_date: '2024-12-31',
    });
  });
});

// ─────────────────────────────────────────────
// listWithFilter(filters, pageNumber, pageSize)
// Requirements: 2.3, 2.4, 7.4
// ─────────────────────────────────────────────
describe('TaskStorage.listWithFilter()', () => {
  let storage;

  beforeEach(async () => {
    storage = new TaskStorage();

    // Seed a mixed set of tasks for filter tests
    const seed = [
      { id: 'f1', title: 'Alpha', priority: 'High',   status: 'Incomplete', creation_date: '2024-01-01T00:01:00Z' },
      { id: 'f2', title: 'Beta',  priority: 'Medium', status: 'Completed',  creation_date: '2024-01-01T00:02:00Z' },
      { id: 'f3', title: 'Gamma', priority: 'Low',    status: 'Incomplete', creation_date: '2024-01-01T00:03:00Z' },
      { id: 'f4', title: 'Delta', priority: 'High',   status: 'Completed',  creation_date: '2024-01-01T00:04:00Z' },
      { id: 'f5', title: 'Epsilon',priority: 'Medium',status: 'Incomplete', creation_date: '2024-01-01T00:05:00Z' },
    ];
    for (const s of seed) {
      await storage.save(makeTask(s));
    }
  });

  test('filter by status=Incomplete returns only incomplete tasks (Req 2.3)', () => {
    const result = storage.listWithFilter({ status: 'Incomplete' });
    expect(result.items.every(t => t.status === 'Incomplete')).toBe(true);
    expect(result.items).toHaveLength(3);
  });

  test('filter by status=Completed returns only completed tasks (Req 2.3)', () => {
    const result = storage.listWithFilter({ status: 'Completed' });
    expect(result.items.every(t => t.status === 'Completed')).toBe(true);
    expect(result.items).toHaveLength(2);
  });

  test('filter by priority=High returns only High priority tasks (Req 2.4)', () => {
    const result = storage.listWithFilter({ priority: 'High' });
    expect(result.items.every(t => t.priority === 'High')).toBe(true);
    expect(result.items).toHaveLength(2);
  });

  test('filter by priority=Medium returns only Medium priority tasks (Req 2.4)', () => {
    const result = storage.listWithFilter({ priority: 'Medium' });
    expect(result.items.every(t => t.priority === 'Medium')).toBe(true);
    expect(result.items).toHaveLength(2);
  });

  test('filter by priority=Low returns only Low priority tasks (Req 2.4)', () => {
    const result = storage.listWithFilter({ priority: 'Low' });
    expect(result.items.every(t => t.priority === 'Low')).toBe(true);
    expect(result.items).toHaveLength(1);
  });

  test('filter by both status and priority applies both criteria (Req 2.3, 2.4)', () => {
    const result = storage.listWithFilter({ status: 'Incomplete', priority: 'High' });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('f1');
  });

  test('returns empty items when no tasks match the filter (Req 2.5)', () => {
    const result = storage.listWithFilter({ status: 'Completed', priority: 'Low' });
    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });

  test('no filters returns all tasks (empty filter object)', () => {
    const result = storage.listWithFilter({});
    expect(result.totalCount).toBe(5);
  });

  test('filtered results are sorted by creation_date DESC (Req 2.6)', () => {
    const result = storage.listWithFilter({ status: 'Incomplete' });
    const dates = result.items.map(t => new Date(t.creation_date).getTime());
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
    }
  });

  test('pagination metadata is correct when filter reduces result set (Req 2.1)', () => {
    const result = storage.listWithFilter({ priority: 'High' }, 1, 1);
    expect(result.totalCount).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(false);
    expect(result.items).toHaveLength(1);
  });

  test('response time is included in result and within 500ms (Req 2.3)', () => {
    const result = storage.listWithFilter({ status: 'Incomplete' });
    expect(result).toHaveProperty('responseTime');
    expect(result.responseTime).toBeLessThan(500);
  });
});

// ─────────────────────────────────────────────
// search(keyword, pageNumber, pageSize)
// Requirements: 6.1, 6.2
// ─────────────────────────────────────────────
describe('TaskStorage.search()', () => {
  let storage;

  beforeEach(async () => {
    storage = new TaskStorage();

    const seed = [
      { id: 's1', title: 'Buy groceries', description: 'Milk and eggs',         creation_date: '2024-01-01T00:01:00Z' },
      { id: 's2', title: 'Buy flowers',   description: 'For the garden',         creation_date: '2024-01-01T00:02:00Z' },
      { id: 's3', title: 'Read a book',   description: 'Start with a novel',     creation_date: '2024-01-01T00:03:00Z' },
      { id: 's4', title: 'Exercise',      description: 'Morning run in the park',creation_date: '2024-01-01T00:04:00Z' },
      { id: 's5', title: 'Write report',  description: 'Quarterly groceries budget', creation_date: '2024-01-01T00:05:00Z' },
    ];
    for (const s of seed) {
      await storage.save(makeTask(s));
    }
  });

  test('case-insensitive partial match on title (Req 6.1)', () => {
    const result = storage.search('BUY');
    const ids = result.items.map(t => t.id);
    expect(ids).toContain('s1');
    expect(ids).toContain('s2');
    expect(ids).not.toContain('s3');
  });

  test('case-insensitive partial match on description (Req 6.1)', () => {
    // "groceries" appears in title of s1 AND description of s5
    const result = storage.search('groceries');
    const ids = result.items.map(t => t.id);
    expect(ids).toContain('s1');
    expect(ids).toContain('s5');
  });

  test('matches description-only when title does not contain keyword (Req 6.1)', () => {
    const result = storage.search('novel');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('s3');
  });

  test('empty keyword returns all tasks (Req 6.5)', () => {
    const result = storage.search('');
    expect(result.totalCount).toBe(5);
  });

  test('whitespace-only keyword returns all tasks (Req 6.5)', () => {
    const result = storage.search('   ');
    expect(result.totalCount).toBe(5);
  });

  test('no matching keyword returns empty items array (Req 6.4)', () => {
    const result = storage.search('xyznonexistent');
    expect(result.items).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });

  test('result count is capped at 100 even when more tasks match (Req 6.2)', async () => {
    // Add 120 additional tasks all matching keyword "bulk"
    for (let i = 0; i < 120; i++) {
      await storage.save(makeTask({
        id: `bulk-${i}`,
        title: `bulk task ${i}`,
        creation_date: new Date(Date.UTC(2024, 5, 1, 0, i)).toISOString(),
      }));
    }

    const result = storage.search('bulk');
    expect(result.totalCount).toBeLessThanOrEqual(100);
    expect(result.items.length).toBeLessThanOrEqual(100);
  });

  test('title matches are ranked before description-only matches (Req 6.2)', () => {
    // 'groceries' is in title of s1 and description of s5
    const result = storage.search('groceries');
    const ids = result.items.map(t => t.id);
    expect(ids.indexOf('s1')).toBeLessThan(ids.indexOf('s5'));
  });

  test('response time is included in result and within 300ms (Req 6.3)', () => {
    const result = storage.search('buy');
    expect(result).toHaveProperty('responseTime');
    expect(result.responseTime).toBeLessThan(300);
  });

  test('pagination metadata is correct for search results (Req 2.1)', () => {
    const result = storage.search('', 1, 3); // empty keyword = all 5 tasks, page 3 items
    expect(result.totalCount).toBe(5);
    expect(result.totalPages).toBe(2);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(false);
    expect(result.items).toHaveLength(3);
  });

  test('search is case-insensitive for mixed-case keywords (Req 6.1)', () => {
    const lower = storage.search('buy');
    const upper = storage.search('BUY');
    const mixed = storage.search('BuY');
    expect(lower.totalCount).toBe(upper.totalCount);
    expect(lower.totalCount).toBe(mixed.totalCount);
  });
});
