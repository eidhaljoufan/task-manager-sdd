/**
 * Unit tests for Task validation functions
 */

const {
  validateTitle,
  validateDescription,
  validatePriority,
  validateDueDate,
  validateTaskId,
} = require("./task-validation");

describe("validateTitle()", () => {
  test("should accept valid title", () => {
    const result = validateTitle("Buy groceries");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test("should reject empty string", () => {
    const result = validateTitle("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Judul wajib diisi");
  });

  test("should reject null", () => {
    const result = validateTitle(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Judul wajib diisi");
  });

  test("should reject undefined", () => {
    const result = validateTitle(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Judul wajib diisi");
  });

  test("should reject whitespace-only string", () => {
    const result = validateTitle("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Judul wajib diisi");
  });

  test("should reject title longer than 255 characters", () => {
    const longTitle = "a".repeat(256);
    const result = validateTitle(longTitle);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Batas panjang judul telah terlampaui (max 255 karakter)"
    );
  });

  test("should accept title with exactly 255 characters", () => {
    const maxTitle = "a".repeat(255);
    const result = validateTitle(maxTitle);
    expect(result.valid).toBe(true);
  });

  test("should accept title with 1 character", () => {
    const result = validateTitle("A");
    expect(result.valid).toBe(true);
  });

  test("should reject non-string title", () => {
    const result = validateTitle(123);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Judul wajib diisi");
  });

  test("should reject title with only leading/trailing whitespace", () => {
    const result = validateTitle("   ");
    expect(result.valid).toBe(false);
  });
});

describe("validateDescription()", () => {
  describe("Create mode", () => {
    test("should accept undefined description", () => {
      const result = validateDescription(undefined, "create");
      expect(result.valid).toBe(true);
    });

    test("should accept null description", () => {
      const result = validateDescription(null, "create");
      expect(result.valid).toBe(true);
    });

    test("should accept valid description", () => {
      const result = validateDescription("This is a description", "create");
      expect(result.valid).toBe(true);
    });

    test("should accept empty string description", () => {
      const result = validateDescription("", "create");
      expect(result.valid).toBe(true);
    });

    test("should accept description with 2000 characters", () => {
      const desc = "a".repeat(2000);
      const result = validateDescription(desc, "create");
      expect(result.valid).toBe(true);
    });

    test("should reject description with 2001 characters", () => {
      const desc = "a".repeat(2001);
      const result = validateDescription(desc, "create");
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "Batas panjang deskripsi telah terlampaui (max 2000 karakter)"
      );
    });

    test("should reject non-string description", () => {
      const result = validateDescription(123, "create");
      expect(result.valid).toBe(false);
    });
  });

  describe("Update mode", () => {
    test("should accept undefined description", () => {
      const result = validateDescription(undefined, "update");
      expect(result.valid).toBe(true);
    });

    test("should accept valid description", () => {
      const result = validateDescription("Updated description", "update");
      expect(result.valid).toBe(true);
    });

    test("should accept description with 1000 characters", () => {
      const desc = "a".repeat(1000);
      const result = validateDescription(desc, "update");
      expect(result.valid).toBe(true);
    });

    test("should reject description with 1001 characters", () => {
      const desc = "a".repeat(1001);
      const result = validateDescription(desc, "update");
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "Batas panjang deskripsi telah terlampaui (max 1000 karakter)"
      );
    });

    test("should allow 2000 character description in update mode", () => {
      const desc = "a".repeat(2000);
      const result = validateDescription(desc, "update");
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        "Batas panjang deskripsi telah terlampaui (max 1000 karakter)"
      );
    });
  });

  test("should default to create mode when mode not specified", () => {
    const desc = "a".repeat(2000);
    const result = validateDescription(desc);
    expect(result.valid).toBe(true);
  });
});

