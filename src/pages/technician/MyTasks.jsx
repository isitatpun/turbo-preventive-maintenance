import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  Calendar,
  Tag,
  SkipForward,
  Loader2,
  Hand,
  RefreshCw,
  ListTodo,
  CalendarDays,
  TrendingUp,
  Target,
  Award,
  Zap,
  Camera,
  X
} from 'lucide-react';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import { TASK_STATUS } from '../../data/constants';

const MyTasks = () => {
  const { user } = useAuthStore();
  const { 
    tasks, 
    isLoading, 
    fetchTasks,
    claimTask,
    unclaimTask,
    submitTask 
  } = useTaskStore();

  // Filter state - default is 'all'
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' or 'today'
  
  // View state
  const [activeTab, setActiveTab] = useState('my-tasks'); // 'my-tasks' or 'pool'
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showClaimConfirm, setShowClaimConfirm] = useState(null);
  const [showUnclaimConfirm, setShowUnclaimConfirm] = useState(null);
  
  // Form states
  const [submitType, setSubmitType] = useState(null); // 'normal', 'issue', 'skipped'
  const [submitForm, setSubmitForm] = useState({
    photo: null,
    photoPreview: null,
    remarks: '',
    skipReason: ''
  });
  
  // Loading states
  const [actionLoading, setActionLoading] = useState(false);
  
  // Messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalError, setModalError] = useState('');

  // Get today's date string
  const today = new Date().toISOString().split('T')[0];

  // Period view state
  const [viewPeriod, setViewPeriod] = useState('weekly'); // 'weekly' | 'monthly' | 'yearly'

  // Period date range helpers
  const getPeriodRange = () => {
    const now = new Date();
    if (viewPeriod === 'weekly') {
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    }
    if (viewPeriod === 'monthly') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      };
    }
    // yearly
    return {
      start: `${now.getFullYear()}-01-01`,
      end: `${now.getFullYear()}-12-31`
    };
  };

  const periodRange = getPeriodRange();

  // Period label for display
  const formatPeriodLabel = () => {
    const now = new Date();
    if (viewPeriod === 'weekly') {
      const { start, end } = periodRange;
      const s = new Date(start);
      const e = new Date(end);
      return `${s.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${e.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    if (viewPeriod === 'monthly') {
      return now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }
    return `Year ${now.getFullYear()}`;
  };

  // Filter my tasks (assigned to me and in progress)
  const myTasks = tasks.filter(t =>
    t.assigneeId === user?.id &&
    (t.status === TASK_STATUS.IN_PROGRESS || t.status === TASK_STATUS.PENDING_APPROVAL)
  );

  // Filter my tasks by date filter
  const filteredMyTasks = taskFilter === 'today'
    ? myTasks.filter(t => t.dueDate === today)
    : myTasks;

  // Pool tasks (open tasks available for claiming — includes overdue)
  const poolTasks = tasks.filter(t =>
    t.status === TASK_STATUS.OPEN &&
    !t.assigneeId
  );

  // Today's pool tasks
  const todayPoolTasks = poolTasks.filter(t => t.dueDate === today);

  // Period stats (scoped to selected period)
  const periodTasks = tasks.filter(t => {
    const taskDate = t.dueDate;
    const isMyTask = t.assigneeId === user?.id || t.submittedBy === user?.id;
    return isMyTask && taskDate >= periodRange.start && taskDate <= periodRange.end;
  });

  const periodStats = {
    total: periodTasks.length,
    completed: periodTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
    inProgress: periodTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
    pending: periodTasks.filter(t => t.status === TASK_STATUS.PENDING_APPROVAL).length,
    issues: periodTasks.filter(t => t.status === TASK_STATUS.ISSUE).length,
    skipped: periodTasks.filter(t => t.status === TASK_STATUS.SKIPPED).length
  };

  const periodCompletionRate = periodStats.total > 0
    ? Math.round(((periodStats.completed + periodStats.pending) / periodStats.total) * 100)
    : 0;

  const weeklyStats = periodStats;
  const weeklyCompletionRate = periodCompletionRate;

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
    const date = new Date(dateStr);
    const isToday = dateStr === today;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = dateStr === tomorrow.toISOString().split('T')[0];
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };


  // Handle claim task
  const handleClaim = async (taskId) => {
    setActionLoading(true);
    try {
      await claimTask(taskId, user.id);
      setSuccessMessage('Task claimed successfully! It\'s now in your task list.');
      setShowClaimConfirm(null);
      setActiveTab('my-tasks');
    } catch (error) {
      console.error('Claim error:', error);
      setErrorMessage('Failed to claim task: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle unclaim task
  const handleUnclaim = async (taskId) => {
    setActionLoading(true);
    try {
      await unclaimTask(taskId);
      setSuccessMessage('Task returned to pool successfully.');
      setShowUnclaimConfirm(null);
    } catch (error) {
      console.error('Unclaim error:', error);
      setErrorMessage('Failed to return task: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubmitForm(prev => ({
          ...prev,
          photo: file,
          photoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setSubmitForm(prev => ({
      ...prev,
      photo: null,
      photoPreview: null
    }));
  };

  // Open submit modal
  const openSubmitModal = (task, type) => {
    setSelectedTask(task);
    setSubmitType(type);
    setSubmitForm({
      photo: null,
      photoPreview: null,
      remarks: '',
      skipReason: ''
    });
    setShowSubmitModal(true);
  };

  // Handle submit
  const closeSubmitModal = () => {
    setShowSubmitModal(false);
    setSelectedTask(null);
    setSubmitType(null);
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation based on submit type
    if (submitType === 'normal' || submitType === 'issue') {
      if (!submitForm.photoPreview) {
        setModalError('Please take or upload a photo');
        return;
      }
    }

    if (submitType === 'issue' && !submitForm.remarks.trim()) {
      setModalError('Please describe the issue');
      return;
    }

    if (submitType === 'skipped' && !submitForm.skipReason.trim()) {
      setModalError('Please provide a reason for skipping');
      return;
    }

    setModalError('');
    setActionLoading(true);
    try {
      await submitTask(selectedTask.id, {
        status: submitType,
        photo: submitForm.photoPreview,
        remarks: submitForm.remarks.trim() || null,
        skipReason: submitForm.skipReason.trim() || null,
        userId: user.id
      });

      setSuccessMessage(
        submitType === 'normal' ? 'Task submitted for approval!' :
        submitType === 'issue' ? 'Issue reported and submitted for review!' :
        'Skip request submitted for manager review!'
      );

      closeSubmitModal();
    } catch (error) {
      console.error('Submit error:', error);
      setModalError('Failed to submit: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      [TASK_STATUS.OPEN]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Open' },
      [TASK_STATUS.IN_PROGRESS]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
      [TASK_STATUS.PENDING_APPROVAL]: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Pending Approval' },
      [TASK_STATUS.COMPLETED]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      [TASK_STATUS.ISSUE]: { bg: 'bg-red-100', text: 'text-red-700', label: 'Issue' },
      [TASK_STATUS.SKIPPED]: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Skipped' }
    };
    const badge = badges[status] || badges[TASK_STATUS.OPEN];
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  // Check if task is overdue
  const isOverdue = (task) => {
    return task.dueDate < today && 
           (task.status === TASK_STATUS.OPEN || task.status === TASK_STATUS.IN_PROGRESS);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 mt-1">Manage your assigned tasks and claim new ones</p>
        </div>
        <button
          onClick={() => fetchTasks()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-green-700 font-medium">{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage('')}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 font-medium">{errorMessage}</span>
          <button 
            onClick={() => setErrorMessage('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- NEW LIGHT & CLEAN WEEKLY PROGRESS SECTION --- */}
      {/* Removed the heavy solid blue background and replaced with clean white card */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-xl isolate">
        
        {/* Subtle decorative background blobs to keep it interesting but clean */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-50/50 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <div className="relative p-8">
          {/* Header & Big Metric */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-full bg-[#fa4786]/10 border border-[#fa4786]/20">
                  <TrendingUp className="w-4 h-4 text-[#fa4786]" />
                </div>
                <span className="text-[#fa4786] font-bold text-xs tracking-wider uppercase">Your Progress</span>
              </div>
              {/* Period toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl mb-3">
                {['weekly', 'monthly', 'yearly'].map(p => (
                  <button
                    key={p}
                    onClick={() => setViewPeriod(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                      viewPeriod === p
                        ? 'bg-white text-[#002D72] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-sm">{formatPeriodLabel()}</p>
            </div>

            <div className="flex items-baseline gap-1 text-[#002D72]">
              <span className="text-6xl font-bold tracking-tighter leading-none">
                {weeklyCompletionRate}
              </span>
              <span className="text-xl font-medium text-gray-400">%</span>
            </div>
          </div>
          
          {/* Progress Bar - Pink on Light Grey */}
          <div className="mb-8">
            <div className="h-5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-100">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_2px_10px_rgba(250,71,134,0.3)]"
                style={{ 
                  width: `${weeklyCompletionRate}%`,
                  background: 'linear-gradient(90deg, #fa4786 0%, #ff7ea8 100%)' 
                }}
              />
            </div>
          </div>

          {/* Clean Stats Grid - Dark Text */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-y-6 gap-x-4 border-t border-gray-100 pt-6">
            
            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.total}</p>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Done</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.completed}</p>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.inProgress}</p>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.pending}</p>
            </div>

            <div className="group">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Issues</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{weeklyStats.issues + weeklyStats.skipped}</p>
            </div>

          </div>
        </div>
      </div>
      {/* --- END BEAUTIFIED SECTION --- */}

      {/* Tab Navigation - FIXED BUG HERE (Number visibility) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('my-tasks')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'my-tasks'
                ? 'text-white shadow-md' // Active state text
                : 'text-gray-600 hover:bg-gray-50' // Inactive state text
            }`}
            style={activeTab === 'my-tasks' ? { backgroundColor: '#002D72' } : {}}
          >
            <ListTodo className="w-5 h-5" />
            My Tasks
            {/* FIXED: When active, badge is White bg with Blue text. When inactive, Light bg with dark text. */}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'my-tasks' 
                ? 'bg-white text-[#002D72]' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {myTasks.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('pool')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'pool'
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={activeTab === 'pool' ? { backgroundColor: '#002D72' } : {}}
          >
            <Hand className="w-5 h-5" />
            Task Pool
            {/* FIXED: Same fix applied here for the pool count */}
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'pool' 
                ? 'bg-white text-[#002D72]' 
                : 'bg-blue-50 text-[#002D72]'
            }`}>
              {poolTasks.length}
            </span>
          </button>
        </div>
      </div>

      {/* My Tasks Section */}
      {activeTab === 'my-tasks' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Header with Filter */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">Assigned Tasks</h2>
              
              {/* Task Filter Buttons */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    taskFilter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListTodo className="w-4 h-4" />
                  All Tasks
                </button>
                <button
                  onClick={() => setTaskFilter('today')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    taskFilter === 'today'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CalendarDays className="w-4 h-4" />
                  Today
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : filteredMyTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                {taskFilter === 'today' ? 'No tasks for today' : 'No assigned tasks'}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {taskFilter === 'today' 
                  ? 'Check "All Tasks" or claim new tasks from the pool'
                  : 'Claim tasks from the pool to get started'}
              </p>
              {taskFilter === 'today' ? (
                <button 
                  onClick={() => setTaskFilter('all')}
                  className="text-primary-600 font-medium hover:underline text-sm"
                >
                  View all tasks
                </button>
              ) : (
                <button 
                  onClick={() => setActiveTab('pool')}
                  className="text-primary-600 font-medium hover:underline text-sm"
                >
                  Browse task pool
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredMyTasks.map((task) => (
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
                            {getStatusBadge(task.status)}
                            {isOverdue(task) && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">#{task.runNumber}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {task.location?.name || 'Unknown'}
                            </div>
                            <div className={`flex items-center gap-1 ${isOverdue(task) ? 'text-red-600 font-medium' : ''}`}>
                              <Calendar className="w-4 h-4" />
                              {formatDate(task.dueDate)}
                            </div>
                          </div>

                          {/* Task description if available */}
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 lg:ml-4 flex-shrink-0">
                      {task.status === TASK_STATUS.IN_PROGRESS && (
                        <>
                          {/* Complete Button */}
                          <button
                            onClick={() => openSubmitModal(task, 'normal')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </button>
                          
                          {/* Report Issue Button */}
                          <button
                            onClick={() => openSubmitModal(task, 'issue')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            Issue
                          </button>
                          
                          {/* Skip Button */}
                          <button
                            onClick={() => openSubmitModal(task, 'skipped')}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                          >
                            <SkipForward className="w-4 h-4" />
                            Skip
                          </button>
                          
                          {/* Return to Pool Button */}
                          <button
                            onClick={() => setShowUnclaimConfirm(task.id)}
                            className="flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Return to pool"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {task.status === TASK_STATUS.PENDING_APPROVAL && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium text-sm">Awaiting Approval</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task Pool Section */}
      {activeTab === 'pool' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Available Tasks</h2>
                <p className="text-sm text-gray-500 mt-0.5">Claim tasks to add them to your list</p>
              </div>
              {todayPoolTasks.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  <CalendarDays className="w-4 h-4" />
                  {todayPoolTasks.length} due today
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : poolTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-900 font-medium mb-1">Pool is empty!</p>
              <p className="text-gray-500 text-sm">All tasks have been claimed. Great job team!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {poolTasks.map((task) => (
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
                            {task.dueDate === today && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Due Today
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">#{task.runNumber}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {task.category?.name || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {task.location?.name || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(task.dueDate)}
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Claim Button */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => setShowClaimConfirm(task.id)}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium disabled:opacity-50"
                      >
                        <Hand className="w-4 h-4" />
                        Claim Task
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Claim Confirmation Modal */}
      {showClaimConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm animate-fade-in">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hand className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Claim This Task?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  This task will be assigned to you and moved to your task list.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowClaimConfirm(null)}
                  className="flex-1 btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClaim(showClaimConfirm)}
                  className="flex-1 btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Hand className="w-4 h-4" />
                      Claim Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Unclaim Confirmation Modal */}
      {showUnclaimConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm animate-fade-in">
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Return to Pool?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  This task will be unassigned and returned to the task pool for others to claim.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUnclaimConfirm(null)}
                  className="flex-1 btn-secondary"
                  disabled={actionLoading}
                >
                  Keep Task
                </button>
                <button
                  onClick={() => handleUnclaim(showUnclaimConfirm)}
                  className="flex-1 px-4 py-2.5 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Returning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Return to Pool
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Submit Task Modal */}
      {showSubmitModal && selectedTask && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    submitType === 'normal' ? 'bg-green-100' :
                    submitType === 'issue' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {submitType === 'normal' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {submitType === 'issue' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    {submitType === 'skipped' && <SkipForward className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {submitType === 'normal' && 'Complete Task'}
                      {submitType === 'issue' && 'Report Issue'}
                      {submitType === 'skipped' && 'Skip Task'}
                    </h2>
                    <p className="text-sm text-gray-500">#{selectedTask.runNumber}</p>
                  </div>
                </div>
                <button
                  onClick={closeSubmitModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Task Info */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium text-gray-900">{selectedTask.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedTask.location?.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedTask.dueDate)}
                  </div>
                </div>
              </div>

              {/* Photo Upload (for normal and issue) */}
              {(submitType === 'normal' || submitType === 'issue') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Evidence <span className="text-red-500">*</span>
                  </label>
                  
                  {submitForm.photoPreview ? (
                    <div className="relative">
                      <img 
                        src={submitForm.photoPreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors">
                      <div className="text-center">
                        <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload photo</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              {/* Remarks (for normal and issue) */}
              {(submitType === 'normal' || submitType === 'issue') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {submitType === 'issue' ? 'Issue Description' : 'Remarks'} 
                    {submitType === 'issue' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={submitForm.remarks}
                    onChange={(e) => setSubmitForm(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder={submitType === 'issue' ? 'Describe the issue in detail...' : 'Add any notes (optional)'}
                    rows={3}
                    className="input resize-none"
                    required={submitType === 'issue'}
                  />
                </div>
              )}

              {/* Skip Reason */}
              {submitType === 'skipped' && (
                <>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Skip Request</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your skip request will be submitted to the manager for review. The manager will set a new due date for reassignment or return the task to the pool.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Reason for Skipping <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={submitForm.skipReason}
                      onChange={(e) => setSubmitForm(prev => ({ ...prev, skipReason: e.target.value }))}
                      placeholder="Explain why you need to skip this task..."
                      rows={3}
                      className="input resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Please provide a clear reason. This will be reviewed by your manager.
                    </p>
                  </div>
                </>
              )}

              {/* Modal Error */}
              {modalError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {modalError}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeSubmitModal}
                  className="flex-1 btn-secondary"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2.5 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 ${
                    submitType === 'normal' ? 'bg-green-500 hover:bg-green-600' :
                    submitType === 'issue' ? 'bg-red-500 hover:bg-red-600' :
                    'bg-gray-500 hover:bg-gray-600'
                  }`}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      {submitType === 'normal' && <CheckCircle className="w-4 h-4" />}
                      {submitType === 'issue' && <AlertTriangle className="w-4 h-4" />}
                      {submitType === 'skipped' && <SkipForward className="w-4 h-4" />}
                      {submitType === 'normal' && 'Submit Completion'}
                      {submitType === 'issue' && 'Report Issue'}
                      {submitType === 'skipped' && 'Submit Skip Request'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MyTasks;