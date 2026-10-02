# Design Document: Todolist App

## Overview

The Todolist App is a task management system that enables users to create, organize, and manage their tasks efficiently. The application provides core CRUD operations (Create, Read, Update, Delete), task filtering, searching, and priority/due-date management. The system is designed for responsiveness, data persistence, and a clear user experience with visual indicators for task status and urgency.

### Key Features
- Task creation with title, description, and priority levels
- Task viewing with pagination and filtering (by status, priority)
- Task updates with validation and confirmation
- Task completion tracking with timestamps
- Task deletion with confirmation dialogs
- Task searching by keyword
- Priority level management (High/Medium/Low with defaults)
- Due date management with overdue visual indicators

---

## Architecture

### System Components

The system is composed of three primary layers:

1. **Presentation Layer (UI)**: Handles user interactions, displays task lists, and provides filtering/search interfaces
2. **Business Logic Layer (Task_Manager)**: Orchestrates CRUD operations, validates inputs, and manages task state transitions
3. **Data Persistence Layer (Task_Storage)**: Manages persistent storage and data retrieval

### Component Interaction Flow

```
User Input (UI)
    ↓
Task_Manager (Validation & Orchestration)
    ↓
Task_Storage (Persistence)
    ↓
Return Data → UI (Display)
```

### Key Design Decisions

1. **Separation of Concerns**: Task_Manager handles validation and orchestration; Task_Storage handles persistence. This allows independent evolution of storage implementations (database, filesystem, cloud storage).

2. **Validation at Entry**: All validation occurs in Task_Manager before Task_Storage operations to ensure data integrity.

3. **Timestamp Management**: Automatic timestamp recording for `creation_date`, `last_updated`, and `completion_time` ensures audit trail and consistency.

4. **Pagination**: Task lists are paginated at 50 items per page to manage performance and UI complexity.

5. **Filtering Strategy**: Filtering (status, priority) is applied at the storage layer for efficient queries; search is performed with case-insensitive partial matching.

6. **Overdue Calculation**: Overdue status is evaluated at page load/refresh time rather than continuously, reducing computational overhead.

---

## Components and Interfaces

### Task_Manager

**Responsibilities:**
- Validate input constraints (field lengths, formats, enum values)
- Orchestrate CRUD operations
- Manage task state transitions
- Record timestamps automatically
- Provide error messages and user feedback

**Primary Operations:**

```
createTask(title, description, priority) → Task | Error
  - Validates: title (1-255 chars, non-empty/non-whitespace)
  - Validates: description (optional, max 2000 chars)
  - Validates: priority (High | Medium | Low), defaults to Medium
  - Returns: Created task with auto-generated creation_date and status="Incomplete"
  - Error cases: Missing/invalid title, length overflow, invalid priority

updateTask(taskId, fields, confirmCallback) → Task | Error
  - Validates: title (1-255 chars, non-empty/non-whitespace)
  - Validates: description (optional, max 1000 chars)
  - Validates: due_date (ISO 8601 format)
  - Validates: priority (High | Medium | Low)
  - Requests user confirmation before persisting
  - Records last_updated timestamp
  - Error cases: Invalid taskId, validation failures, storage errors

markTaskComplete(taskId) → Task | Error
  - Changes status to "Completed"
  - Records completion_time timestamp
  - Error cases: Invalid taskId, storage errors

deleteTask(taskId, confirmCallback) → Success | Error
  - Requires user confirmation
  - Removes task from storage
  - Error cases: Invalid taskId, storage unavailable, user cancels

searchTasks(keyword, pageNumber) → Tasks[] | Error
  - Performs case-insensitive partial matching on title and description
  - Limits to 100 results
  - Returns sorted by relevance
  - Error cases: Empty/whitespace keyword (returns all tasks)

filterTasks(status?, priority?, pageNumber?) → Tasks[] | Error
  - Filters by Completion_Status (Completed | Incomplete)
  - Filters by Priority_Level (High | Medium | Low)
  - Returns paginated results (50 per page)
  - Error cases: Invalid filter values
```

### Task_Storage

