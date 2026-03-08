# Users

**Path:** `src/pages/manager/Users.jsx`

Manager-only page for managing system user accounts. Supports creating, editing, and deleting technician and manager accounts.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | Search, Plus, Edit2, Trash2, MoreVertical, Mail, Phone, Shield, User, X, Loader2, AlertCircle, CheckCircle |
| `../../store/userStore` | users, isLoading, error, fetchUsers, addUser, updateUser, deleteUser, clearError |
| `../../data/constants` | USER_ROLES, ROLE_LABELS |

---

## State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `searchTerm` | string | `''` | Name / email search |
| `filterRole` | string | `'all'` | Role filter |
| `showModal` | boolean | `false` | Add/edit user modal |
| `editingUser` | object \| null | `null` | User being edited |
| `showDeleteConfirm` | string \| null | `null` | User ID pending delete |
| `actionMenu` | string \| null | `null` | User ID with open dropdown |
| `formLoading` | boolean | `false` | Submission in progress |
| `successMessage` | string | `''` | Auto-clears after 3 s |
| `formError` | string | `''` | Inline form error |

### Form State

```js
formData = { name, email, phone, role }
// role default: USER_ROLES.TECHNICIAN
```

---

## Key Functions

| Function | Description |
|----------|-------------|
| `filteredUsers` | Users filtered by name/email search and role |
| `handleAddNew()` | Opens modal for new user |
| `handleEdit(user)` | Opens modal pre-filled with user data |
| `handleSubmit(e)` | Creates or updates user |
| `handleDelete(userId)` | Deletes user after confirmation |

---

## UI Sections

```
Users
├── Header — title + [Add User] button
├── Success / Error banners
├── Filters — Search + Role select
├── User table
│   └── Rows: Name / Email | Role badge | Phone | Actions (⋮ menu)
│       ⋮ menu: Edit, Delete
├── Add / Edit User Modal
│   └── Form: Name*, Email*, Phone, Role*
└── Delete Confirmation Modal
```

---

## Business Rules

- New users default to role `technician`.
- Only `manager` and `technician` roles are assignable here (`master_admin` is not).
- Success messages auto-dismiss after **3 seconds**.
