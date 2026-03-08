# Approvals

**Path:** `src/pages/manager/Approvals.jsx`

Manager-only page for reviewing task submissions and technician task requests. Divided into four tabs.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | CheckCircle, XCircle, Eye, Clock, User, MapPin, Tag, Calendar, MessageSquare, Image, AlertTriangle, SkipForward, X, Loader2, CheckCheck, AlertCircle, Shield, ClipboardList |
| `../../store/taskStore` | tasks, isLoading, fetchTasks, approveTask, rejectTask, approveTaskRequest, rejectTaskRequest |
| `../../store/authStore` | user |
| `../../data/constants` | TASK_STATUS, SUBMISSION_STATUS |

---

## Tabs

| Tab | filterType | Count Source | Theme |
|-----|-----------|-------------|-------|
| Completed Normal | `'normal'` | `normalCount` | Green |
| With Issues | `'issue'` | `issueCount` | Red |
| Skipped | `'skipped'` | `skippedCount` | Gray |
| Task Requests | `'requests'` | `requestedCount` | Orange |

The **Task Requests** tab shows an animated pulse dot when there are pending requests and the tab is not active.

---

## State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `filterType` | string | `'normal'` | Active tab |
| `selectedTask` | object \| null | `null` | Task for detail/approve/reject modal |
| `showDetailModal` | boolean | `false` | Task detail view |
| `showApproveModal` | boolean | `false` | Approve confirmation |
| `showRejectModal` | boolean | `false` | Reject form |
| `showApproveAllModal` | boolean | `false` | Approve-all confirmation |
| `requestConfirm` | `{type, task}` \| null | `null` | Confirmation modal for task request approve/reject |
| `rejectForm` | `{newDueDate, reason}` | `''` | Reject form data |
| `riskAccepted` | boolean | `false` | Required checkbox for issue/skipped approvals |
| `actionLoading` | boolean | `false` | Single action in progress |
| `approveAllLoading` | boolean | `false` | Approve-all in progress |
| `successMessage` | string | `''` | Auto-clears after 3 s |
| `errorMessage` | string | `''` | Auto-clears after 5 s |

---

## Key Functions

| Function | Description |
|----------|-------------|
| `filteredPendingTasks` | `pending_approval` tasks filtered by `filterType` |
| `needsRiskAcceptance(task)` | True if submission is `issue` or `skipped` |
| `getSubmissionBadge(status)` | Returns colored badge for submission type |
| `formatDate(dateStr)` | Formats to `DD MMM YYYY HH:MM` (en-GB) |
| `openApproveModal(task)` | Sets task and opens approve confirm modal |
| `openRejectModal(task)` | Sets task and pre-fills reject form with tomorrow's date |
| `openDetailModal(task)` | Opens read-only task detail |
| `handleApprove()` | Calls `approveTask`; requires risk checkbox for issue/skipped |
| `handleApproveAll()` | Approves all `normal` pending tasks sequentially |
| `handleReject(e)` | Calls `rejectTask` with new due date + reason; resets task to `open` |
| `handleApproveRequest()` | Calls `approveTaskRequest` after `requestConfirm` modal confirmed |
| `handleRejectRequest()` | Calls `rejectTaskRequest` after `requestConfirm` modal confirmed |

---

## Approval Flows

### Submitted Task (`pending_approval`)
```
Task submitted by technician → pending_approval
     ↓
Manager opens Approve modal
  → [accept risk checkbox] required if issue/skipped
  → Confirm Approve
     → status: completed / issue / skipped  (mirrors submissionStatus)

OR

Manager opens Reject modal → new due date (required) + reason (optional)
  → Confirm Reject
     → status: open  (task returns to pool, assignee cleared)
```

### Task Request (`requested`)
```
Technician submits request → requested
     ↓
Manager clicks [Approve] or [Reject] button
  → requestConfirm modal opens with task name
     ↓
Confirm Approve → approveTaskRequest → status: open  (enters task pool)
Confirm Reject  → rejectTaskRequest  → status: rejected  (technician sees it, must acknowledge)
```

---

## UI Sections

```
Approvals
├── Header
│   ├── Title & subtitle
│   └── "Approve All" button (Normal tab only, when normalCount > 0)
├── Success / Error banners
├── Tab grid (4 columns)
│   ├── Completed Normal
│   ├── With Issues
│   ├── Skipped
│   └── Task Requests  (pulse dot badge when unread)
├── Task Requests list  (visible when filterType === 'requests')
│   └── Each row: task info + [Reject] [Approve] → opens requestConfirm
├── Pending Tasks list  (visible when filterType !== 'requests')
│   └── Each row: task info + submission badge + [👁 View] [Approve] [Reject]
├── Request Confirm Modal
│   └── Green (approve) or Red (reject) dialog showing task name + action description
├── Task Detail Modal
│   └── Read-only: category, location, submitter, dates, submission photo, remarks
├── Approve Modal
│   └── Risk acceptance checkbox (issue/skipped) + [Approve] button
├── Reject Modal
│   └── New due date (required) + reason (optional) + [Reject] button
└── Approve All Modal
    └── Count confirmation + [Approve All] button
```

---

## Business Rules

- **Approve All** applies to `normal` submission tasks only — not issue/skipped.
- Risk acceptance checkbox is **required** before approving `issue` or `skipped` tasks.
- Rejecting a submission resets the task to `open` with a new due date and clears the assignee.
- Rejecting a task **request** sets status to `rejected` (not deleted). Technician sees it and must acknowledge.
- Approving a task **request** sets status to `open` — it enters the pool for any technician to claim.
- Success messages auto-dismiss in **3 s**, error messages in **5 s**.
