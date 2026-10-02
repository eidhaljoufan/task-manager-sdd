---
inclusion: always
---

# Steering Guidelines: Todolist App

Guidelines for implementing the Todolist App project, a task management system with CRUD operations, filtering, search, and priority/due-date management.

## Architecture Overview

The system follows a three-layer architecture:

1. **Presentation Layer (UI)**: User interface with task list display, forms, dialogs, and feedback
2. **Business Logic Layer (Task_Manager)**: CRUD orchestration, validation, state transitions, timestamps
3. **Data Persistence Layer (Task_Storage)**: Persistent storage with filtering and pagination support

## Core Components

### Task_Manager Responsibilities

- **Input validation** before any storage operations
- **CRUD orchestration** with error handling
- **Automatic timestamps**: creation_date (auto-generated), last_updated, completion_time
- **State transitions**: status changes with confirmation dialogs
- **User confirmation** for updates and deletions before persisting
- **Error messages** in Indonesian (e.g., "Judul wajib diisi", "Gagal menyimpan tugas")

### Task_Storage Responsibilities

- **Persist** tasks within 5 seconds for write operations
- **Retrieve** with efficient filtering (≤ 500ms) and search (≤ 300ms)
- **Pagination**: 50 items per page by default, 100 for search results
- **Consistent sorting**: creation_date DESC (newest first) as default
- **Data integrity**: preserve all fields during updates

### UI Layer Responsibilities

- **Display** task list with: title, description, priority, status, due_date
- **Empty state**: Show "Tidak ada tugas ditemukan" when no tasks exist
- **Visual indicators**: Strikethrough/checkmark for completed tasks, red color/warning icon for overdue
- **Confirmation dialogs** before delete/update operations
- **Pagination controls** for navigation between pages

## Data Models & Constraints

### Task Entity

```typescript
interface Task {
  id: string;                    // UUID or unique identifier
  title: string;                 // Required: 1-255 chars, non-empty/non-whitespace
  description?: string;          // Optional: max 2000 chars (create), 1000 (update)
  priority: "High" | "Medium" | "Low";  // Default: "Medium"
  status: "Incomplete" | "Completed";
  due_date?: string;             // ISO 8601 format (YYYY-MM-DD), optional
  creation_date: string;         // ISO 8601 timestamp (auto-generated)
  last_updated?: string;         // ISO 8601 timestamp with second precision
  completion_time?: string;      // ISO 8601 timestamp (set when marked complete)
}
```

### Validation Rules

**Title**: Required, 1-255 characters, non-empty/non-whitespace strings
- Error: "Judul wajib diisi"
- Error: "Batas panjang judul telah terlampaui (max 255 karakter)"

**Description (Create)**: Optional, max 2000 characters
- Error: "Batas panjang deskripsi telah terlampaui (max 2000 karakter)"

**Description (Update)**: Optional, max 1000 characters
- Error: "Batas panjang deskripsi telah terlampaui (max 1000 karakter)"

**Priority**: Valid values {High, Medium, Low}, defaults to "Medium"
- Error: "Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low"

**Due Date**: ISO 8601 format (YYYY-MM-DD), optional
- Error: "Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)"

**Task ID**: Must be valid for all operations
- Error: "Tugas tidak ditemukan" / "ID tugas tidak valid"

## Feature Requirements Summary

### Create Task (REQ-1)
- Accept title, description, priority; set status="Incomplete", auto-generate creation_date
- Validate all inputs; persist within 5 seconds

### View All Tasks (REQ-2)
- Paginate 50 items/page; sort by creation_date DESC
- Support status and priority filtering (≤ 500ms response)
- Show empty state "Tidak ada tugas ditemukan"

### Update Task (REQ-3)
- Validate constraints; request user confirmation
- Record last_updated timestamp; preserve other fields

### Mark Complete (REQ-4)
- Change status to "Completed"; record completion_time timestamp
- Show visual indicators (strikethrough, checkmark, or disabled appearance)

### Delete Task (REQ-5)
- Show confirmation dialog; only delete after user confirms
- Preserve task if user cancels or storage fails

### Search Task (REQ-6)
- Case-insensitive partial matching on title and description
- Max 100 results, sorted by relevance, respond within ≤ 300ms
- Empty/whitespace keyword returns all tasks

### Priority Level (REQ-7)
- Support High/Medium/Low with Medium as default
- Filter/sort by priority (High → Medium → Low)

### Due Date (REQ-8)
- Store in ISO 8601 format; optional (null if not set)
- Show overdue indicator (red, warning icon, bold) for incomplete tasks past due date
- Never show overdue for completed tasks

## Error Handling

All error messages should be:
- Clear and specific about the validation failure
- Presented in Indonesian when user-facing
- Logged with context for debugging

Storage errors should retry gracefully or inform user:
- "Penyimpanan tidak responsif. Silakan coba lagi"
- "Penyimpanan tugas tidak tersedia. Silakan coba lagi nanti"
- "Gagal memuat tugas. Silakan refresh halaman"

## Performance Targets

- Task creation: < 500ms
- Single task retrieval: < 100ms
- List tasks (50 items): < 200ms
- Filtering: ≤ 500ms
- Search: ≤ 300ms
- Persistence: ≤ 5 seconds
- Pagination navigation: < 1 second

## Testing Approach

- **Property-based testing** for validation logic, filtering, searching, state transitions
- **Unit tests** for business logic correctness
- **Integration tests** for end-to-end workflows (create → read → update → complete → delete)
- **Performance tests** to verify response time targets
- Verify pagination completeness and consistency across all pages

## Code Organization

- Keep Task_Manager validation logic separate from storage calls
- Use consistent timestamp formatting (ISO 8601) throughout
- Implement confirmation dialogs as reusable components
- Keep UI rendering logic distinct from business logic
- Document timestamp auto-generation behavior clearly