**Responsibilities:**
- Persist tasks to durable storage (< 5 seconds for write operations)
- Retrieve tasks with filtering and pagination
- Ensure consistency and data integrity

**Primary Operations:**

```
save(task) → Success | Error
  - Persists task to storage within 5 seconds
  - Error cases: Storage unavailable, write failure

retrieve(taskId) → Task | Error
  - Retrieves single task by ID
  - Error cases: Task not found, storage errors

listTasks(pageNumber, pageSize=50) → Tasks[] | Error
  - Retrieves paginated list of all tasks
  - Default sort: creation_date DESC (newest first)

listWithFilter(filters, pageNumber, pageSize=50) → Tasks[] | Error
  - Retrieves tasks filtered by status and/or priority
  - Respons time: ≤ 500ms
  - Pagination: 50 items per page

search(keyword, pageNumber, pageSize=100) → Tasks[] | Error
  - Full-text search on title and description
  - Case-insensitive partial matching
  - Response time: ≤ 300ms
  - Max results: 100

delete(taskId) → Success | Error
  - Removes task from storage
  - Error cases: Task not found, storage errors
```

### UI Layer

**Responsibilities:**
- Display task list with formatting
- Handle user interactions (create, update, delete, search, filter)
- Show confirmation dialogs
- Display error and success messages
- Manage pagination navigation

**Key UI Patterns:**
- Task list displays: title, description, priority, status, due_date for each task
- Empty state message: "Tidak ada tugas ditemukan"
- Confirmation dialogs before delete/update operations
- Visual indicators for completed tasks (strikethrough, checkmark, or disabled appearance)
- Overdue indication: red color, warning icon, or bold text for incomplete tasks past due date
- Default sorting: by creation_date (newest first)
- Filter controls for status and priority
- Search input field (1-255 characters)

---

## Data Models

### Task Entity

```typescript
interface Task {
  id: string;                    // Unique identifier (UUID or similar)
  title: string;                 // Required, 1-255 characters
  description?: string;          // Optional, max 2000 characters
  priority: Priority_Level;      // Default: "Medium"
  status: Completion_Status;     // "Incomplete" or "Completed"
  due_date?: string;             // ISO 8601 format (YYYY-MM-DD), optional
  creation_date: string;         // ISO 8601 timestamp (auto-generated)
  last_updated?: string;         // ISO 8601 timestamp with second precision
  completion_time?: string;      // ISO 8601 timestamp, recorded when marked complete
}

type Priority_Level = "High" | "Medium" | "Low";
type Completion_Status = "Incomplete" | "Completed";
```

### Storage Format

Tasks are stored with the following structure per record:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project proposal",
  "description": "Finalize and submit Q1 project proposal",
  "priority": "High",
  "status": "Incomplete",
  "due_date": "2024-02-15",
  "creation_date": "2024-01-20T10:30:00Z",
  "last_updated": "2024-01-21T14:45:30Z",
  "completion_time": null
}
```

### Pagination Model

```typescript
interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
```

### Filter Model

```typescript
interface TaskFilter {
  status?: "Incomplete" | "Completed";
  priority?: "High" | "Medium" | "Low";
  pageNumber?: number;
  pageSize?: number;
}

