# Reports

**Path:** `src/pages/manager/Reports.jsx`

Manager-only analytics page. Supports monthly or yearly view with task completion statistics, category breakdowns, and technician performance data.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | BarChart3, TrendingUp, CheckCircle, AlertTriangle, Download, ChevronDown, Calendar |
| `date-fns` | format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth, addMonths, isWithinInterval |
| `../../store/taskStore` | tasks, categories, locations |
| `../../store/userStore` | users, getTechnicians |
| `../../data/constants` | TASK_STATUS |

---

## State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `viewMode` | string | `'monthly'` | `'monthly'` or `'yearly'` |
| `selectedMonth` | string | current month | `'yyyy-MM'` format |
| `selectedYear` | string | current year | `'yyyy'` format |

---

## View Modes

### Monthly View
- Scopes tasks to the selected month.
- Shows daily task completion data.
- Month options: **January 2026 → next month** from today (auto-extending).

### Yearly View
- Scopes tasks to the selected year.
- Shows monthly aggregated statistics.
- Year options mirror the same range.

---

## UI Sections

```
Reports
├── Header — title + [Monthly] [Yearly] toggle
├── Period selector  (month picker or year picker)
├── Summary stat cards
│   ├── Total Tasks
│   ├── Completed
│   ├── Issues
│   └── Skipped
├── Completion chart  (bar visualization over time)
├── Category breakdown
├── Technician performance table
└── Export button  (downloads report as Excel)
```

---

## Business Rules

- Only accessible to managers and master admins.
- Month range starts from **January 2026** and auto-extends to next month from today.
