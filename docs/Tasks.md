# Tasks

**Path:** `src/pages/Tasks.jsx`

Shared page accessible to **both managers and technicians**. Behavior adapts based on role detected via `getEffectiveRole()`.

- **Manager**: Full CRUD over all tasks, bulk Excel import, see all non-requested tasks.
- **Technician**: Submit task requests (require manager approval), view own requests lifecycle.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | Search, Plus, Filter, Calendar, MapPin, Tag, Edit2, Trash2, MoreVertical, X, Loader2, AlertCircle, CheckCircle, Download, Upload, FileSpreadsheet, Info |
| `../store/taskStore` | tasks, categories, locations, isLoading, error, fetchAll, createTask, bulkCreateTasks, updateTask, deleteTask, acknowledgeRejectedTask, clearError |
| `../store/authStore` | user, getEffectiveRole |
| `../data/constants` | TASK_STATUS, STATUS_LABELS, USER_ROLES |
| `xlsx` | XLSX (Excel read/write) |

---

## Role Behavior

| Feature | Manager | Technician |
|---------|---------|-----------|
| Page title | Task Management | Task Requests |
| Filters shown | Search + Year + Status + Category | Search only |
| Tasks visible | All tasks (excluding `requested`) | Own tasks only — `requested`, `open`, `rejected` |
| Status labels | Standard | `open` shown as "Approved" |
| Add button | "Add Task" (creates `open`) | "Request Task" (creates `requested`) |
| Bulk Create button | Visible | Hidden |
| Action menu | Edit (any non-completed), Delete (open only) | Edit (requested only), Cancel Request (requested only) |
| Rejected tasks | N/A | Shows "Acknowledge" button — deletes on click |

---

## State

### UI State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `searchTerm` | string | `''` | Task title search |
| `filterStatus` | string | `'all'` | Status filter (manager only) |
| `filterCategory` | string | `'all'` | Category filter (manager only) |
| `filterYear` | string | current year | Year filter (manager only) |
| `showModal` | boolean | `false` | Add/edit task modal |
| `showBulkModal` | boolean | `false` | Bulk create modal |
| `showDeleteConfirm` | string \| null | `null` | Task ID pending delete |
| `actionMenu` | string \| null | `null` | Task ID with open dropdown |
| `menuPosition` | `{top, right}` | `{0,0}` | Fixed-position coordinates for dropdown |
| `formLoading` | boolean | `false` | Submission in progress |
| `successMessage` | string | `''` | Auto-clears after 3 s |
| `formError` | string | `''` | Inline form error |
| `editingTask` | object \| null | `null` | Task being edited |

### Form State

```js
formData = { title, description, categoryId, locationId, dueDate }
bulkForm  = { excelFile, fileName }
```

---

## Key Functions

| Function | Description |
|----------|-------------|
| `filteredTasks` | Derived list — technicians: own requested/open/rejected; managers: all non-requested, filtered by search/status/category/year |
| `getStatusColor(status)` | Maps `TASK_STATUS` to Tailwind badge classes |
| `formatDate(dateStr)` | Formats to `DD MMM YYYY` (en-GB) |
| `handleAddNew()` | Opens modal with defaults |
| `handleEdit(task)` | Opens modal with existing task data |
| `handleCloseModal()` | Resets and closes modal |
| `handleSubmit(e)` | Creates or updates task; sets status to `requested` for technician, `open` for manager |
| `handleDelete(taskId)` | Deletes task after confirm dialog |
| `handleAcknowledgeRejected(taskId)` | Calls `acknowledgeRejectedTask` (permanent delete), used by technician on rejected requests |
| `handleDownloadTemplate()` | Generates 4-sheet Excel template |
| `handleFileChange(e)` | Validates Excel file upload |
| `handleBulkCreate(e)` | Parses Excel, validates each row, bulk-creates tasks |

---

## Task Request Lifecycle (Technician)

```
Technician submits → status: requested
     ↓
Manager approves (Approvals page) → status: open  [shown as "Approved" to technician]
     ↓
Task enters pool, other technicians can claim it

OR

Manager rejects (Approvals page) → status: rejected  [shown as "Rejected" to technician]
     ↓
Technician clicks "Acknowledge" → task deleted permanently
```

---

## UI Sections

```
Tasks
├── Header
│   ├── Title & subtitle (role-aware)
│   └── Action buttons: [Bulk Create]* [Add Task / Request Task]
│       * Manager only
├── Success / Error banners
├── Filters bar
│   ├── Search input (always)
│   └── Year + Status + Category selects (manager only)
├── Tasks table
│   ├── Loading spinner
│   ├── Empty state (role-aware message)
│   └── Rows: Task | Category | Location | Due Date | Status | Actions
│       - Rejected rows (technician): "Acknowledge" button
│       - Others: ⋮ action menu (fixed-position to avoid overflow clipping)
├── Add / Edit Task Modal
│   └── Form: Title, Description, Category, Location, Due Date
├── Bulk Create Modal (manager only)
│   ├── Step 1 – Download Excel template
│   ├── Reference panels – Available Categories & Locations
│   └── Step 2 – Upload completed Excel file
└── Delete Confirmation Modal
```

---

## Business Rules

- Dropdown menus use `position: fixed` + `getBoundingClientRect()` to avoid overflow clipping inside the table container.
- **Technicians** cannot see tasks owned by others or in status other than `requested`, `open`, `rejected`.
- **Manager delete** is shown only for `OPEN` tasks.
- **Edit** is blocked for `COMPLETED` tasks.
- Bulk upload validates each row individually; surfaces up to 5 errors before aborting.
- Category/Location matching in bulk upload is **case-insensitive**.
- Success messages auto-dismiss after **3 seconds**.

---

## Excel Bulk Upload Format

| Column | Required | Notes |
|--------|----------|-------|
| Task Title | Yes | — |
| Description | No | Optional |
| Category | Yes | Must match existing name (case-insensitive) |
| Location | Yes | Must match existing name (case-insensitive) |
| Due Date | Yes | Format: `YYYY-MM-DD` |

Template has four sheets: *Task Template*, *How to Fill*, *Categories List*, *Locations List*.
