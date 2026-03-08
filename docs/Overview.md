# System Overview

**Project:** Preventive Maintenance System
**Stack:** React + Vite + Tailwind CSS + Supabase + Zustand
**Schema:** `preventive_maintenance` (PostgreSQL via Supabase)

---

## Project Structure

```
src/
├── App.jsx                      # Router + route definitions
├── main.jsx
├── index.css
├── assets/
│   └── logo.png
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.jsx
│   ├── common/
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Modal.jsx
│   ├── layout/
│   │   ├── MainLayout.jsx
│   │   └── Sidebar.jsx
│   └── tasks/
│       └── TaskDetailModal.jsx
├── data/
│   └── constants.js             # TASK_STATUS, USER_ROLES, labels, colors
├── lib/
│   └── supabase.js              # Supabase client
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx            # Shared — role-aware stats
│   ├── Calendar.jsx             # Shared — monthly task calendar
│   ├── TaskHistory.jsx          # Shared — completed task history
│   ├── Tasks.jsx                # Shared — task CRUD (manager) / requests (technician)
│   ├── Contracts.jsx            # Shared — contract management
│   ├── manager/
│   │   ├── Approvals.jsx        # Manager — review submissions + task requests
│   │   ├── Reports.jsx          # Manager — analytics
│   │   ├── Users.jsx            # Manager — user management
│   │   ├── Settings.jsx         # Manager — categories & locations
│   │   └── Documentation.jsx    # Manager — in-app docs viewer
│   └── technician/
│       └── MyTasks.jsx          # Technician — claim tasks, submit work
├── providers/
│   └── DataProvider.jsx         # Fetches all stores on app mount
├── services/
│   ├── index.js
│   ├── authService.js
│   ├── taskService.js
│   ├── contractService.js
│   ├── userService.js
│   ├── categoryService.js
│   ├── locationService.js
│   └── settingsService.js
└── store/
    ├── authStore.js
    ├── taskStore.js
    ├── contractStore.js
    └── userStore.js
```

---

## User Roles

| Role | Value | Description |
|------|-------|-------------|
| Master Admin | `master_admin` | Can impersonate manager or technician view |
| Manager | `manager` | Full access: tasks, approvals, reports, users, settings |
| Technician | `technician` | Claim tasks, submit work, request new tasks, view contracts |

### Role Detection (`authStore`)

| Method | Returns true for |
|--------|-----------------|
| `isManager()` | `manager` and `master_admin` |
| `isTechnician()` | `technician` only |
| `getEffectiveRole()` | `viewingAs` for master_admin; real role otherwise |

### Master Admin "View As"
Master admins toggle between manager/technician views in the sidebar without losing their real role. `viewingAs` is persisted in `localStorage`.

---

## Route Table

| Path | Page | Access |
|------|------|--------|
| `/login` | Login | Public |
| `/dashboard` | Dashboard | All |
| `/calendar` | Calendar | All |
| `/history` | TaskHistory | All |
| `/my-tasks` | MyTasks | All (technician use) |
| `/tasks` | Tasks | All (role-aware) |
| `/contracts` | Contracts | All |
| `/approvals` | Approvals | Manager / Admin |
| `/reports` | Reports | Manager / Admin |
| `/users` | Users | Manager / Admin |
| `/settings` | Settings | Manager / Admin |
| `/docs` | Documentation | Manager / Admin |

---

## Sidebar Navigation

### Manager Menu
Dashboard → Task Management → Approvals → Reports → Task History → Calendar → Contracts → Users → Documentation → Settings

### Technician Menu
Dashboard → My Tasks → Tasks → Task History → Schedule → Contracts

---

## Task Status Flow

```
[Manager creates]      → open
[Technician requests]  → requested
    ├── Manager approves  → open  (enters task pool)
    └── Manager rejects   → rejected  (technician acknowledges → deleted)

open
    └── Technician claims → in_progress
         └── Technician submits → pending_approval
              ├── Manager approves → completed / issue / skipped
              └── Manager rejects  → open  (reset, new due date, assignee cleared)
```

### Status Reference

| Status | Value | Color | Who Sets It |
|--------|-------|-------|-------------|
| Requested | `requested` | Orange | Technician (task request) |
| Rejected | `rejected` | Red | Manager (rejects request) |
| Open | `open` | Blue | Manager (creates/approves request/rejects submission) |
| In Progress | `in_progress` | Yellow | Technician (claims task) |
| Pending Approval | `pending_approval` | Purple | Technician (submits task) |
| Completed | `completed` | Green | Manager (approves normal submission) |
| Issue | `issue` | Red | Manager (approves issue submission) |
| Skipped | `skipped` | Gray | Manager (approves skipped submission) |

