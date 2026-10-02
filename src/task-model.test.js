/**
 * Unit tests for Task data model and constants
 */

const {
  Task,
  Priority_Level,
  Completion_Status,
  VALID_PRIORITIES,
  VALID_STATUSES,
  generateId,
  generateTimestamp,
  generateDateOnly,
} = require("./task-model");

describe("Priority_Level Enum", () => {
  test("should contain all priority levels", () => {
    expect(Priority_Level.HIGH).toBe("High");
    expect(Priority_Level.MEDIUM).toBe("Medium");
    expect(Priority_Level.LOW).toBe("Low");
  });

  test("VALID_PRIORITIES should contain all valid priorities", () => {
    expect(VALID_PRIORITIES).toContain("High");
    expect(VALID_PRIORITIES).toContain("Medium");
    expect(VALID_PRIORITIES).toContain("Low");
    expect(VALID_PRIORITIES.length).toBe(3);
  });
});

describe("Completion_Status Enum", () => {
  test("should contain all completion statuses", () => {
    expect(Completion_Status.INCOMPLETE).toBe("Incomplete");
    expect(Completion_Status.COMPLETED).toBe("Completed");
  });

  test("VALID_STATUSES should contain all valid statuses", () => {
    expect(VALID_STATUSES).toContain("Incomplete");
    expect(VALID_STATUSES).toContain("Completed");
    expect(VALID_STATUSES.length).toBe(2);
  });
});

describe("generateId()", () => {
  test("should generate a unique ID in UUID format", () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  test("should generate different IDs on each call", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });
});

describe("generateTimestamp()", () => {
  test("should generate ISO 8601 timestamp with Z suffix", () => {
    const timestamp = generateTimestamp();
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });

  test("should be within a few seconds of current time", () => {
    const timestamp = generateTimestamp();
    const timestampDate = new Date(timestamp);
    const now = new Date();
    const diffMs = Math.abs(now.getTime() - timestampDate.getTime());
    expect(diffMs).toBeLessThan(5000); // Within 5 seconds
  });

  test("should not include milliseconds", () => {
    const timestamp = generateTimestamp();
    expect(timestamp).not.toMatch(/\.\d{3}Z$/);
  });
});

describe("generateDateOnly()", () => {
  test("should generate ISO 8601 date without time", () => {
    const date = generateDateOnly();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("should be today's date", () => {
    const dateOnly = generateDateOnly();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const expectedDate = `${year}-${month}-${day}`;
    expect(dateOnly).toBe(expectedDate);
  });
});

describe("Task class", () => {
  test("should create a task with all properties", () => {
    const task = new Task(
      "Buy groceries",
      Priority_Level.HIGH,
      "Need milk, eggs, bread",
      Completion_Status.INCOMPLETE,
      "2024-12-25"
    );

    expect(task.title).toBe("Buy groceries");
    expect(task.priority).toBe("High");
    expect(task.description).toBe("Need milk, eggs, bread");
    expect(task.status).toBe("Incomplete");
    expect(task.due_date).toBe("2024-12-25");
    expect(task.id).toBeDefined();
    expect(task.creation_date).toBeDefined();
  });

  test("should set default priority to Medium when not provided", () => {
    const task = new Task("Buy groceries");
    expect(task.priority).toBe(Priority_Level.MEDIUM);
  });

  test("should set default status to Incomplete when not provided", () => {
    const task = new Task("Buy groceries");
    expect(task.status).toBe(Completion_Status.INCOMPLETE);
  });

  test("should generate an ID when not provided", () => {
    const task1 = new Task("Task 1");
    const task2 = new Task("Task 2");

    expect(task1.id).toBeDefined();
    expect(task2.id).toBeDefined();
    expect(task1.id).not.toBe(task2.id);
  });

  test("should generate creation_date when not provided", () => {
    const beforeCreation = generateTimestamp();
    const task = new Task("Test task");
    const afterCreation = generateTimestamp();

    expect(task.creation_date).toBeDefined();
    expect(task.creation_date).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );
  });

  test("should allow optional description", () => {
    const task1 = new Task("Task without description");
    const task2 = new Task("Task with description", Priority_Level.MEDIUM, "Description here");

    expect(task1.description).toBeUndefined();
    expect(task2.description).toBe("Description here");
  });

  test("should allow optional due_date", () => {
    const task1 = new Task("Task without due date");
    const task2 = new Task("Task with due date", Priority_Level.MEDIUM, undefined, Completion_Status.INCOMPLETE, "2024-12-31");

    expect(task1.due_date).toBeUndefined();
    expect(task2.due_date).toBe("2024-12-31");
  });

  test("should initially have no completion_time", () => {
    const task = new Task("New task");
    expect(task.completion_time).toBeUndefined();
  });

  test("should initially have no last_updated", () => {
    const task = new Task("New task");
    expect(task.last_updated).toBeUndefined();
  });
});

describe("Task.toObject()", () => {
  test("should convert task to plain object", () => {
    const task = new Task(
      "Buy groceries",
      Priority_Level.HIGH,
      "Description",
      Completion_Status.INCOMPLETE,
      "2024-12-25"
    );

    const obj = task.toObject();

    expect(obj).toEqual({
      id: task.id,
      title: "Buy groceries",
      description: "Description",
      priority: "High",
      status: "Incomplete",
      due_date: "2024-12-25",
      creation_date: task.creation_date,
      last_updated: undefined,
      completion_time: undefined,
    });
  });
});

describe("Task.fromObject()", () => {
  test("should create task from plain object", () => {
    const obj = {
      id: "test-id",
      title: "Test task",
      description: "Test description",
      priority: Priority_Level.HIGH,
      status: Completion_Status.INCOMPLETE,
      due_date: "2024-12-25",
      creation_date: "2024-01-01T10:00:00Z",
      last_updated: "2024-01-02T10:00:00Z",
      completion_time: undefined,
    };

    const task = Task.fromObject(obj);

    expect(task.id).toBe("test-id");
    expect(task.title).toBe("Test task");
    expect(task.description).toBe("Test description");
    expect(task.priority).toBe("High");
    expect(task.status).toBe("Incomplete");
    expect(task.due_date).toBe("2024-12-25");
    expect(task.creation_date).toBe("2024-01-01T10:00:00Z");
    expect(task.last_updated).toBe("2024-01-02T10:00:00Z");
  });

  test("should apply default priority when not provided in object", () => {
    const obj = {
      id: "test-id",
      title: "Test task",
      // priority not provided
    };

    const task = Task.fromObject(obj);
    expect(task.priority).toBe(Priority_Level.MEDIUM);
  });

  test("should apply default status when not provided in object", () => {
    const obj = {
      id: "test-id",
      title: "Test task",
      // status not provided
    };

    const task = Task.fromObject(obj);
    expect(task.status).toBe(Completion_Status.INCOMPLETE);
  });

  test("should round-trip through toObject and fromObject", () => {
    const originalTask = new Task(
      "Test task",
      Priority_Level.MEDIUM,
      "Test description",
      Completion_Status.INCOMPLETE,
      "2024-12-31"
    );

    const obj = originalTask.toObject();
    const restoredTask = Task.fromObject(obj);

    expect(restoredTask.id).toBe(originalTask.id);
    expect(restoredTask.title).toBe(originalTask.title);
    expect(restoredTask.description).toBe(originalTask.description);
    expect(restoredTask.priority).toBe(originalTask.priority);
    expect(restoredTask.status).toBe(originalTask.status);
    expect(restoredTask.due_date).toBe(originalTask.due_date);
    expect(restoredTask.creation_date).toBe(originalTask.creation_date);
  });
});
