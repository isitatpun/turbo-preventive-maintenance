# Settings

**Path:** `src/pages/manager/Settings.jsx`

Manager-only page for managing **Categories** and **Locations** — the reference data used across the system for task assignment and filtering.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | Settings, Building2, MapPin, Plus, Edit2, Trash2, X, Loader2, CheckCircle, AlertCircle, Palette |
| `../../store/taskStore` | categories, locations, isLoading, fetchCategories, fetchLocations, addCategory, updateCategory, deleteCategory, addLocation, updateLocation, deleteLocation |

---

## State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `activeTab` | string | `'categories'` | `'categories'` or `'locations'` |
| `showModal` | boolean | `false` | Add/edit modal |
| `modalType` | string \| null | `null` | `'category'` or `'location'` |
| `editingItem` | object \| null | `null` | Item being edited |
| `showDeleteConfirm` | string \| null | `null` | Item ID pending delete |
| `formLoading` | boolean | `false` | Submission in progress |
| `successMessage` | string | `''` | Auto-clears after 3 s |
| `formError` | string | `''` | Inline error |

### Category Form

```js
categoryForm = { name, code, color, description }
// color default: '#3B82F6'
```

### Location Form

```js
locationForm = { name, code, building, floor, zone, description }
```

---

## UI Sections

```
Settings
├── Header — title
├── Tabs — [Categories] [Locations]
├── Categories tab
│   ├── [Add Category] button
│   ├── Category list
│   │   └── Each item: color swatch + name + code + description + [Edit] [Delete]
│   └── Add / Edit Category Modal
│       └── Name*, Code, Color (picker), Description
└── Locations tab
    ├── [Add Location] button
    ├── Location list
    │   └── Each item: name + code + building + floor + zone + [Edit] [Delete]
    └── Add / Edit Location Modal
        └── Name*, Code, Building, Floor, Zone, Description
```

---

## Business Rules

- **Categories** need a unique name and a hex color (used for visual identification throughout the app).
- **Locations** track building, floor, and zone — used in task assignment and history filtering.
- Deleting a category/location that is referenced by existing tasks will fail at the database level (FK constraint).
- Success messages auto-dismiss after **3 seconds**.

---

## Database Tables

### `categories`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | Required, unique |
| `code` | text | Short identifier |
| `color` | text | Hex color string |
| `description` | text | Optional |
| `created_at` | timestamptz | Auto |

### `locations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `name` | text | Required, unique |
| `code` | text | Short identifier |
| `building` | text | Optional |
| `floor` | text | Optional |
| `zone` | text | Optional |
| `description` | text | Optional |
| `created_at` | timestamptz | Auto |
