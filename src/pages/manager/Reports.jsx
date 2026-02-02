import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  Download,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  startOfYear,
  endOfYear,
  eachDayOfInterval, 
  eachMonthOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  isWithinInterval
} from 'date-fns';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useTaskStore from '../../store/taskStore';
import useUserStore from '../../store/userStore';
import { TASK_STATUS } from '../../data/constants';

const Reports = () => {
  const { tasks, categories, locations } = useTaskStore();
  const { users, getTechnicians } = useUserStore();
  
  // View mode: 'monthly' or 'yearly'
  const [viewMode, setViewMode] = useState('monthly');
  
  // For monthly view: specific month/year
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  // For yearly view: specific year
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  const technicians = getTechnicians();

  // Generate month options (Jan 2026 to next month of current date)
  const monthOptions = useMemo(() => {
    const options = [];
    const start = new Date(2026, 0, 1); // January 2026
    const end = addMonths(new Date(), 1); // Next month from now
    
    let current = new Date(start);
    while (current <= end) {
      options.push({
        value: format(current, 'yyyy-MM'),
        label: format(current, 'MMMM yyyy')
      });
      current = addMonths(current, 1);
    }
    return options;
  }, []);

  // Generate year options (2026 to year of next month)
  const yearOptions = useMemo(() => {
    const options = [];
    const startYear = 2026;
    const endYear = addMonths(new Date(), 1).getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      options.push({
        value: year.toString(),
        label: year.toString()
      });
    }
    return options;
  }, []);

  // Get date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const start = new Date(year, month - 1, 1);
      const end = endOfMonth(start);
      return { start, end };
    } else {
      const year = parseInt(selectedYear);
      const start = startOfYear(new Date(year, 0, 1));
      const end = endOfYear(new Date(year, 0, 1));
      return { start, end };
    }
  }, [viewMode, selectedMonth, selectedYear]);

  // Filter tasks by date range
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskDate = task.approvedAt ? parseISO(task.approvedAt) : 
                       task.submittedAt ? parseISO(task.submittedAt) : 
                       parseISO(task.createdAt);
      return isWithinInterval(taskDate, { start: dateRange.start, end: dateRange.end });
    });
  }, [tasks, dateRange]);

  // Overall Stats (filtered)
  const overallStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const issues = filteredTasks.filter(t => t.status === TASK_STATUS.ISSUE).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, issues, completionRate };
  }, [filteredTasks]);

  // Stats by Category (filtered)
  const categoryStats = useMemo(() => {
    return categories.map(cat => {
      const catTasks = filteredTasks.filter(t => t.categoryId === cat.id);
      const completed = catTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const total = catTasks.length;
      
      return {
        ...cat,
        total,
        completed,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredTasks, categories]);

  // Stats by Technician (filtered)
  const technicianStats = useMemo(() => {
    return technicians.map(tech => {
      const techTasks = filteredTasks.filter(t => t.submittedBy === tech.id || t.assigneeId === tech.id);
      const completed = techTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      const issues = techTasks.filter(t => t.status === TASK_STATUS.ISSUE).length;
      const skipped = techTasks.filter(t => t.status === TASK_STATUS.SKIPPED).length;

      return {
        ...tech,
        completed,
        issues,
        skipped,
        total: completed + issues + skipped
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredTasks, technicians]);

  // Stats by Location (filtered)
  const locationStats = useMemo(() => {
    return locations.map(loc => {
      const locTasks = filteredTasks.filter(t => t.locationId === loc.id);
      const completed = locTasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
      
      return {
        ...loc,
        total: locTasks.length,
        completed
      };
    }).sort((a, b) => b.total - a.total);
  }, [filteredTasks, locations]);

  // Trend data
  const trendData = useMemo(() => {
    if (viewMode === 'monthly') {
      // Daily data for monthly view
      const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
      return days.map(day => {
        const dayTasks = tasks.filter(t => {
          if (!t.approvedAt) return false;
          return isSameDay(parseISO(t.approvedAt), day);
        });
        return { date: day, count: dayTasks.length, label: format(day, 'd') };
      });
    } else {
      // Monthly data for yearly view
      const months = eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });
      return months.map(month => {
        const monthTasks = tasks.filter(t => {
          if (!t.approvedAt) return false;
          return isSameMonth(parseISO(t.approvedAt), month);
        });
        return { date: month, count: monthTasks.length, label: format(month, 'MMM') };
      });
    }
  }, [tasks, dateRange, viewMode]);

  const maxTrendCount = Math.max(...trendData.map(d => d.count), 1);

  const handleExport = () => {
    const headers = ['Task', 'Category', 'Location', 'Status', 'Due Date', 'Submitted By', 'Submitted At'];
    const rows = filteredTasks.map(task => [
      task.title,
      categories.find(c => c.id === task.categoryId)?.name || '',
      locations.find(l => l.id === task.locationId)?.name || '',
      task.status,
      task.dueDate,
      users.find(u => u.id === task.submittedBy)?.name || '',
      task.submittedAt || ''
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pm-report-${viewMode === 'monthly' ? selectedMonth : selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 font-normal text-sm mt-1">Insights and performance metrics</p>
        </div>
        <Button variant="outline" icon={Download} onClick={handleExport}>
          Export Report
        </Button>
      </div>

      {/* Global Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">View:</span>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === 'yearly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Date Selector */}
          {viewMode === 'monthly' ? (
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                {yearOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500" />
            </div>
          )}

          <div className="ml-auto text-sm text-gray-500 font-normal">
            Showing data for <span className="font-medium text-gray-900">
              {viewMode === 'monthly' 
                ? format(new Date(selectedMonth + '-01'), 'MMMM yyyy')
                : selectedYear
              }
            </span>
          </div>
        </div>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-normal mb-1">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{overallStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-normal mb-1">Completed</p>
              <p className="text-2xl font-semibold text-emerald-600">{overallStats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-normal mb-1">Issues</p>
              <p className="text-2xl font-semibold text-red-600">{overallStats.issues}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-normal mb-1">Completion Rate</p>
              <p className="text-2xl font-semibold text-primary-600">{overallStats.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
       {/* Trend Chart */}
        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            {viewMode === 'monthly' ? 'Daily Completions' : 'Monthly Completions'}
          </h3>
          
          {/* Container with fixed height and padding. 
            Placing Y-axis labels in a dedicated gutter (pl-10) 
            prevents them from pushing the chart content.
          */}
          <div className="relative h-48 pl-10 pr-4"> 
            
            {/* Y-Axis Grid Lines & Labels */}
            <div className="absolute left-0 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="relative w-full flex items-center h-0">
                  <span className="absolute right-[calc(100%-35px)] text-[10px] text-gray-400 tabular-nums">
                    {Math.round(maxTrendCount * (4 - i) / 4)}
                  </span>
                  <div className={`w-full ml-10 border-b ${i === 4 ? 'border-gray-300' : 'border-dashed border-gray-100'}`} />
                </div>
              ))}
            </div>
            
            {/* Bars Area - Using justify-between and flex-1 for mathematical consistency */}
            <div className="absolute left-10 right-4 top-0 bottom-6 flex items-end justify-between">
              {trendData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full px-[1px]">
                  <div 
                    className="w-full max-w-[14px] bg-primary-500 rounded-t-[2px] transition-all hover:bg-primary-600"
                    style={{ 
                      height: item.count > 0 ? `${Math.max((item.count / maxTrendCount) * 100, 4)}%` : '0%',
                    }}
                    title={`${item.label}: ${item.count} tasks`}
                  />
                </div>
              ))}
            </div>

            {/* X-Axis Labels - Aligned precisely with the bar container */}
            <div className="absolute left-10 right-4 bottom-0 flex justify-between pt-2">
              {trendData.map((item, index) => {
                const day = parseInt(item.label);
                const isLast = index === trendData.length - 1;
                let showLabel = false;

                if (viewMode === 'monthly') {
                  // Standardized intervals
                  if (day === 1 || day === 10 || day === 20 || isLast) showLabel = true;
                } else {
                  if (index === 0 || isLast) showLabel = true;
                }

                return (
                  <div key={index} className="flex-1 flex justify-center">
                    <span className={`text-[10px] text-gray-400 whitespace-nowrap transition-opacity ${showLabel ? 'opacity-100' : 'opacity-0'}`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Tasks by Category</h3>
          <div className="space-y-3">
            {categoryStats.slice(0, 5).map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-normal text-gray-700">{cat.name}</span>
                  <span className="text-sm text-gray-500 font-normal">{cat.total} tasks</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${cat.rate}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            ))}
            {categoryStats.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4 font-normal">No data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Technician Performance */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Technician Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Technician</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Completed</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Issues</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Skipped</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {technicianStats.map(tech => (
                <tr key={tech.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                        {tech.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-normal text-gray-900">{tech.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-medium text-sm">{tech.completed}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-700 font-medium text-sm">{tech.issues}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-medium text-sm">{tech.skipped}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-medium text-gray-900">{tech.total}</span>
                  </td>
                </tr>
              ))}
              {technicianStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 font-normal">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Location Stats */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Tasks by Location</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationStats.map(loc => (
            <div key={loc.id} className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-normal text-gray-900 mb-2">{loc.name}</h4>
              <div className="flex items-center justify-between text-sm font-normal">
                <span className="text-gray-500">{loc.total} total</span>
                <span className="text-emerald-600 font-medium">{loc.completed} completed</span>
              </div>
            </div>
          ))}
          {locationStats.length === 0 && (
            <p className="text-gray-500 text-sm col-span-3 text-center py-4 font-normal">No data available</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;