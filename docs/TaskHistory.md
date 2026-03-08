# Task History

**Path:** `src/pages/TaskHistory.jsx`

Shows finalized tasks (completed, issue, skipped). Role-aware — managers see all submissions; technicians see only their own.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | History, Search, Calendar, MapPin, CheckCircle, AlertTriangle, XCircle, ChevronRight, Image, ChevronDown, X |
| `date-fns` | format, parseISO |
| `../store/taskStore` | tasks, categories, locations |
| `../store/userStore` | users, getTechnicians |
| `../store/authStore` | user, isManager |
| `../data/constants` | TASK_STATUS, SUBMISSION_STATUS, PRIORITY_LABELS |

---

## State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `searchTerm` | string | `''` | Task title search |
| `categoryFilter` | string | `''` | Category dropdown |
| `locationFilter` | string | `''` | Location dropdown |
| `technicianFilter` | string | `''` | Submitter filter (manager only) |
| `yearFilter` | string | `''` | Year of submission |
| `selectedTask` | object \| null | `null` | Task in detail modal |
| `showDetailModal` | boolean | `false` | Detail modal |

---

## Filtering Logic (applied in order)

1. Base: tasks with `status` in `[completed, issue, skipped]`
2. If **technician**: restrict to `submittedBy === user.id`
3. Search: `title` contains `searchTerm`
4. Category / Location / Technician (manager only) dropdowns
5. Year: derived from `submittedAt` (falls back to `createdAt`)
6. Sort: descending by `submittedAt` / `createdAt`

---

## Stats (Manager only — scoped to filtered results)

Three stat cards:
- **Completed** count
- **Issues** count
- **Skipped** count

**Technician breakdown card** (manager only, when data exists):
- One card per technician showing name, total count, and a proportional bar (green = completed, red = issues, gray = skipped).

---

## Filter Controls

| Filter | Visible To |
|--------|-----------|
| Search | Both |
| Year pill | Both |
| Category pill | Both |
| Location pill | Both |
| Technician pill | Manager only |
| Clear button | Both (when any filter is active) |

Active filter count is shown on the Clear button: `Clear (N)`.

---

## UI Sections

```
TaskHistory
├── Header — title + subtitle (role-aware)
├── Stats row — Completed / Issues / Skipped  (manager only)
├── Filter bar
│   ├── Search input
│   └── Pill dropdowns: Year · Category · Location · Technician* · Clear
│       * Manager only
├── Technician breakdown card  (manager only)
├── History list
│   └── Task cards (clickable) — status icon, title, category badge,
│       location, date, photo indicator, submitter avatar (manager)
└── Detail Modal
    └── Photo (if any), status badge, title, category, location,
        remarks, skip reason, submitter block (manager), timestamps
```

---

## Business Rules

- Technicians **cannot** see other technicians' submissions.
- The Technician filter dropdown is completely hidden for non-managers.
- `availableYears` is auto-computed from actual task data (not hard-coded).
- Year is derived from `submittedAt`, falling back to `createdAt` if not yet submitted.
