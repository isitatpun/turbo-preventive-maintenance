// src/pages/manager/Approvals.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye,
  Clock,
  User,
  MapPin,
  Tag,
  Calendar,
  MessageSquare,
  Image,
  AlertTriangle,
  SkipForward,
  X,
  Loader2,
  CheckCheck,
  AlertCircle,
  Shield
} from 'lucide-react';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import { TASK_STATUS, SUBMISSION_STATUS } from '../../data/constants';

const Approvals = () => {
  const { user } = useAuthStore();
  const { 
    tasks, 
    isLoading, 
    fetchTasks,
    approveTask, 
    rejectTask 
  } = useTaskStore();

  // Filter state - default to 'normal' (Completed Normal)
  const [filterType, setFilterType] = useState('normal');
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveAllModal, setShowApproveAllModal] = useState(false);
  
  // Form states
  const [rejectForm, setRejectForm] = useState({
    newDueDate: '',
    reason: ''
  });
  const [riskAccepted, setRiskAccepted] = useState(false);
  
  // Loading states
  const [actionLoading, setActionLoading] = useState(false);
  const [approveAllLoading, setApproveAllLoading] = useState(false);
  
  // Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get pending approval tasks
  const allPendingTasks = tasks.filter(t => t.status === TASK_STATUS.PENDING_APPROVAL);
  
  // Filter pending tasks based on submission type
  const filteredPendingTasks = allPendingTasks.filter(task => {
    if (filterType === 'normal') return task.submissionStatus === SUBMISSION_STATUS.NORMAL;
    if (filterType === 'issue') return task.submissionStatus === SUBMISSION_STATUS.ISSUE;
    if (filterType === 'skipped') return task.submissionStatus === SUBMISSION_STATUS.SKIPPED;
    return true;
  });

  // Get counts for each type
  const normalCount = allPendingTasks.filter(t => t.submissionStatus === SUBMISSION_STATUS.NORMAL).length;
  const issueCount = allPendingTasks.filter(t => t.submissionStatus === SUBMISSION_STATUS.ISSUE).length;
  const skippedCount = allPendingTasks.filter(t => t.submissionStatus === SUBMISSION_STATUS.SKIPPED).length;

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get submission type badge
  const getSubmissionBadge = (status) => {
    switch (status) {
      case SUBMISSION_STATUS.NORMAL:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Completed Normal
          </span>
        );
      case SUBMISSION_STATUS.ISSUE:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" />
            Issue Reported
          </span>
        );
      case SUBMISSION_STATUS.SKIPPED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <SkipForward className="w-3 h-3" />
            Skipped
          </span>
        );
      default:
        return null;
    }
  };

  // Check if task needs risk acceptance
  const needsRiskAcceptance = (task) => {
    return task.submissionStatus === SUBMISSION_STATUS.ISSUE || 
           task.submissionStatus === SUBMISSION_STATUS.SKIPPED;
  };

  // Open approve modal
  const openApproveModal = (task) => {
    setSelectedTask(task);
    setRiskAccepted(false);
    setShowApproveModal(true);
  };

  // Handle approve single task
  const handleApprove = async () => {
    if (!selectedTask) return;
    
    if (needsRiskAcceptance(selectedTask) && !riskAccepted) {
      setErrorMessage('Please accept the risk before approving');
      return;
    }
    
    setActionLoading(true);
    try {
      await approveTask(selectedTask.id, user.id);
      setSuccessMessage('Task approved successfully');
      setShowApproveModal(false);
      setShowDetailModal(false);
      setSelectedTask(null);
      setRiskAccepted(false);
    } catch (error) {
      console.error('Approve error:', error);
      setErrorMessage('Failed to approve: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle approve all (only normal/completed tasks)
  const handleApproveAll = async () => {
    const normalTasks = allPendingTasks.filter(t => t.submissionStatus === SUBMISSION_STATUS.NORMAL);
    
    if (normalTasks.length === 0) {
      setErrorMessage('No completed normal tasks to approve');
      setShowApproveAllModal(false);
      return;
    }

    setApproveAllLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const task of normalTasks) {
      try {
        await approveTask(task.id, user.id);
        successCount++;
      } catch (error) {
        console.error('Failed to approve task:', task.id, error);
        failCount++;
      }
    }

    setApproveAllLoading(false);
    setShowApproveAllModal(false);

    if (failCount === 0) {
      setSuccessMessage(`Successfully approved ${successCount} task(s)`);
    } else {
      setSuccessMessage(`Approved ${successCount} task(s), ${failCount} failed`);
    }
  };

  // Handle reject
  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectForm.newDueDate) {
      setErrorMessage('Please select a new due date');
      return;
    }

    setActionLoading(true);
    try {
      await rejectTask(selectedTask.id, rejectForm.newDueDate, rejectForm.reason);
      setSuccessMessage('Task rejected and returned to pool');
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedTask(null);
      setRejectForm({ newDueDate: '', reason: '' });
    } catch (error) {
      console.error('Reject error:', error);
      setErrorMessage('Failed to reject: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Open reject modal
  const openRejectModal = (task) => {
    setSelectedTask(task);
    setRejectForm({
      newDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: ''
    });
    setShowRejectModal(true);
  };

  // Open detail modal
  const openDetailModal = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Approvals</h1>
          <p className="text-gray-500 mt-1">Review and approve submitted tasks</p>
        </div>
        
        {/* Approve All Button - Only show when Completed Normal is selected */}
        {filterType === 'normal' && normalCount > 0 && (
          <button
            onClick={() => setShowApproveAllModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium shadow-sm"
          >
            <CheckCheck className="w-5 h-5" />
            Approve All ({normalCount})
          </button>
        )}
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-green-700 font-medium">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="ml-auto">
            <X className="w-4 h-4 text-green-500" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 font-medium">{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="ml-auto">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Filter Tabs - 3 Tabs, Full Width */}
      <div className="grid grid-cols-3 gap-4">
        {/* Completed Normal Tab */}
        <button
          onClick={() => setFilterType('normal')}
          className={`relative p-5 rounded-2xl border-2 transition-all ${
            filterType === 'normal'
              ? 'border-green-500 bg-green-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              filterType === 'normal' ? 'bg-green-500' : 'bg-green-100'
            }`}>
              <CheckCircle className={`w-6 h-6 ${
                filterType === 'normal' ? 'text-white' : 'text-green-600'
              }`} />
            </div>
            <div className="text-left">
              <p className={`text-2xl font-bold ${
                filterType === 'normal' ? 'text-green-700' : 'text-gray-900'
              }`}>{normalCount}</p>
              <p className={`text-sm font-medium ${
                filterType === 'normal' ? 'text-green-600' : 'text-gray-500'
              }`}>Completed Normal</p>
            </div>
          </div>
          {filterType === 'normal' && (
            <div className="absolute top-3 right-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          )}
        </button>

        {/* With Issues Tab */}
        <button
          onClick={() => setFilterType('issue')}
          className={`relative p-5 rounded-2xl border-2 transition-all ${
            filterType === 'issue'
              ? 'border-red-500 bg-red-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              filterType === 'issue' ? 'bg-red-500' : 'bg-red-100'
            }`}>
              <AlertTriangle className={`w-6 h-6 ${
                filterType === 'issue' ? 'text-white' : 'text-red-600'
              }`} />
            </div>
            <div className="text-left">
              <p className={`text-2xl font-bold ${
                filterType === 'issue' ? 'text-red-700' : 'text-gray-900'
              }`}>{issueCount}</p>
              <p className={`text-sm font-medium ${
                filterType === 'issue' ? 'text-red-600' : 'text-gray-500'
              }`}>With Issues</p>
            </div>
          </div>
          {filterType === 'issue' && (
            <div className="absolute top-3 right-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          )}
        </button>

        {/* Skipped Tab */}
        <button
          onClick={() => setFilterType('skipped')}
          className={`relative p-5 rounded-2xl border-2 transition-all ${
            filterType === 'skipped'
              ? 'border-gray-500 bg-gray-100 shadow-sm'
              : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              filterType === 'skipped' ? 'bg-gray-500' : 'bg-gray-200'
            }`}>
              <SkipForward className={`w-6 h-6 ${
                filterType === 'skipped' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
            <div className="text-left">
              <p className={`text-2xl font-bold ${
                filterType === 'skipped' ? 'text-gray-700' : 'text-gray-900'
              }`}>{skippedCount}</p>
              <p className={`text-sm font-medium ${
                filterType === 'skipped' ? 'text-gray-600' : 'text-gray-500'
              }`}>Skipped</p>
            </div>
          </div>
          {filterType === 'skipped' && (
            <div className="absolute top-3 right-3">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            </div>
          )}
        </button>
      </div>

      {/* Pending Tasks List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {filterType === 'normal' && 'Completed Normal Tasks'}
              {filterType === 'issue' && 'Tasks With Issues'}
              {filterType === 'skipped' && 'Skipped Tasks'}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredPendingTasks.length} {filteredPendingTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredPendingTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              filterType === 'normal' ? 'bg-green-100' :
              filterType === 'issue' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {filterType === 'normal' && <CheckCircle className="w-8 h-8 text-green-500" />}
              {filterType === 'issue' && <AlertTriangle className="w-8 h-8 text-red-500" />}
              {filterType === 'skipped' && <SkipForward className="w-8 h-8 text-gray-500" />}
            </div>
            <p className="text-gray-900 font-medium mb-1">No tasks in this category</p>
            <p className="text-gray-500 text-sm">
              {filterType === 'normal' && 'No completed normal tasks pending approval'}
              {filterType === 'issue' && 'No tasks with issues pending approval'}
              {filterType === 'skipped' && 'No skipped tasks pending approval'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPendingTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Task Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${task.category?.color || '#6B7280'}20` }}
                      >
                        <Tag className="w-5 h-5" style={{ color: task.category?.color || '#6B7280' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          {getSubmissionBadge(task.submissionStatus)}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">#{task.runNumber}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {task.assignee?.name || task.submitter?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {task.location?.name || 'Unknown'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(task.submittedAt)}
                          </div>
                        </div>

                        {/* Show remarks */}
                        {task.submissionRemarks && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-600">{task.submissionRemarks}</p>
                            </div>
                          </div>
                        )}

                        {/* Show skip reason */}
                        {task.skipReason && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-yellow-700">
                                <span className="font-medium">Skip Reason:</span> {task.skipReason}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:ml-4 flex-shrink-0">
                    <button 
                      onClick={() => openDetailModal(task)}
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => openApproveModal(task)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(task)}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Task Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTask(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Header */}
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${selectedTask.category?.color || '#6B7280'}20` }}
                >
                  <Tag className="w-6 h-6" style={{ color: selectedTask.category?.color || '#6B7280' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedTask.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">#{selectedTask.runNumber}</p>
                  <div className="mt-2">
                    {getSubmissionBadge(selectedTask.submissionStatus)}
                  </div>
                </div>
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Category</label>
                  <p className="text-gray-900 font-medium">{selectedTask.category?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</label>
                  <p className="text-gray-900 font-medium">{selectedTask.location?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Submitted By</label>
                  <p className="text-gray-900 font-medium">{selectedTask.assignee?.name || selectedTask.submitter?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Submitted At</label>
                  <p className="text-gray-900 font-medium">{formatDate(selectedTask.submittedAt)}</p>
                </div>
              </div>

              {/* Photo */}
              {selectedTask.submissionPhoto && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submitted Photo</label>
                  <img 
                    src={selectedTask.submissionPhoto} 
                    alt="Submission" 
                    className="w-full rounded-xl border border-gray-200 max-h-80 object-cover"
                  />
                </div>
              )}

              {/* Remarks */}
              {selectedTask.submissionRemarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <p className="text-gray-700 p-4 bg-gray-50 rounded-xl">{selectedTask.submissionRemarks}</p>
                </div>
              )}

              {/* Skip Reason */}
              {selectedTask.skipReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skip Reason</label>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-800">{selectedTask.skipReason}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openApproveModal(selectedTask);
                  }}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Task
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openRejectModal(selectedTask);
                  }}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${needsRiskAcceptance(selectedTask) ? 'bg-amber-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {needsRiskAcceptance(selectedTask) ? (
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                  ) : (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {needsRiskAcceptance(selectedTask) ? 'Approve with Caution' : 'Approve Task'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {needsRiskAcceptance(selectedTask) 
                    ? 'This task requires risk acknowledgment before approval'
                    : 'Are you sure you want to approve this task?'}
                </p>
              </div>

              {/* Task Info */}
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${selectedTask.category?.color || '#6B7280'}20` }}
                  >
                    <Tag className="w-5 h-5" style={{ color: selectedTask.category?.color || '#6B7280' }} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedTask.title}</p>
                    <p className="text-sm text-gray-500">#{selectedTask.runNumber}</p>
                    <div className="mt-2">
                      {getSubmissionBadge(selectedTask.submissionStatus)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk Acceptance for Issue/Skipped tasks */}
              {needsRiskAcceptance(selectedTask) && (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 mb-1">
                          {selectedTask.submissionStatus === SUBMISSION_STATUS.ISSUE 
                            ? 'Issue Reported' 
                            : 'Task Skipped'}
                        </p>
                        <p className="text-sm text-amber-700">
                          {selectedTask.submissionStatus === SUBMISSION_STATUS.ISSUE 
                            ? 'The technician has reported an issue with this task. By approving, you acknowledge that the issue has been reviewed.'
                            : 'This task was skipped by the technician. By approving, you acknowledge that the skip reason has been reviewed.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(selectedTask.submissionRemarks || selectedTask.skipReason) && (
                    <div className="p-3 bg-gray-50 rounded-xl mb-4">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                        {selectedTask.submissionStatus === SUBMISSION_STATUS.ISSUE ? 'Issue Details' : 'Skip Reason'}
                      </p>
                      <p className="text-sm text-gray-700">
                        {selectedTask.submissionRemarks || selectedTask.skipReason}
                      </p>
                    </div>
                  )}

                  <label className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl cursor-pointer hover:bg-red-100 transition-colors mb-4">
                    <input
                      type="checkbox"
                      checked={riskAccepted}
                      onChange={(e) => setRiskAccepted(e.target.checked)}
                      className="mt-0.5 w-5 h-5 text-red-600 border-red-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <p className="font-semibold text-red-800">I Accept the Risk</p>
                      <p className="text-sm text-red-700 mt-1">
                        I have reviewed this submission and accept full responsibility for approving this {selectedTask.submissionStatus === SUBMISSION_STATUS.ISSUE ? 'issue report' : 'skipped task'}.
                      </p>
                    </div>
                  </label>
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedTask(null);
                    setRiskAccepted(false);
                  }}
                  className="flex-1 btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    needsRiskAcceptance(selectedTask) 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                  disabled={actionLoading || (needsRiskAcceptance(selectedTask) && !riskAccepted)}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {needsRiskAcceptance(selectedTask) ? 'Approve with Risk' : 'Confirm Approve'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve All Confirmation Modal */}
      {showApproveAllModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCheck className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Approve All Completed Tasks</h3>
                <p className="text-gray-500 text-sm">
                  This will approve all tasks that were completed normally
                </p>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-green-700">Tasks to approve</span>
                  </div>
                  <span className="font-bold text-green-700 text-lg">{normalCount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveAllModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={approveAllLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveAll}
                  className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={approveAllLoading}
                >
                  {approveAllLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      Approve All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Reject Task</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedTask(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleReject} className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900">{selectedTask.title}</p>
                <p className="text-sm text-gray-500">#{selectedTask.runNumber}</p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    Rejecting this task will return it to the task pool with a new due date for reassignment.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={rejectForm.newDueDate}
                  onChange={(e) => setRejectForm({ ...rejectForm, newDueDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectForm.reason}
                  onChange={(e) => setRejectForm({ ...rejectForm, reason: e.target.value })}
                  placeholder="Enter reason for rejection (recommended)"
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedTask(null);
                  }}
                  className="flex-1 btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;