describe("validatePriority()", () => {
  test("should accept High priority", () => {
    const result = validatePriority("High");
    expect(result.valid).toBe(true);
  });

  test("should accept Medium priority", () => {
    const result = validatePriority("Medium");
    expect(result.valid).toBe(true);
  });

  test("should accept Low priority", () => {
    const result = validatePriority("Low");
    expect(result.valid).toBe(true);
  });

  test("should accept undefined priority", () => {
    const result = validatePriority(undefined);
    expect(result.valid).toBe(true);
  });

  test("should accept null priority", () => {
    const result = validatePriority(null);
    expect(result.valid).toBe(true);
  });

  test("should reject invalid priority", () => {
    const result = validatePriority("Critical");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low"
    );
  });

  test("should reject lowercase priority", () => {
    const result = validatePriority("high");
    expect(result.valid).toBe(false);
  });

  test("should reject non-string priority", () => {
    const result = validatePriority(1);
    expect(result.valid).toBe(false);
  });

  test("should reject empty string priority", () => {
    const result = validatePriority("");
    expect(result.valid).toBe(false);
  });
});

describe("validateDueDate()", () => {
  test("should accept undefined due date", () => {
    const result = validateDueDate(undefined);
    expect(result.valid).toBe(true);
  });

  test("should accept null due date", () => {
    const result = validateDueDate(null);
    expect(result.valid).toBe(true);
  });

  test("should accept valid ISO 8601 date", () => {
    const result = validateDueDate("2024-12-25");
    expect(result.valid).toBe(true);
  });

  test("should accept leap year date", () => {
    const result = validateDueDate("2024-02-29");
    expect(result.valid).toBe(true);
  });

  test("should accept date with single digit month and day", () => {
    const result = validateDueDate("2024-01-01");
    expect(result.valid).toBe(true);
  });

  test("should reject invalid month", () => {
    const result = validateDueDate("2024-13-01");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)"
    );
  });

  test("should reject invalid day", () => {
    const result = validateDueDate("2024-02-30");
    expect(result.valid).toBe(false);
  });

  test("should reject date with wrong format", () => {
    const result = validateDueDate("25-12-2024");
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)"
    );
  });

  test("should reject date with time component", () => {
    const result = validateDueDate("2024-12-25T10:00:00Z");
    expect(result.valid).toBe(false);
  });

  test("should reject date with slash separators", () => {
    const result = validateDueDate("2024/12/25");
    expect(result.valid).toBe(false);
  });

  test("should reject non-string date", () => {
    const result = validateDueDate(20241225);
    expect(result.valid).toBe(false);
  });

  test("should reject empty string date", () => {
    const result = validateDueDate("");
    expect(result.valid).toBe(false);
  });

  test("should accept December 31st", () => {
    const result = validateDueDate("2024-12-31");
    expect(result.valid).toBe(true);
  });

  test("should accept January 1st", () => {
    const result = validateDueDate("2025-01-01");
    expect(result.valid).toBe(true);
  });

  test("should reject non-leap year February 29", () => {
    const result = validateDueDate("2023-02-29");
    expect(result.valid).toBe(false);
  });
});

describe("validateTaskId()", () => {
  test("should accept valid task ID", () => {
    const result = validateTaskId("task-123");
    expect(result.valid).toBe(true);
  });

  test("should accept UUID format", () => {
    const result = validateTaskId("550e8400-e29b-41d4-a716-446655440000");
    expect(result.valid).toBe(true);
  });

  test("should reject empty string", () => {
    const result = validateTaskId("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("ID tugas tidak valid");
  });

  test("should reject null", () => {
    const result = validateTaskId(null);
    expect(result.valid).toBe(false);
  });

  test("should reject undefined", () => {
    const result = validateTaskId(undefined);
    expect(result.valid).toBe(false);
  });

  test("should reject whitespace-only string", () => {
    const result = validateTaskId("   ");
    expect(result.valid).toBe(false);
  });

  test("should reject non-string ID", () => {
    const result = validateTaskId(123);
    expect(result.valid).toBe(false);
  });
});
