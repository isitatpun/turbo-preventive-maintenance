import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
};

const colors = {
  success: 'bg-success-50 border-success-200 text-success-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const iconColors = {
  success: 'text-success-500',
  error: 'text-red-500',
  warning: 'text-warning-500',
  info: 'text-blue-500'
};

const Toast = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 3000
}) => {
  const Icon = icons[type];

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-down">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-apple-lg border shadow-apple-md
        ${colors[type]}
      `}>
        <Icon className={`w-5 h-5 ${iconColors[type]}`} />
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;