import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  ArrowRight,
  Filter,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO, isToday, getYear, addMonths, differenceInDays, isAfter, isBefore } from 'date-fns';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import useTaskStore from '../store/taskStore';
import useUserStore from '../store/userStore';
import useAuthStore from '../store/authStore';
import useContractStore from '../store/contractStore';
import { TASK_STATUS } from '../data/constants';

const Dashboard = () => {
  const { user, isManager, isTechnician } = useAuthStore();
  const { tasks, categories, locations } = useTaskStore();
  const { users } = useUserStore();
  const { contracts } = useContractStore();

  // 1. Year Filter State (Defaults to current year)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 2. Calculate Year Options (Start 2026 -> Year of Next Month)
  const yearOptions = useMemo(() => {
    const nextMonthDate = addMonths(new Date(), 1);
    const endYear = getYear(nextMonthDate);
    const startYear = 2026;
    
    const years = [];
    // Ensure the loop works even if current year is before 2026 (safety check), 
    // otherwise strictly follows "start from 2026"
    const loopEnd = Math.max(endYear, startYear); 
    
    for (let i = startYear; i <= loopEnd; i++) {
      years.push(i);
    }
    
    // If the default current year isn't in the range (e.g. it is 2025), add it to prevent UI errors
    if (!years.includes(selectedYear) && selectedYear >= startYear) {
      years.push(selectedYear);
      years.sort((a, b) => a - b);
    }
    
    return years;
  }, [selectedYear]);

  // 3. Filter Tasks by Selected Year
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.dueDate) return false;
      return getYear(parseISO(t.dueDate)) === selectedYear;
    });
  }, [tasks, selectedYear]);

  // Stats calculation (Updated to use filteredTasks)
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use filteredTasks instead of tasks
    if (isManager()) {
      return {
        totalTasks: filteredTasks.length,
        openTasks: filteredTasks.filter(t => t.status === TASK_STATUS.OPEN).length,
        inProgress: filteredTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
        pendingApproval: filteredTasks.filter(t => t.status === TASK_STATUS.PENDING_APPROVAL).length,
        completed: filteredTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
        overdue: filteredTasks.filter(t => {
          const dueDate = new Date(t.dueDate);
          return dueDate < today && ![TASK_STATUS.COMPLETED, TASK_STATUS.SKIPPED].includes(t.status);
        }).length
      };
    } else {
      const userTasks = filteredTasks.filter(t => t.assigneeId === user?.id);
      const poolTasks = filteredTasks.filter(t => t.status === TASK_STATUS.OPEN);
      
      return {
        myTasks: userTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
        todayTasks: userTasks.filter(t => isToday(parseISO(t.dueDate)) && t.status === TASK_STATUS.IN_PROGRESS).length,
        completed: userTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
        poolTasks: poolTasks.length
      };
    }
  }, [filteredTasks, user, isManager]); // Dependency changed from tasks to filteredTasks

  // Recent Tasks (Updated to use filteredTasks)
  const recentTasks = useMemo(() => {
    if (isManager()) {
      return filteredTasks
        .filter(t => t.status === TASK_STATUS.PENDING_APPROVAL)
        .slice(0, 5);
    } else {
      return filteredTasks
        .filter(t => t.assigneeId === user?.id && t.status === TASK_STATUS.IN_PROGRESS)
        .slice(0, 5);
    }
  }, [filteredTasks, user, isManager]); // Dependency changed from tasks to filteredTasks

  // Contracts expiring within 60 days (2 months)
  const expiringContracts = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const threshold = addMonths(now, 2);
    return contracts
      .filter(c => {
        if (c.status !== 'active' || !c.endDate) return false;
        const end = parseISO(c.endDate);
        return isAfter(end, now) && isBefore(end, threshold);
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }, [contracts]);

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Unknown';
  const getCategoryColor = (id) => categories.find(c => c.id === id)?.color || '#6B7280';
  const getLocationName = (id) => locations.find(l => l.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6 page-transition">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Year Filter Dropdown */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer outline-none pr-8"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {isManager() ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-purple-600">{stats.pendingApproval}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">My Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.myTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Today's Tasks</p>
                <p className="text-2xl font-bold text-amber-600">{stats.todayTasks}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Available in Pool</p>
                <p className="text-2xl font-bold text-primary-600">{stats.poolTasks}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Tasks / Pending Approvals */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {isManager() ? 'Pending Approvals' : 'My Active Tasks'}
          </h2>
          <Link 
            to={isManager() ? '/approvals' : '/my-tasks'}
            className="text-sm font-medium text-primary-500 hover:text-primary-600 flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentTasks.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {recentTasks.map(task => (
              <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
                      <Badge status={task.status} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span 
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getCategoryColor(task.categoryId)}15`,
                          color: getCategoryColor(task.categoryId)
                        }}
                      >
                        {getCategoryName(task.categoryId)}
                      </span>
                      <span>{getLocationName(task.locationId)}</span>
                      <span>Due: {format(parseISO(task.dueDate), 'MMM d')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500">
              {isManager() ? 'No pending approvals' : 'No active tasks'}
            </p>
          </div>
        )}
      </Card>

      {/* Expiring Contracts */}
      {expiringContracts.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-semibold text-amber-900">Contracts Expiring Soon</h2>
              <span className="bg-amber-200 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {expiringContracts.length}
              </span>
            </div>
            <Link
              to="/contracts"
              className="text-sm font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {expiringContracts.map(contract => {
              const daysLeft = differenceInDays(parseISO(contract.endDate), new Date());
              return (
                <div key={contract.id} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{contract.supplierName}</p>
                      <p className="text-sm text-gray-500">Expires {format(parseISO(contract.endDate), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
                    daysLeft <= 14
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Quick Actions for Manager */}
      {isManager() && (
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/tasks">
            <Card className="p-5 hover:shadow-md transition-all duration-200 hover:border-primary-200 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                  <ClipboardList className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Tasks</h3>
                  <p className="text-sm text-gray-500">Create and edit tasks</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/users">
            <Card className="p-5 hover:shadow-md transition-all duration-200 hover:border-primary-200 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                  <Users className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-500">View team members</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/reports">
            <Card className="p-5 hover:shadow-md transition-all duration-200 hover:border-primary-200 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                  <TrendingUp className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-500">Analytics & insights</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;