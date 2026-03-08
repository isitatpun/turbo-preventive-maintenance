# Contracts

**Path:** `src/pages/Contracts.jsx`

Shared page (accessible to both managers and technicians) for tracking outsourced maintenance agreements. Ensures no contract silently expires by surfacing status alerts, enabling proactive renewals, and permanently archiving cancellations with full audit trail.

---

## Dependencies

| Source | Items Used |
|--------|-----------|
| `lucide-react` | Search, Plus, X, Loader2, AlertCircle, CheckCircle, AlertTriangle, XCircle, Calendar, Phone, Mail, User, Ban, RefreshCw, ScrollText |
| `../store/contractStore` | contracts, isLoading, error, fetchContracts, createContract, renewContract, cancelContract, clearError |
| `../store/taskStore` | categories, fetchCategories |
| `../store/authStore` | user |
| `../data/constants` | CONTRACT_STATUS, CONTRACT_STATUS_LABELS |

---

## Contract Status Logic

Status is **computed on the frontend** from `end_date`. Only `active` and `cancelled` are stored in the database.

```
if (status === 'cancelled')       → Cancelled  (stored in DB)
else if (endDate < today)         → Expired
else if (endDate − today ≤ 30d)   → Expiring Soon
else                              → Active
```

| Status | Badge Color | Icon | DB Value |
|--------|------------|------|----------|
| Active | Green | CheckCircle | `active` |
| Expiring Soon | Yellow | AlertTriangle | `active` |
| Expired | Red | XCircle | `active` |
| Cancelled | Gray | Ban | `cancelled` |

---

## State

### UI State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `searchTerm` | string | `''` | Searches supplier name and service type |
| `filterStatus` | string | `'all'` | Filters by computed status |
| `activeModal` | string \| null | `null` | Controls which modal is open |
| `selectedContract` | object \| null | `null` | Contract being viewed/acted on |
| `formLoading` | boolean | `false` | Submission in progress |
| `successMessage` | string | `''` | Auto-clears after 3 seconds |
| `formError` | string | `''` | Inline error inside modals |

### Form State

```js
formData  = { supplierName, serviceType, description, startDate, endDate,
              contractValue, contactPerson, phone, email, notes, categoryId }

renewDates = { startDate, endDate }
```

### Modal Values (`activeModal`)

| Value | Modal Shown |
|-------|-------------|
| `null` | None |
| `'create'` | New Contract form |
| `'detail'` | Contract detail view |
| `'renew'` | Renewal date picker |
| `'cancel'` | Cancellation confirmation |

---

## Key Functions

### Helpers

| Function | Description |
|----------|-------------|
| `getComputedStatus(contract)` | Returns the display status based on `end_date` and DB `status` |
| `getDaysUntilExpiry(endDate)` | Returns integer days (negative = already expired) |
| `formatDate(dateStr)` | Formats to `DD MMM YYYY` (en-GB) |
| `closeAll()` | Resets all modal state, form data, and errors |

### Handlers

| Function | Description |
|----------|-------------|
| `handleOpenCreate()` | Resets form and opens create modal |
| `handleOpenDetail(contract)` | Sets selected contract and opens detail modal |
| `handleOpenRenew(contract)` | Opens renewal modal for a specific contract |
| `handleOpenCancel(contract)` | Opens cancel confirmation for a specific contract |
| `handleCreate(e)` | Validates and submits new contract |
| `handleRenew(e)` | Validates new dates and calls `renewContract` |
| `handleCancel()` | Calls `cancelContract` with current user ID |

---

## UI Sections

```
Contracts
├── Header — title + "New Contract" button
├── Alert banners
│   ├── Red   — expired contract count
│   └── Yellow — expiring-soon count (≤ 30 days)
├── Success / Store error banners
├── Filters bar
│   ├── Search input (supplier name + service type)
│   └── Status select (All / Active / Expiring Soon / Expired / Cancelled)
├── Contract cards grid (1 → 2 → 3 columns)
│   └── Each card: supplier, service type, category dot, date range,
│       contract value, days remaining/overdue indicator
├── Create Contract Modal
│   └── Fields: Supplier Name*, Service Type, Category, Start Date*,
│       End Date*, Description, Contract Value, Contact Person,
│       Phone, Email, Notes
├── Contract Detail Modal
│   ├── All fields read-only
│   ├── Supplier contact block (person / phone / email)
│   ├── Cancelled-at note (if applicable)
│   ├── Created-by + date footer
│   └── Footer actions: [Cancel Contract] [Renew Contract]
│       (hidden for Cancelled contracts — read-only archive)
├── Renew Modal
│   └── New Start Date* + New End Date*
└── Cancel Confirmation Modal
    └── Irreversible warning + [Keep Contract] [Confirm Cancellation]
```

---

## Business Rules

- **Both managers and technicians** can create, renew, and cancel contracts.
- **Cancellation is permanent** — cancelled contracts remain visible for audit but cannot be renewed or edited. Create a new contract to re-engage the supplier.
- **Renewal overwrites** the previous start/end dates and resets computed status to Active.
- **Expired contracts** remain fully actionable (renew or cancel) — no silent expiry.
- **Category link** ties a contract to a Task Category (e.g., HVAC, Electrical) to indicate the maintenance area covered.
- Success messages auto-dismiss after **3 seconds**.
- Alert banners only appear when there are affected contracts (collapsed otherwise).

---

## Supabase Table: `contracts`

Schema: `preventive_maintenance`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto-generated |
| `supplier_name` | text | Required |
| `service_type` | text | Optional |
| `description` | text | Optional |
| `start_date` | date | Required |
| `end_date` | date | Required |
| `contract_value` | text | Optional free-form (e.g., "120,000 THB") |
| `contact_person` | text | Optional |
| `phone` | text | Optional |
| `email` | text | Optional |
| `notes` | text | Optional |
| `category_id` | uuid | FK → `categories(id)` |
| `status` | text | `'active'` or `'cancelled'` only |
| `cancelled_at` | timestamptz | Set on cancellation |
| `cancelled_by` | uuid | FK → `users(id)` |
| `created_by` | uuid | FK → `users(id)` |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto via trigger |

> Computed statuses (`expiring_soon`, `expired`) are **never stored** — derived from `end_date` at runtime.
