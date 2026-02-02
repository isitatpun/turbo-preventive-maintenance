import React from 'react';
import { TASK_STATUS, SUBMISSION_STATUS, PRIORITY_LABELS } from '../../data/constants';

const Badge = ({ status, variant, children, className = '' }) => {
  // Status-based styling
  if (status) {
    const statusStyles = {
      [TASK_STATUS.OPEN]: 'bg-blue-50 text-blue-600',
      [TASK_STATUS.IN_PROGRESS]: 'bg-amber-50 text-amber-600',
      [TASK_STATUS.PENDING_APPROVAL]: 'bg-purple-50 text-purple-600',
      [TASK_STATUS.COMPLETED]: 'bg-emerald-50 text-emerald-600',
      [TASK_STATUS.ISSUE]: 'bg-red-50 text-red-600',
      [TASK_STATUS.SKIPPED]: 'bg-gray-100 text-gray-500'
    };

    const statusLabels = {
      [TASK_STATUS.OPEN]: 'Open',
      [TASK_STATUS.IN_PROGRESS]: 'In Progress',
      [TASK_STATUS.PENDING_APPROVAL]: 'Pending',
      [TASK_STATUS.COMPLETED]: 'Completed',
      [TASK_STATUS.ISSUE]: 'Issue',
      [TASK_STATUS.SKIPPED]: 'Skipped'
    };

    return (
      <span className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
        ${statusStyles[status] || 'bg-gray-100 text-gray-600'}
        ${className}
      `}>
        {statusLabels[status] || status}
      </span>
    );
  }

  // Variant-based styling
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-700',
    accent: 'bg-accent-100 text-accent-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
      ${variantStyles[variant] || variantStyles.gray}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;