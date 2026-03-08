# Calendar

**Path:** `src/pages/Calendar.jsx`

Shared page showing task due dates on a monthly calendar grid. Accessible to both managers and technicians.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | ChevronLeft, ChevronRight, CalendarIcon, ClipboardList |
| `date-fns` | format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO |
| `../store/taskStore` | tasks, categories |
| `../store/authStore` | user, isTechnician |
| `../data/constants` | TASK_STATUS |

---

## State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `currentMonth` | Date | `new Date()` | Currently displayed month |
| `selectedDate` | Date \| null | `null` | Date clicked on the calendar |
| `selectedTask` | object \| null | `null` | Task opened in detail modal |
| `showDetailModal` | boolean | `false` | Task detail modal |

---

## Role Filtering

| Role | Tasks Shown |
|------|-------------|
| Technician | Only tasks where `assigneeId === user.id` |
| Manager / Admin | All tasks |

---

## Status Colors (calendar chips)

| Status | Background | Text |
|--------|-----------|------|
| `completed` | emerald-100 | emerald-700 |
| `in_progress` | amber-100 | amber-700 |
| `issue` | red-100 | red-700 |
| `open` | blue-100 | blue-700 |
| `pending_approval` | purple-100 | purple-700 |

---

## UI Sections

```
Calendar
├── Header — breadcrumb + title
├── Month navigation — [← Prev]  [Month Year]  [Next →]
├── Grid layout  (2/3 calendar + 1/3 side panel)
│   ├── Calendar grid (7 columns × ~6 rows)
│   │   ├── Weekday headers  Sun – Sat
│   │   ├── Day cells (clickable)
│   │   │   ├── Day number  (red bold = today, muted = outside month)
│   │   │   └── Up to 3 task chips  (+N more label)
│   │   └── Status color legend
│   └── Selected date panel
│       ├── Date heading
│       ├── Task list (each item clickable → detail modal)
│       └── Empty state placeholder
└── TaskDetailModal component
```

---

## Business Rules

- Days outside the current month are shown in muted color (`bg-gray-50/50`).
- Today's number is highlighted **red bold**.
- Maximum **3 task chips** per cell; overflow shown as `+N more`.
- Clicking a task opens a read-only `TaskDetailModal`.
- Calendar week starts on **Sunday**.
