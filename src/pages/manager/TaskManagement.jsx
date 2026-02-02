import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter,
  Calendar,
  MapPin,
  Tag,
  Edit2,
  Trash2,
  MoreVertical,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import useTaskStore from '../../store/taskStore';
import useAuthStore from '../../store/authStore';
import { TASK_STATUS, STATUS_LABELS } from '../../data/constants';

const TaskManagement = () => {
  const { user } = useAuthStore();
  const { 
    tasks, 
    categories, 
    locations, 
    isLoading,
    error,
    fetchTasks,
    createTask,
    bulkCreateTasks,
    updateTask,
    deleteTask,
    clearError
  } = useTaskStore();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    locationId: '',
    dueDate: ''
  });

  // Bulk form state
  const [bulkForm, setBulkForm] = useState({
    categoryId: '',
    locationId: '',
    startDate: '',
    endDate: '',
    taskTemplate: ''
  });

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || task.categoryId === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      [TASK_STATUS.OPEN]: 'bg-blue-100 text-blue-700',
      [TASK_STATUS.IN_PROGRESS]: 'bg-yellow-100 text-yellow-700',
      [TASK_STATUS.PENDING_APPROVAL]: 'bg-purple-100 text-purple-700',
      [TASK_STATUS.COMPLETED]: 'bg-green-100 text-green-700',
      [TASK_STATUS.ISSUE]: 'bg-red-100 text-red-700',
      [TASK_STATUS.SKIPPED]: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) throw new Error('Title is required');
      if (!formData.categoryId) throw new Error('Category is required');
      if (!formData.locationId) throw new Error('Location is required');
      if (!formData.dueDate) throw new Error('Due date is required');

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        categoryId: formData.categoryId,
        locationId: formData.locationId,
        dueDate: formData.dueDate,
        createdBy: user.id
      };

      console.log('Submitting task:', taskData);

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        setSuccessMessage('Task updated successfully');
      } else {
        await createTask(taskData);
        setSuccessMessage('Task created successfully');
      }

      handleCloseModal();
    } catch (err) {
      console.error('Form error:', err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle bulk create
  const handleBulkCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      if (!bulkForm.categoryId) throw new Error('Category is required');
      if (!bulkForm.locationId) throw new Error('Location is required');
      if (!bulkForm.startDate) throw new Error('Start date is required');
      if (!bulkForm.endDate) throw new Error('End date is required');
      if (!bulkForm.taskTemplate.trim()) throw new Error('Task template is required');

      const start = new Date(bulkForm.startDate);
      const end = new Date(bulkForm.endDate);
      
      if (start > end) throw new Error('End date must be after start date');

      const tasksToCreate = [];
      const currentDate = new Date(start);

      while (currentDate <= end) {
        tasksToCreate.push({
          title: `${bulkForm.taskTemplate} - ${currentDate.toLocaleDateString('en-GB')}`,
          description: null,
          categoryId: bulkForm.categoryId,
          locationId: bulkForm.locationId,
          dueDate: currentDate.toISOString().split('T')[0],
          createdBy: user.id
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('Creating bulk tasks:', tasksToCreate.length);

      await bulkCreateTasks(tasksToCreate);
      setSuccessMessage(`${tasksToCreate.length} tasks created successfully`);
      setShowBulkModal(false);
      setBulkForm({
        categoryId: '',
        locationId: '',
        startDate: '',
        endDate: '',
        taskTemplate: ''
      });
    } catch (err) {
      console.error('Bulk create error:', err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (taskId) => {
    setFormLoading(true);
    try {
      await deleteTask(taskId);
      setSuccessMessage('Task deleted successfully');
      setShowDeleteConfirm(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Open modal for edit
  const handleEdit = (task) => {
    // SECURITY: Prevent opening edit modal if task is completed
    if (task.status === TASK_STATUS.COMPLETED) return;

    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      categoryId: task.categoryId,
      locationId: task.locationId,
      dueDate: task.dueDate
    });
    setFormError('');
    setShowModal(true);
    setActionMenu(null);
  };

  // Open modal for new task
  const handleAddNew = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      categoryId: categories[0]?.id || '',
      locationId: locations[0]?.id || '',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormError('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">Create and manage maintenance tasks</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBulkModal(true)} 
            className="btn-secondary"
          >
            <Calendar className="w-5 h-5" />
            Bulk Create
          </button>
          <button onClick={handleAddNew} className="btn-primary">
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-green-700 font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No tasks found</p>
            <button onClick={handleAddNew} className="mt-4 text-primary-600 font-medium hover:underline">
              Create your first task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Task</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Location</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Due Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500">#{task.runNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: task.category?.color || '#6B7280' }}
                        />
                        <span className="text-sm text-gray-600">
                          {task.category?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {task.location?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{formatDate(task.dueDate)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {STATUS_LABELS[task.status] || task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenu(actionMenu === task.id ? null : task.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>

                          {actionMenu === task.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                                {/* Only show Edit if NOT completed */}
                                {task.status !== TASK_STATUS.COMPLETED && (
                                  <button
                                    onClick={() => handleEdit(task)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Task
                                  </button>
                                )}
                                
                                {task.status === TASK_STATUS.OPEN && (
                                  <button
                                    onClick={() => {
                                      setShowDeleteConfirm(task.id);
                                      setActionMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Task
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  className="input"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description (optional)"
                  rows={3}
                  className="input resize-none"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location *
                  </label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  >
                    <option value="">Select location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input"
                  disabled={formLoading}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingTask ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingTask ? 'Update Task' : 'Create Task'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Create Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg animate-fade-in">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Bulk Create Tasks</h2>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <form onSubmit={handleBulkCreate} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Task Template *
                </label>
                <input
                  type="text"
                  value={bulkForm.taskTemplate}
                  onChange={(e) => setBulkForm({ ...bulkForm, taskTemplate: e.target.value })}
                  placeholder="e.g., Daily HVAC Check"
                  className="input"
                  disabled={formLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Date will be appended to the title</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={bulkForm.categoryId}
                    onChange={(e) => setBulkForm({ ...bulkForm, categoryId: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location *
                  </label>
                  <select
                    value={bulkForm.locationId}
                    onChange={(e) => setBulkForm({ ...bulkForm, locationId: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  >
                    <option value="">Select location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={bulkForm.startDate}
                    onChange={(e) => setBulkForm({ ...bulkForm, startDate: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={bulkForm.endDate}
                    onChange={(e) => setBulkForm({ ...bulkForm, endDate: e.target.value })}
                    className="input"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Tasks'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-sm p-6 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-secondary"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;