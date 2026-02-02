// Task Status Constants
export const TASK_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  PENDING_APPROVAL: 'pending_approval',
  COMPLETED: 'completed',
  ISSUE: 'issue',
  SKIPPED: 'skipped'
};

// User Role Constants
export const USER_ROLES = {
  MASTER_ADMIN: 'master_admin',
  MANAGER: 'manager',
  TECHNICIAN: 'technician'
};

// User Status Constants (for active/inactive)
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Submission Status Constants
export const SUBMISSION_STATUS = {
  NORMAL: 'normal',
  ISSUE: 'issue',
  SKIPPED: 'skipped'
};

// Priority Levels
export const PRIORITY = {
  LOW: 1,
  NORMAL: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5
};

// Priority Labels
export const PRIORITY_LABELS = {
  1: 'Low',
  2: 'Normal',
  3: 'Medium',
  4: 'High',
  5: 'Critical'
};

// Priority Colors
export const PRIORITY_COLORS = {
  1: 'gray',
  2: 'blue',
  3: 'yellow',
  4: 'orange',
  5: 'red'
};

// Status Labels
export const STATUS_LABELS = {
  [TASK_STATUS.OPEN]: 'Open',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.PENDING_APPROVAL]: 'Pending Approval',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.ISSUE]: 'Issue',
  [TASK_STATUS.SKIPPED]: 'Skipped'
};

// Status Colors
export const STATUS_COLORS = {
  [TASK_STATUS.OPEN]: 'blue',
  [TASK_STATUS.IN_PROGRESS]: 'yellow',
  [TASK_STATUS.PENDING_APPROVAL]: 'purple',
  [TASK_STATUS.COMPLETED]: 'green',
  [TASK_STATUS.ISSUE]: 'red',
  [TASK_STATUS.SKIPPED]: 'gray'
};

// Role Labels
export const ROLE_LABELS = {
  [USER_ROLES.MASTER_ADMIN]: 'Master Admin',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.TECHNICIAN]: 'Technician'
};

export default {
  TASK_STATUS,
  USER_ROLES,
  USER_STATUS,
  SUBMISSION_STATUS,
  PRIORITY,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  ROLE_LABELS
};