> **SQL migration required:**
> ```sql
> ALTER TYPE preventive_maintenance.task_status ADD VALUE IF NOT EXISTS 'requested';
> ALTER TYPE preventive_maintenance.task_status ADD VALUE IF NOT EXISTS 'rejected';
> ```

---

## Zustand Stores

### `authStore` — `src/store/authStore.js`
Persisted to `localStorage` (`pm-auth-storage`).

| State | Type | Purpose |
|-------|------|---------|
| `user` | object \| null | Logged-in user |
| `isAuthenticated` | boolean | Auth guard |
| `viewingAs` | string | `'manager'` or `'technician'` (master admin toggle) |

Key methods: `login`, `loginWithGoogle`, `handleGoogleCallback`, `logout`, `switchViewAs`, `getEffectiveRole`, `validateSession`, `refreshUser`, `isManager()`, `isTechnician()`, `isMasterAdmin()`

---

### `taskStore` — `src/store/taskStore.js`

| State | Purpose |
|-------|---------|
| `tasks` | All tasks |
| `categories` | All categories |
| `locations` | All locations |

Key methods: `fetchAll`, `fetchTasks`, `fetchCategories`, `fetchLocations`, `createTask`, `bulkCreateTasks`, `updateTask`, `deleteTask`, `claimTask`, `unclaimTask`, `submitTask`, `approveTask`, `rejectTask`, `approveTaskRequest`, `rejectTaskRequest`, `acknowledgeRejectedTask`, `addCategory`, `updateCategory`, `deleteCategory`, `addLocation`, `updateLocation`, `deleteLocation`

---

### `contractStore` — `src/store/contractStore.js`

| State | Purpose |
|-------|---------|
| `contracts` | All contracts |

Key methods: `fetchContracts`, `createContract`, `renewContract`, `cancelContract`

---

### `userStore` — `src/store/userStore.js`

| State | Purpose |
|-------|---------|
| `users` | All system users |

Key methods: `fetchUsers`, `getUserById`, `getTechnicians`, `addUser`, `updateUser`, `deleteUser`

---

## Database Tables (Schema: `preventive_maintenance`)

| Table | Purpose |
|-------|---------|
| `users` | System user accounts |
| `tasks` | Maintenance tasks |
| `categories` | Task categories (name + hex color) |
| `locations` | Physical locations (building/floor/zone) |
| `contracts` | Supplier maintenance contracts |

### `tasks` Key Columns

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `run_number` | int | Auto-increment display number |
| `title` | text | Required |
| `description` | text | Optional |
| `category_id` | uuid | FK → categories |
| `location_id` | uuid | FK → locations |
| `status` | enum | See status reference |
| `due_date` | date | Required |
| `assignee_id` | uuid | FK → users (set on claim) |
| `assigned_at` | timestamptz | Set on claim |
| `submission_status` | text | `normal` / `issue` / `skipped` |
| `submission_photo` | text | Base64 or URL |
| `submission_remarks` | text | Optional |
| `skip_reason` | text | Required if skipped |
| `submitted_by` | uuid | FK → users |
| `submitted_at` | timestamptz | Set on submit |
| `approved_by` | uuid | FK → users |
| `approved_at` | timestamptz | Set on approval |
| `rejection_reason` | text | Set on submission rejection |
| `created_by` | uuid | FK → users |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto via trigger |

---

## Common Patterns

### Dropdown Overflow Fix
Action menus inside `overflow-hidden` containers use `position: fixed` with `getBoundingClientRect()` to escape clipping:

```jsx
onClick={(e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
  setActionMenu(id);
}}
// Menu renders outside the overflow context:
<div className="fixed z-50 w-44 ..."
  style={{ top: menuPosition.top, right: menuPosition.right }}>
```

Used in: Tasks.jsx, Contracts.jsx

### Role-Aware Pages
Pages shared between roles branch on `getEffectiveRole()`:
```js
const isTechnician = getEffectiveRole() === USER_ROLES.TECHNICIAN;
```

### Data Loading
`DataProvider` calls stores on app mount. Individual pages call `fetchAll()` (tasks + categories + locations) or `fetchTasks()` as needed.
