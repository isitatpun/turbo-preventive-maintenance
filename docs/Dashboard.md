# Dashboard

**Path:** `src/pages/Dashboard.jsx`

Landing page after login. Shows role-aware statistics scoped to a selected year, recent activity, and quick-action shortcuts.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | ClipboardList, Clock, CheckCircle, AlertTriangle, TrendingUp, Calendar, Users, ArrowRight, Filter |
| `react-router-dom` | Link |
| `date-fns` | format, parseISO, isToday, getYear, addMonths |
| `../store/taskStore` | tasks, categories, locations |
| `../store/userStore` | users |
| `../store/authStore` | user, isManager, isTechnician |
| `../data/constants` | TASK_STATUS |

---

## Year Filter

- Dropdown in top-right of the page header.
- Range: **2026 → next month's year** (auto-expands as time passes).
- All stats and the recent task list are scoped to `selectedYear`.
- If `selectedYear` falls outside the generated range it is added automatically to prevent UI errors.

---

## Stats

### Manager View (4 cards)

| Card | Value |
|------|-------|
| Total Tasks | All tasks in selected year |
| Pending Approval | `pending_approval` count |
| Completed | `completed` count |
| Overdue | Non-completed/skipped tasks past due date |

### Technician View (4 cards)

| Card | Value |
|------|-------|
| My Tasks | `in_progress` tasks assigned to user |
| Today's Tasks | `in_progress` tasks due today assigned to user |
| Completed | `completed` tasks assigned to user |
| Available in Pool | `open` tasks (claimable by anyone) |

---

## Recent Tasks Panel

| Role | Content | Link |
|------|---------|------|
| Manager | Up to 5 `pending_approval` tasks | → /approvals |
| Technician | Up to 5 own `in_progress` tasks | → /my-tasks |

---

## Quick Actions (Manager only)

Three clickable cards linking to:
- `/tasks` — Manage Tasks
- `/users` — Manage Users
- `/reports` — View Reports

---

## Business Rules

- All stats use `filteredTasks` (year-scoped), not the full `tasks` array.
- Overdue excludes `completed` and `skipped` statuses.
- The year dropdown is `useMemo`-computed; changing year instantly re-derives all stats via `useMemo`.
