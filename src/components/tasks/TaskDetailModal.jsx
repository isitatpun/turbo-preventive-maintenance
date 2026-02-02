import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User,
  Tag,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Play,
  RotateCcw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import useTaskStore from '../../store/taskStore';
import useUserStore from '../../store/userStore';
import useAuthStore from '../../store/authStore';
import { TASK_STATUS, SUBMISSION_STATUS, PRIORITY_LABELS } from '../../data/constants';

const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  task,
  onClaim,
  onUnclaim,
  onSubmit
}) => {
  const { user } = useAuthStore();
  const { categories, locations } = useTaskStore();
  const { getUserById } = useUserStore();

  if (!task) return null;

  const category = categories.find(c => c.id === task.categoryId);
  const location = locations.find(l => l.id === task.locationId);
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;

  const isOwner = task.assigneeId === user?.id;
  const canClaim = task.status === TASK_STATUS.OPEN;
  const canUnclaim = isOwner && task.status === TASK_STATUS.IN_PROGRESS;
  const canSubmit = isOwner && task.status === TASK_STATUS.IN_PROGRESS;

  const getStatusInfo = (status) => {
    switch (status) {
      case TASK_STATUS.OPEN:
        return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Open' };
      case TASK_STATUS.IN_PROGRESS:
        return { icon: Play, color: 'text-amber-500', bg: 'bg-amber-50', label: 'In Progress' };
      case TASK_STATUS.PENDING_APPROVAL:
        return { icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Pending Approval' };
      case TASK_STATUS.COMPLETED:
        return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Completed' };
      case TASK_STATUS.ISSUE:
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Issue' };
      case TASK_STATUS.SKIPPED:
        return { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Skipped' };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Unknown' };
    }
  };

  const statusInfo = getStatusInfo(task.status);
  const StatusIcon = statusInfo.icon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${statusInfo.bg}`}>
          <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
          <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600">{task.description}</p>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">Category</span>
            </div>
            <p className="font-semibold text-gray-900">{category?.name || 'Unknown'}</p>
          </div>

          {/* Location */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <p className="font-semibold text-gray-900">{location?.name || 'Unknown'}</p>
          </div>

          {/* Due Date */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Due Date</span>
            </div>
            <p className="font-semibold text-gray-900">
              {format(parseISO(task.dueDate), 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Assignee */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Assignee</span>
            </div>
            {assignee ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center text-accent-600 text-xs font-semibold">
                  {assignee.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-gray-900">{assignee.name}</p>
              </div>
            ) : (
              <p className="font-semibold text-gray-400">Unassigned</p>
            )}
          </div>
        </div>

        {/* Submission Info (if submitted) */}
        {task.submittedAt && (
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <h4 className="font-semibold text-gray-900">Submission Details</h4>
            
            {task.submissionPhoto && (
              <img 
                src={task.submissionPhoto} 
                alt="Submission" 
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            {task.submissionRemarks && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Remarks</p>
                <p className="text-gray-700">{task.submissionRemarks}</p>
              </div>
            )}

            {task.submissionStatus === 'issue' && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Issue reported</span>
              </div>
            )}

            {task.submissionStatus === 'skipped' && task.skipReason && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-amber-700">
                  <span className="font-medium">Skip Reason:</span> {task.skipReason}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-400">
              Submitted {format(parseISO(task.submittedAt), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        )}

        {/* Rejection Info */}
        {task.rejectionReason && (
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Previously Rejected</span>
            </div>
            <p className="text-red-700">{task.rejectionReason}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          {canClaim && onClaim && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={onClaim}
            >
              <CheckCircle className="w-4 h-4" />
              Claim Task
            </Button>
          )}

          {canUnclaim && onUnclaim && (
            <Button
              variant="outline"
              onClick={onUnclaim}
            >
              <RotateCcw className="w-4 h-4" />
              Return to Pool
            </Button>
          )}

          {canSubmit && onSubmit && (
            <Button
              variant="success"
              className="flex-1"
              onClick={onSubmit}
            >
              <CheckCircle className="w-4 h-4" />
              Submit Task
            </Button>
          )}

          {!canClaim && !canSubmit && (
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;