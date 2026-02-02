import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Image,
  ChevronDown,
  X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import useTaskStore from '../store/taskStore';
import useUserStore from '../store/userStore';
import useAuthStore from '../store/authStore';
import { TASK_STATUS, SUBMISSION_STATUS, PRIORITY_LABELS } from '../data/constants';

const TaskHistory = () => {
  const { user, isManager } = useAuthStore();
  const { tasks, categories, locations } = useTaskStore();
  const { users, getTechnicians } = useUserStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const technicians = getTechnicians();

  // --- FILTERING LOGIC ---
  const historyTasks = useMemo(() => {
    // 1. Basic Status Filter
    let result = tasks.filter(t => 
      [TASK_STATUS.COMPLETED, TASK_STATUS.ISSUE, TASK_STATUS.SKIPPED].includes(t.status)
    );

    // 2. ROLE CHECK: If Technician (not manager), SHOW ONLY THEIR SUBMISSIONS
    // This ensures they cannot see other people's work
    if (!isManager()) {
      result = result.filter(t => t.submittedBy === user?.id);
    }

    // 3. Search Filter
    if (searchTerm) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 4. Dropdown Filters
    if (categoryFilter) {
      result = result.filter(t => t.categoryId === categoryFilter);
    }

    if (locationFilter) {
      result = result.filter(t => t.locationId === locationFilter);
    }

    // Only Managers can filter by technician using the dropdown
    if (isManager() && technicianFilter) {
      result = result.filter(t => t.submittedBy === technicianFilter);
    }

    result.sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt));

    return result;
  }, [tasks, user, isManager, searchTerm, categoryFilter, locationFilter, technicianFilter]);

  // --- STATS LOGIC ---
  // Returns null if not manager, effectively cutting off access to analytics
  const stats = useMemo(() => {
    if (!isManager()) return null;
    
    const completed = historyTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const issues = historyTasks.filter(t => t.status === TASK_STATUS.ISSUE).length;
    const skipped = historyTasks.filter(t => t.status === TASK_STATUS.SKIPPED).length;
    
    const byTechnician = {};
    historyTasks.forEach(task => {
      if (task.submittedBy) {
        if (!byTechnician[task.submittedBy]) {
          byTechnician[task.submittedBy] = { completed: 0, issues: 0, skipped: 0 };
        }
        if (task.status === TASK_STATUS.COMPLETED) byTechnician[task.submittedBy].completed++;
        if (task.status === TASK_STATUS.ISSUE) byTechnician[task.submittedBy].issues++;
        if (task.status === TASK_STATUS.SKIPPED) byTechnician[task.submittedBy].skipped++;
      }
    });

    return { completed, issues, skipped, byTechnician };
  }, [historyTasks, isManager]);

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getCategoryColor = (id) => categories.find(c => c.id === id)?.color || '#6B7280';
  const getLocationName = (id) => locations.find(l => l.id === id)?.name || 'Unknown';
  const getUserName = (id) => users.find(u => u.id === id)?.name || 'Unknown';

  const getStatusIcon = (status) => {
    switch (status) {
      case TASK_STATUS.COMPLETED:
        return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' };
      case TASK_STATUS.ISSUE:
        return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' };
      case TASK_STATUS.SKIPPED:
        return { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-100' };
      default:
        return { icon: CheckCircle, color: 'text-gray-400', bg: 'bg-gray-100' };
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLocationFilter('');
    setTechnicianFilter('');
  };

  const hasActiveFilters = searchTerm || categoryFilter || locationFilter || technicianFilter;
  const activeFilterCount = [categoryFilter, locationFilter, technicianFilter].filter(Boolean).length;

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Task History</h1>
        <p className="text-gray-500 font-normal text-sm mt-1">
          {isManager() ? 'View all completed tasks and submissions' : 'View your completed tasks'}
        </p>
      </div>

      {/* Stats for Manager Only */}
      {isManager() && stats && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-500 font-normal">Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.issues}</p>
                <p className="text-sm text-gray-500 font-normal">Issues</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900">{stats.skipped}</p>
                <p className="text-sm text-gray-500 font-normal">Skipped</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {/* Search Row */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
        
        {/* Filter Pills Row */}
        <div className="p-4 flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`appearance-none pl-4 pr-8 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border-0 ${
                categoryFilter 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <option value="">Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className={`appearance-none pl-4 pr-8 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border-0 ${
                locationFilter 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <option value="">Location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
          </div>

          {/* Technician Filter (Manager Only) */}
          {isManager() && (
            <div className="relative">
              <select
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                className={`appearance-none pl-4 pr-8 py-2 rounded-full text-sm font-medium transition-all cursor-pointer border-0 ${
                  technicianFilter 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <option value="">Technician</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-4 h-4" />
              Clear{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>
          )}

          {/* Results Count */}
          <div className="ml-auto text-sm text-gray-500 font-normal">
            <span className="font-medium text-gray-900">{historyTasks.length}</span> results
          </div>
        </div>
      </div>

      {/* Technician Analysis (Manager Only) */}
      {/* This logic cuts the section completely if user is not manager */}
      {isManager() && stats && Object.keys(stats.byTechnician).length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Submissions by Technician</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(stats.byTechnician).map(([techId, data]) => {
              const total = data.completed + data.issues + data.skipped;
              const techName = getUserName(techId);
              
              return (
                <div key={techId} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                      {techName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{techName}</p>
                      <p className="text-xs text-gray-500 font-normal">{total} total</p>
                    </div>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-200">
                    {data.completed > 0 && (
                      <div className="bg-emerald-500 h-full" style={{ width: `${(data.completed / total) * 100}%` }} />
                    )}
                    {data.issues > 0 && (
                      <div className="bg-red-500 h-full" style={{ width: `${(data.issues / total) * 100}%` }} />
                    )}
                    {data.skipped > 0 && (
                      <div className="bg-gray-400 h-full" style={{ width: `${(data.skipped / total) * 100}%` }} />
                    )}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500 font-normal">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />{data.completed}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />{data.issues}
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />{data.skipped}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* History List */}
      {historyTasks.length > 0 ? (
        <div className="space-y-3">
          {historyTasks.map(task => {
            const statusInfo = getStatusIcon(task.status);
            const StatusIcon = statusInfo.icon;
            const submitter = users.find(u => u.id === task.submittedBy);

            return (
              <Card 
                key={task.id}
                className="p-4 cursor-pointer hover:shadow-md hover:border-gray-200 transition-all"
                onClick={() => {
                  setSelectedTask(task);
                  setShowDetailModal(true);
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${statusInfo.bg} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <span 
                          className="inline-block px-2 py-0.5 rounded text-xs font-medium mt-1"
                          style={{ 
                            backgroundColor: `${getCategoryColor(task.categoryId)}15`,
                            color: getCategoryColor(task.categoryId)
                          }}
                        >
                          {getCategoryName(task.categoryId)}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 font-normal">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{getLocationName(task.locationId)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(parseISO(task.submittedAt || task.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      {task.submissionPhoto && (
                        <div className="flex items-center gap-1 text-primary-500">
                          <Image className="w-3.5 h-3.5" />
                          <span>Photo</span>
                        </div>
                      )}
                    </div>

                    {isManager() && submitter && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium">
                          {submitter.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-500 font-normal">{submitter.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <History className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="font-medium text-gray-900 mb-1">No history yet</h3>
          <p className="text-gray-500 font-normal">Completed tasks will appear here</p>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        title="Task Details"
        size="lg"
      >
        {selectedTask && (
          <div className="space-y-6">
            {selectedTask.submissionPhoto && (
              <img 
                src={selectedTask.submissionPhoto}
                alt="Submission"
                className="w-full h-64 object-cover rounded-xl"
              />
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge status={selectedTask.status} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedTask.title}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 font-normal">
                <span 
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${getCategoryColor(selectedTask.categoryId)}15`,
                    color: getCategoryColor(selectedTask.categoryId)
                  }}
                >
                  {getCategoryName(selectedTask.categoryId)}
                </span>
                <span>{getLocationName(selectedTask.locationId)}</span>
              </div>
            </div>

            {selectedTask.submissionRemarks && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-medium text-gray-500 mb-1">Remarks</p>
                <p className="text-gray-700 font-normal">{selectedTask.submissionRemarks}</p>
              </div>
            )}

            {selectedTask.skipReason && (
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="text-sm font-medium text-amber-700 mb-1">Skip Reason</p>
                <p className="text-amber-800 font-normal">{selectedTask.skipReason}</p>
              </div>
            )}

            {isManager() && selectedTask.submittedBy && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  {getUserName(selectedTask.submittedBy).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{getUserName(selectedTask.submittedBy)}</p>
                  <p className="text-sm text-gray-500 font-normal">Submitted this task</p>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
              {selectedTask.submittedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500 font-normal">Submitted</span>
                  <span className="text-gray-900">{format(parseISO(selectedTask.submittedAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              )}
              {selectedTask.approvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500 font-normal">Approved</span>
                  <span className="text-gray-900">{format(parseISO(selectedTask.approvedAt), 'MMM d, yyyy HH:mm')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskHistory;