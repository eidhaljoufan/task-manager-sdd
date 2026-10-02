# Implementation Plan: Todolist App

## Overview

Implementasi aplikasi manajemen tugas lengkap dengan fitur CRUD, filtering, searching, dan manajemen prioritas/due date. Implementasi menggunakan JavaScript dengan separation of concerns antara UI layer, business logic (Task_Manager), dan persistence layer (Task_Storage).

---

## Tasks

- [x] 1. Set up project structure and initialize storage system
  - Initialize project dengan file structure dasar
  - Create `task-manager.js` untuk business logic layer
  - Create `task-storage.js` untuk persistence layer
  - Create `ui.js` untuk presentation layer
  - Setup testing framework (Node.js dengan Jest atau Mocha)
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 2. Implement Task data model dan validation layer
  - [x] 2.1 Define Task data model dan constants
    - Create Task interface/class dengan properties: id, title, description, priority, status, due_date, creation_date, last_updated, completion_time
    - Define Priority_Level enum (High, Medium, Low)
    - Define Completion_Status enum (Incomplete, Completed)
    - Create helper functions untuk generate ID dan timestamps
    - _Requirements: 1.1, 3.1, 4.1, 7.1, 8.1_

  - [ ]* 2.2 Write property tests untuk Task data model
    - **Property 8: Priority Default Applied When Unspecified**
    - **Validates: Requirements 7.2**

  - [x] 2.3 Implement validation functions
    - Create `validateTitle()` - check non-empty, non-whitespace, max 255 chars
    - Create `validateDescription()` - check max length (2000 for create, 1000 for update)
    - Create `validatePriority()` - check enum values
    - Create `validateDueDate()` - check ISO 8601 format
    - Return error messages in Indonesian
    - _Requirements: 1.4, 1.5, 3.3, 3.4, 7.5, 8.3_

  - [ ]* 2.4 Write property tests untuk validation layer
    - **Property 2: Empty/Whitespace Titles Are Always Rejected**
    - **Validates: Requirements 1.4, 3.3**
    - **Property 3: Text Length Constraints Are Enforced Consistently**
    - **Validates: Requirements 1.5, 3.4**
    - **Property 9: Invalid Priority Values Rejected**
    - **Validates: Requirements 7.5**
    - **Property 10: Valid Due Dates Stored in Consistent ISO 8601 Format**
    - **Validates: Requirements 8.1, 8.3, 8.4**

- [x] 3. Implement Task_Storage persistence layer
  - [x] 3.1 Create in-memory storage implementation
    - Create storage object untuk menyimpan tasks
    - Implement `save(task)` - save task ke storage dalam < 5 detik
    - Implement `retrieve(taskId)` - retrieve single task by ID
    - Implement `delete(taskId)` - delete task from storage
    - _Requirements: 1.3, 3.1, 5.2_

  - [ ]* 3.2 Write property tests untuk storage save operation
    - **Property 1: Valid Task Creation Preserves Input and Adds Metadata**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 3.3 Implement storage retrieval operations
    - Implement `listTasks(pageNumber, pageSize=50)` - retrieve paginated list dengan default sort by creation_date DESC
    - Implement `listWithFilter(filters, pageNumber, pageSize=50)` - filter by status dan/atau priority dengan response time ≤ 500ms
    - Implement `search(keyword, pageNumber, pageSize=100)` - full-text search dengan case-insensitive partial matching, max 100 results, response time ≤ 300ms
    - _Requirements: 2.1, 2.3, 2.4, 2.6, 6.1, 6.2_

  - [ ]* 3.4 Write property tests untuk retrieval operations
    - **Property 5: Filter Criteria Are Always Applied Correctly**
    - **Validates: Requirements 2.3, 2.4, 7.4**
    - **Property 6: Search Results Contain Keyword**
    - **Validates: Requirements 6.1, 6.2**
    - **Property 12: Pagination Retrieves Complete Task Set Without Duplication**
    - **Validates: Requirements 2.1, 2.7**

- [x] 4. Implement Task_Manager business logic layer
  - [~] 4.1 Implement createTask operation
    - Implement `createTask(title, description, priority)` dengan validation
    - Set default priority ke "Medium" jika tidak diberikan
    - Auto-generate creation_date dengan sistem timestamp
    - Set initial status ke "Incomplete"
    - Call Task_Storage.save() dan return task atau error
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2_

  - [ ]* 4.2 Write property test untuk createTask
    - **Property 1: Valid Task Creation Preserves Input and Adds Metadata**
    - **Validates: Requirements 1.1, 1.2**

  - [ ] 4.3 Implement updateTask operation
    - Implement `updateTask(taskId, fields, confirmCallback)` dengan validation
    - Request user confirmation sebelum persist
    - Update hanya fields yang provided
    - Record last_updated timestamp
    - Validate all fields: title, description, due_date, priority
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.4 Write property tests untuk updateTask
    - **Property 2: Empty/Whitespace Titles Are Always Rejected**
    - **Validates: Requirements 1.4, 3.3**
    - **Property 3: Text Length Constraints Are Enforced Consistently**
    - **Validates: Requirements 1.5, 3.4**

  - [ ] 4.5 Implement markTaskComplete operation
    - Implement `markTaskComplete(taskId)` untuk change status ke "Completed"
    - Record completion_time timestamp dalam ISO 8601 format
    - Handle error untuk invalid task ID
    - _Requirements: 4.1, 4.2, 4.4_

  - [ ]* 4.6 Write property test untuk markTaskComplete
    - **Property 4: Task Completion State Transition Preserves Data**
    - **Validates: Requirements 4.1, 4.2**
    - **Property 15: Invalid Task IDs Result in Errors Without State Changes**
    - **Validates: Requirements 4.4**

  - [ ] 4.7 Implement deleteTask operation
    - Implement `deleteTask(taskId, confirmCallback)` dengan confirmation dialog
    - Call Task_Storage.delete() after user confirms
    - Handle user cancellation tanpa perubahan task
    - Handle storage errors
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 4.8 Write property test untuk deleteTask
    - **Property 14: Task Deletion After Confirmation Removes Task Completely**
    - **Validates: Requirements 5.2, 5.3**

  - [ ] 4.9 Implement searchTasks operation
    - Implement `searchTasks(keyword, pageNumber=1)` dengan case-insensitive partial matching
    - Search di title dan description
    - Limit ke 100 results
    - Return hasil sorted by relevance
    - Handle empty/whitespace keyword - return all tasks
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 4.10 Write property tests untuk searchTasks
    - **Property 6: Search Results Contain Keyword**
    - **Validates: Requirements 6.1, 6.2**
    - **Property 7: Empty/Whitespace Search Returns All Tasks Unfiltered**
    - **Validates: Requirements 6.5**

  - [ ] 4.11 Implement filterTasks operation
    - Implement `filterTasks(status, priority, pageNumber=1)` dengan kombinasi filter
    - Support filter by status (Completed/Incomplete)
    - Support filter by priority (High/Medium/Low)
    - Return paginated results (50 per page)
    - Response time ≤ 500ms
    - _Requirements: 2.3, 2.4, 7.4_

  - [ ]* 4.12 Write property tests untuk filterTasks
    - **Property 5: Filter Criteria Are Always Applied Correctly**
    - **Validates: Requirements 2.3, 2.4, 7.4**

- [ ] 5. Checkpoint - Ensure all tests pass
  - Jalankan semua tests (unit tests dan property tests)
  - Verifikasi semua business logic operations berfungsi dengan benar
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement UI layer dan user interactions
  - [ ] 6.1 Create task display components
    - Implement function untuk display task list dengan title, description, priority, status, due_date
    - Display empty state message "Tidak ada tugas ditemukan" ketika list kosong
    - Display default sort by creation_date DESC (newest first)
    - Add visual indicators untuk completed tasks (strikethrough, checkmark, atau disabled appearance)
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 4.3_

  - [ ]* 6.2 Write unit tests untuk task display
    - Test rendering dengan berbagai task states
    - Test empty state display
    - Test visual indicators untuk completed tasks
    - _Requirements: 2.2, 4.3_

  - [ ] 6.3 Implement pagination UI controls
    - Create pagination controls untuk navigate antara pages
    - Display current page, total pages, dan navigation buttons
    - Load next/previous page sets dalam < 1 detik
    - _Requirements: 2.1, 2.7_

  - [ ]* 6.4 Write unit tests untuk pagination UI
    - Test pagination navigation
    - Test page data accuracy
    - _Requirements: 2.1, 2.7_

  - [ ] 6.5 Implement filtering UI controls
    - Create filter controls untuk status (Completed/Incomplete)
    - Create filter controls untuk priority (High/Medium/Low)
    - Apply filters melalui Task_Manager.filterTasks()
    - Response time ≤ 500ms
    - _Requirements: 2.3, 2.4, 7.4_

  - [ ]* 6.6 Write unit tests untuk filter UI
    - Test filter application dan results
    - _Requirements: 2.3, 2.4_

  - [ ] 6.7 Implement search UI controls
    - Create search input field (1-255 karakter)
    - Call Task_Manager.searchTasks() dengan keyword
    - Display search results dengan relevance sorting
    - Handle empty search (return all tasks)
    - Response time ≤ 300ms
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [ ]* 6.8 Write unit tests untuk search UI
    - Test search functionality
    - Test empty search behavior
    - _Requirements: 6.1, 6.5_

  - [ ] 6.9 Implement task creation UI
    - Create form untuk input title (required), description (optional), priority
    - Call Task_Manager.createTask() dengan input values
    - Display validation errors dari Task_Manager
    - Clear form setelah successful creation
    - _Requirements: 1.1, 1.4, 1.5, 7.1, 7.2_

  - [ ]* 6.10 Write unit tests untuk task creation UI
    - Test form validation dan error display
    - _Requirements: 1.4, 1.5_

  - [ ] 6.11 Implement task update UI
    - Create form untuk update task details
    - Display confirmation dialog sebelum save
    - Call Task_Manager.updateTask() dengan updated fields
    - Display validation errors
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 6.12 Write unit tests untuk task update UI
    - Test update form dan confirmation
    - Test validation errors
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ] 6.13 Implement task completion UI
    - Add button/checkbox untuk mark task sebagai complete
    - Call Task_Manager.markTaskComplete()
    - Update UI untuk show completed state
    - _Requirements: 4.1, 4.3_

  - [ ]* 6.14 Write unit tests untuk task completion UI
    - Test marking task complete
    - Test visual indicators
    - _Requirements: 4.1, 4.3_

  - [ ] 6.15 Implement task deletion UI
    - Add delete button untuk each task
    - Display confirmation dialog sebelum delete
    - Call Task_Manager.deleteTask() setelah confirmation
    - Display success message atau error
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 6.16 Write unit tests untuk task deletion UI
    - Test delete confirmation
    - Test deletion success dan error handling
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 6.17 Implement overdue date visual indicators
    - Check task due_date vs current date
    - For incomplete tasks past due date: display red color, warning icon, atau bold text
    - For completed tasks: tidak display overdue indicator
    - Evaluate overdue status pada saat halaman dibuka/di-refresh
    - _Requirements: 8.5, 8.6, 8.7_

  - [ ]* 6.18 Write unit tests untuk overdue indicators
    - Test overdue display logic
    - Test completed task tidak show overdue
    - _Requirements: 8.5, 8.6, 8.7_

  - [ ] 6.19 Implement error handling dan user feedback
    - Display error messages dari Task_Manager dengan Indonesian language
    - Display success messages setelah successful operations
    - Handle storage errors dengan appropriate messages
    - _Requirements: 1.4, 1.5, 3.3, 3.4, 4.4, 5.4_

  - [ ]* 6.20 Write unit tests untuk error handling
    - Test error message display
    - _Requirements: 1.4, 1.5, 3.3, 3.4_

- [ ] 7. Checkpoint - Ensure all UI tests pass
  - Jalankan semua UI unit tests
  - Verifikasi semua UI components berfungsi dengan benar
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement property tests untuk overdue logic
  - [ ] 8.1 Write property test untuk overdue status
    - **Property 13: Overdue Status Depends on Due Date and Completion**
    - **Validates: Requirements 8.5, 8.6, 8.7**

  - [ ]* 8.2 Write property test untuk due date handling
    - **Property 11: Null Due Dates Accepted and Persisted**
    - **Validates: Requirements 8.2**

- [ ] 9. Implement end-to-end task workflows
  - [ ] 9.1 Implement complete task lifecycle (Create → Read → Update → Mark Complete → Delete)
    - Wire create task → display di list → update task → mark complete → delete task
    - Ensure all operations flow correctly
    - Maintain state consistency across operations
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

  - [ ]* 9.2 Write integration test untuk complete task lifecycle
    - Test end-to-end workflow dari create hingga delete
    - Verify state consistency
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

  - [ ] 9.3 Implement combined search dan filter workflow
    - Enable simultaneous search dan filter operations
    - Verify search + filter results accuracy
    - _Requirements: 2.3, 2.4, 6.1, 6.2_

  - [ ]* 9.4 Write integration test untuk search + filter combination
    - Test combined search dan filter
    - _Requirements: 2.3, 2.4, 6.1_

  - [ ] 9.5 Implement pagination dengan filtering
    - Ensure pagination works correctly dengan active filters
    - Correct page counts dan navigation dengan filters
    - _Requirements: 2.1, 2.3, 2.4, 2.7_

  - [ ]* 9.6 Write integration test untuk pagination + filtering
    - Test pagination calculations dengan filters
    - _Requirements: 2.1, 2.7_

  - [ ] 9.7 Implement storage persistence validation
    - Verify tasks persist ketika application restart
    - Verify data integrity setelah load dari storage
    - _Requirements: 1.3, 3.1_

  - [ ]* 9.8 Write integration test untuk storage persistence
    - Test persist dan retrieve scenarios
    - _Requirements: 1.3_

- [ ] 10. Checkpoint - Ensure all integration tests pass
  - Jalankan semua integration tests
  - Verify end-to-end workflows berfungsi dengan benar
  - Verify response times compliance (filter ≤ 500ms, search ≤ 300ms, save ≤ 5s)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement performance verification
  - [ ] 11.1 Benchmark dan verify operation response times
    - Task creation: < 500ms
    - Task retrieval (single): < 100ms
    - List all tasks (50 items): < 200ms
    - Filter tasks: ≤ 500ms
    - Search tasks: ≤ 300ms
    - Pagination navigation: < 1 second
    - Task persistence: < 5 seconds
    - Document performance results
    - _Requirements: 1.3, 2.3, 2.4, 2.7, 6.3_

- [ ] 12. Final verification dan cleanup
  - [ ] 12.1 Run all test suites (unit, property, integration)
    - Ensure 100% test pass rate
    - No failing tests atau warnings
    - _Requirements: All_

  - [ ] 12.2 Code review dan cleanup
    - Review code untuk consistency
    - Ensure proper error handling
    - Verify Indonesian language messages
    - Clean up temporary files
    - _Requirements: All_

  - [ ] 12.3 Documentation
    - Create API documentation untuk Task_Manager public methods
    - Document usage examples untuk setiap operation
    - Document error codes dan messages
    - _Requirements: All_

---

## Notes

- Tasks marked dengan `*` adalah optional dan dapat diskip untuk faster MVP
- Setiap task mereferensikan specific requirements untuk traceability
- Checkpoints memastikan incremental validation di setiap tahap
- Property tests validate universal correctness properties dari design
- Unit tests validate specific examples dan edge cases
- Integration tests validate end-to-end workflows
- Semua messages harus dalam Bahasa Indonesia sesuai requirements
- Performance benchmarks harus diverifikasi sebelum completion

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.3"] },
    { "id": 3, "tasks": ["2.4", "3.4", "4.1"] },
    { "id": 4, "tasks": ["4.2", "4.3", "4.5", "4.7", "4.9", "4.11"] },
    { "id": 5, "tasks": ["4.4", "4.6", "4.8", "4.10", "4.12"] },
    { "id": 6, "tasks": ["6.1", "6.3", "6.5", "6.7", "6.9", "6.11", "6.13", "6.15", "6.17", "6.19"] },
    { "id": 7, "tasks": ["6.2", "6.4", "6.6", "6.8", "6.10", "6.12", "6.14", "6.16", "6.18", "6.20"] },
    { "id": 8, "tasks": ["8.1", "8.2"] },
    { "id": 9, "tasks": ["9.1", "9.3", "9.5", "9.7"] },
    { "id": 10, "tasks": ["9.2", "9.4", "9.6", "9.8"] },
    { "id": 11, "tasks": ["11.1"] },
    { "id": 12, "tasks": ["12.1", "12.2", "12.3"] }
  ]
}
```
