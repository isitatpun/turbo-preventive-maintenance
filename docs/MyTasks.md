# My Tasks

**Path:** `src/pages/technician/MyTasks.jsx`

Technician-only page for claiming open tasks, managing in-progress work, and submitting completion reports.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | CheckCircle, Clock, AlertTriangle, MapPin, Calendar, Tag, SkipForward, Loader2, Hand, RefreshCw, ListTodo, CalendarDays, TrendingUp, Target, Award, Zap, Camera, X |
| `../../store/taskStore` | tasks, isLoading, fetchTasks, claimTask, unclaimTask, submitTask |
| `../../store/authStore` | user |
| `../../data/constants` | TASK_STATUS |

---

## Tabs

| Tab | `activeTab` value | Content |
|-----|------------------|---------|
| My Tasks | `'my-tasks'` | Tasks assigned to the logged-in technician (`in_progress`) |
| Task Pool | `'pool'` | All `open` tasks available to claim |

---

## State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `taskFilter` | string | `'all'` | `'all'` or `'today'` |
| `activeTab` | string | `'my-tasks'` | Active tab |
| `selectedTask` | object \| null | `null` | Task for submit modal |
| `showSubmitModal` | boolean | `false` | Submission form modal |
| `showClaimConfirm` | string \| null | `null` | Task ID awaiting claim confirm |
| `showUnclaimConfirm` | string \| null | `null` | Task ID awaiting unclaim confirm |
| `submitType` | string \| null | `null` | `'normal'`, `'issue'`, or `'skipped'` |
| `submitForm` | object | see below | Photo, remarks, skip reason |
| `actionLoading` | boolean | `false` | Action in progress |
| `successMessage` | string | `''` | Auto-clears after 3 s |

```js
submitForm = { photo, photoPreview, remarks, skipReason }
```

---

## Key Functions

| Function | Description |
|----------|-------------|
| `myTasks` | Tasks where `assigneeId === user.id` and `status === in_progress` |
| `poolTasks` | All `open` tasks |
| `displayTasks` | Active tab's list, filtered by `taskFilter` (all / today) |
| `handleClaim(taskId)` | Calls `claimTask` → status becomes `in_progress`, assignee set |
| `handleUnclaim(taskId)` | Calls `unclaimTask` → status resets to `open`, assignee cleared |
| `handleOpenSubmit(task)` | Opens submission modal for selected task |
| `handleSubmit()` | Calls `submitTask` with type + photo + remarks/skipReason → `pending_approval` |
| `handlePhotoChange(e)` | Reads photo file into base64 preview |

---

## Submission Types

| Type | Required Fields | Notes |
|------|----------------|-------|
| `normal` | — (photo optional) | Standard task completion |
| `issue` | Photo + Remarks | Reports a problem found |
| `skipped` | Skip reason | Task could not be performed |

---

## UI Sections

```
MyTasks
├── Header — "My Tasks" title + Today filter toggle
├── Success banner
├── Stats row  (My Tasks count · Today's Tasks count · Pool count)
├── Tabs — [My Tasks] [Task Pool]
├── Task list
│   ├── Loading spinner
│   ├── Empty state
│   └── Task cards
│       My Tasks: info + [Unclaim] [Submit] buttons
│       Pool:     info + [Claim] button
├── Claim Confirmation Modal
│   └── Task title + [Cancel] [Claim Task]
├── Unclaim Confirmation Modal
│   └── Warning + [Cancel] [Release Task]
└── Submit Modal
    ├── Step 1 — Choose type: [Normal] [Issue] [Skipped]
    └── Step 2 — Type-specific form
        Normal:  Optional photo + optional remarks
        Issue:   Required photo + required remarks
        Skipped: Required skip reason
```

---

## Business Rules

- Only `open` tasks can be claimed. Claim sets status to `in_progress`.
- Unclaiming resets the task to `open`, clears assignee — available to any technician.
- Submit sets status to `pending_approval` — manager reviews in Approvals page.
- **Issue** submissions require both a photo and remarks.
- **Skipped** submissions require a skip reason.
- After manager approval, final status mirrors `submissionStatus`: `completed`, `issue`, or `skipped`.