interface SearchQuery {
  keyword: string;
  pageNumber?: number;
  pageSize?: number;
}
```

---

## Error Handling

### Validation Errors

**Title Validation:**
- Empty, null, or whitespace-only: "Judul wajib diisi"
- Exceeds 255 characters: "Batas panjang judul telah terlampaui (max 255 karakter)"

**Description Validation (Create):**
- Exceeds 2000 characters: "Batas panjang deskripsi telah terlampaui (max 2000 karakter)"

**Description Validation (Update):**
- Exceeds 1000 characters: "Batas panjang deskripsi telah terlampaui (max 1000 karakter)"

**Priority Validation:**
- Invalid value (not High/Medium/Low): "Pilihan prioritas tidak valid. Pilih dari: High, Medium, Low"

**Due Date Validation:**
- Invalid ISO 8601 format: "Format tanggal tidak valid. Gunakan format ISO 8601 (YYYY-MM-DD)"

**Task ID Errors:**
- Task not found: "Tugas tidak ditemukan"
- Invalid task ID format: "ID tugas tidak valid"

### Storage Errors

**Write Operations:**
- Timeout (> 5 seconds): "Penyimpanan tidak responsif. Silakan coba lagi"
- Storage unavailable: "Penyimpanan tugas tidak tersedia. Silakan coba lagi nanti"
- Write failure: "Gagal menyimpan tugas. Silakan coba lagi"

**Delete Operations:**
- Storage unavailable: "Penyimpanan tugas tidak tersedia. Penghapusan dibatalkan"
- Deletion failed: "Gagal menghapus tugas. Silakan coba lagi"

**Retrieval Errors:**
- Storage unavailable: "Gagal memuat tugas. Silakan refresh halaman"
- Query timeout: "Pencarian memakan waktu terlalu lama. Silakan coba lagi"

### User Action Errors

**Mark Complete:**
- Invalid task: "Tugas tidak ditemukan atau tidak valid untuk diselesaikan"

**Delete Task:**
- User cancellation: No error; task remains unchanged
- Storage failure after confirmation: "Penghapusan gagal. Tugas masih tersimpan"

---

## Testing Strategy

### Property-Based Testing Applicability

This feature involves pure data transformation logic (validation, filtering, searching, state transitions) and business rules that should hold universally across all valid inputs. Property-based testing is **highly appropriate** for:

- **Input validation**: Testing that invalid inputs are consistently rejected
- **Data transformations**: Testing round-trip serialization/deserialization
- **Search and filtering**: Testing that search results always match criteria
- **State transitions**: Testing that task status changes preserve data integrity
- **Pagination**: Testing that pagination calculations are consistent

### Correctness Properties (Property-Based Testing)

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

#### Property 1: Valid Task Creation Preserves Input and Adds Metadata

*For any* valid task input (non-empty title 1-255 chars, optional description ≤ 2000 chars, valid priority from {High, Medium, Low}), creating the task should store all provided data with auto-generated creation_date timestamp and status="Incomplete".

**Validates: Requirements 1.1, 1.2**

#### Property 2: Empty/Whitespace Titles Are Always Rejected

*For any* string composed entirely of whitespace or empty value, attempting to create or update a task with that title should be rejected with appropriate error message, and no task should be persisted or modified.

**Validates: Requirements 1.4, 3.3**

#### Property 3: Text Length Constraints Are Enforced Consistently

*For any* text exceeding the specified character limits (title > 255 chars, description > 2000 chars on create or > 1000 chars on update), the operation should be rejected with a specific error message indicating the field and limit, and the task should remain unchanged.

**Validates: Requirements 1.5, 3.4**

#### Property 4: Task Completion State Transition Preserves Data

*For any* incomplete task, marking it as complete should set status to "Completed", record a completion_time timestamp in ISO 8601 format, and preserve all other task data unchanged.

**Validates: Requirements 4.1, 4.2**

#### Property 5: Filter Criteria Are Always Applied Correctly

*For any* filter applied (status="Completed"|"Incomplete" or priority="High"|"Medium"|"Low"), all returned tasks should satisfy the exact filter condition; no tasks should be returned that don't match.

**Validates: Requirements 2.3, 2.4, 7.4**

#### Property 6: Search Results Contain Keyword

*For any* search keyword (1-255 characters), all returned results should contain that keyword in either title or description with case-insensitive matching. Results should be limited to max 100 items.

**Validates: Requirements 6.1, 6.2**

#### Property 7: Empty/Whitespace Search Returns All Tasks Unfiltered

*For any* search with empty or whitespace-only keyword, the operation should return all available tasks without filtering.

**Validates: Requirements 6.5**

#### Property 8: Priority Default Applied When Unspecified

*For any* task created without an explicit priority parameter, the task should have priority set to "Medium".

**Validates: Requirements 7.2**

#### Property 9: Invalid Priority Values Rejected

*For any* priority value outside the set {High, Medium, Low}, the operation should be rejected with error message indicating valid priority choices.

**Validates: Requirements 7.5**

#### Property 10: Valid Due Dates Stored in Consistent ISO 8601 Format

*For any* valid due date in ISO 8601 format (YYYY-MM-DD), the date should be accepted and persisted in the same format. For any date string not matching ISO 8601 format, the operation should be rejected with format error.

**Validates: Requirements 8.1, 8.3, 8.4**

#### Property 11: Null Due Dates Accepted and Persisted

*For any* task created without a due_date parameter, the due_date should be stored as null without error.

**Validates: Requirements 8.2**

#### Property 12: Pagination Retrieves Complete Task Set Without Duplication

*For any* task list, retrieving all pages sequentially with page size 50 should return the complete set of tasks without duplication or loss, with correct total page count and boundary conditions on final page.

**Validates: Requirements 2.1, 2.7**

#### Property 13: Overdue Status Depends on Due Date and Completion

*For any* incomplete task with a due date in the past, the rendered output should include overdue indicators (red color, warning icon, or bold text). For any completed task regardless of due date, no overdue indicator should appear. For any incomplete task with future/current due date, no overdue indicator should appear.

**Validates: Requirements 8.5, 8.6, 8.7**

#### Property 14: Task Deletion After Confirmation Removes Task Completely

*For any* task, after user confirms deletion, the task should be removed from storage and no longer retrievable. Before confirmation, the task should remain unchanged.

**Validates: Requirements 5.2, 5.3**

#### Property 15: Invalid Task IDs Result in Errors Without State Changes

*For any* invalid or non-existent task ID, attempting any operation (mark complete, update, delete) should result in error message and no state changes to any tasks.

**Validates: Requirements 4.4**

---

### Unit Tests (Example-Based)

In addition to property-based tests, the following example-based unit tests cover specific scenarios and error conditions:

1. **Create Task Success**: Create a task with all fields and verify it's stored correctly
2. **Create Task Minimal**: Create a task with only title (description optional) and verify defaults applied
3. **Update Task Confirmation**: Verify user confirmation is requested before update
4. **Update Task Cancelled**: Verify cancelled update leaves task unchanged
5. **Delete Task Confirmation**: Verify confirmation dialog appears and user can cancel
6. **Delete Task Success**: Delete confirmed task and verify it's removed from storage
7. **View All Tasks Empty**: Verify empty state message when no tasks exist
8. **Search No Results**: Verify "Tidak ada tugas ditemukan" when search returns nothing
9. **Filter by Status**: Verify only tasks matching status filter are returned
10. **Filter by Priority**: Verify only tasks matching priority filter are returned
11. **Pagination Navigation**: Verify navigation between pages returns correct data
12. **Task List Default Sorting**: Verify tasks are sorted by creation_date DESC (newest first)
13. **Overdue Visual Indicator**: Verify overdue tasks show red color/warning icon
14. **Completed Task No Overdue**: Verify completed tasks never show overdue indicator

### Integration Tests

1. **End-to-End Task Workflow**: Create → Read → Update → Mark Complete → Delete
2. **Search + Filter Combination**: Search with filters applied simultaneously
3. **Pagination + Filtering**: Verify pagination works correctly with filters applied
4. **Storage Persistence**: Verify tasks persist across application restarts
5. **Response Time Compliance**: Verify filtering responds in ≤ 500ms, search in ≤ 300ms, save in ≤ 5 seconds

### Performance Benchmarks

- Task creation: < 500ms
- Task retrieval (single): < 100ms
- List all tasks (50 items): < 200ms
- Filter tasks: ≤ 500ms
- Search tasks: ≤ 300ms
- Pagination navigation: < 1 second
- Task persistence: < 5 seconds

---

## Summary

The Todolist App design emphasizes clear separation between business logic (Task_Manager), persistence (Task_Storage), and UI presentation. Input validation is performed at the business layer before any storage operations. Automatic timestamp management ensures audit capability. The system is designed for responsiveness with explicit performance requirements for each operation. Property-based testing validates universal correctness properties across input variations, while unit and integration tests cover specific scenarios and end-to-end workflows.

