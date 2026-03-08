import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ClipboardList,
  LayoutGrid
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
import Card from '../components/common/Card';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';
import { TASK_STATUS } from '../data/constants';

const Calendar = () => {
  const { user, isTechnician } = useAuthStore();
  const { tasks, categories } = useTaskStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [showYearView, setShowYearView] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // All tasks except technician-rejected requests; role-filtered; category-filtered
  const filteredTasks = useMemo(() => {
    let t = tasks.filter(task => task.status !== TASK_STATUS.REJECTED);
    if (isTechnician()) {
      t = t.filter(task => task.assigneeId === user?.id);
    }
    if (filterCategory !== 'all') {
      t = t.filter(task => task.categoryId === filterCategory);
    }
    return t;
  }, [tasks, user, isTechnician, filterCategory]);

  // Categories that appear in the currently filtered tasks
  const legendCategories = useMemo(() => {
    const ids = new Set(filteredTasks.map(t => t.categoryId).filter(Boolean));
    return categories.filter(c => ids.has(c.id));
  }, [filteredTasks, categories]);

  const getTasksForDate = (date) => {
    return filteredTasks.filter(task =>
      task.dueDate && isSameDay(parseISO(task.dueDate), date)
    );
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const generateMonthDays = (year, monthIndex) => {
    const monthStart = startOfMonth(new Date(year, monthIndex, 1));
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }
    return days;
  };

  const calendarDays = generateMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const getCategoryColor = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.color || '#6B7280';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  // Mini month card used in year view
  const MiniMonth = ({ year, monthIndex }) => {
    const monthDate = new Date(year, monthIndex, 1);
    const days = generateMonthDays(year, monthIndex);

    return (
      <div
        className="bg-white rounded-xl border border-gray-100 p-3 cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all"
        onClick={() => {
          setCurrentMonth(new Date(year, monthIndex, 1));
          setShowYearView(false);
        }}
      >
        <p className="text-xs font-semibold text-gray-700 mb-2 text-center">
          {format(monthDate, 'MMMM')}
        </p>
        <div className="grid grid-cols-7">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-[8px] text-gray-400 font-medium py-0.5">{d}</div>
          ))}
          {days.map((day, idx) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentMon = isSameMonth(day, monthDate);
            const isTodayDate = isToday(day);
            return (
              <div key={idx} className="flex flex-col items-center py-0.5">
                <span className={`text-[9px] leading-none ${!isCurrentMon ? 'text-gray-200' : isTodayDate ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && isCurrentMon && (
                  <div className="flex flex-wrap justify-center gap-px mt-px">
                    {dayTasks.slice(0, 3).map((t, ti) => (
                      <div
                        key={ti}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: getCategoryColor(t.categoryId) }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <CalendarIcon className="w-4 h-4" />
        <span>Schedule</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Year View Toggle */}
          <button
            onClick={() => setShowYearView(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-all ${showYearView ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}
          >
            <LayoutGrid className="w-4 h-4" />
            Year View
          </button>

          {/* Month navigation — only in month view */}
          {!showYearView && (
            <>
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <span className="text-base font-semibold text-primary-500 min-w-[140px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {showYearView ? (
        /* ── Year View ─────────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Year navigation */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setViewYear(y => y - 1)} className="p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-95">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-xl font-bold text-gray-900 min-w-[80px] text-center">{viewYear}</span>
            <button onClick={() => setViewYear(y => y + 1)} className="p-2 rounded-lg hover:bg-gray-100 transition-all active:scale-95">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 12 mini month calendars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 12 }, (_, i) => (
              <MiniMonth key={i} year={viewYear} monthIndex={i} />
            ))}
          </div>

          {/* Category legend */}
          {legendCategories.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-4 items-center">
              <span className="text-xs text-gray-500 font-medium">Categories:</span>
              {legendCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#6B7280' }} />
                  <span className="text-xs text-gray-600">{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── Month View ────────────────────────────────────────────── */
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-400 py-3">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 border-t border-l border-gray-100">
                {calendarDays.map((day, idx) => {
                  const dayTasks = getTasksForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative min-h-[100px] p-2 border-r border-b border-gray-100 text-left transition-all duration-200
                        ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'}
                        ${isSelected ? 'bg-primary-50 ring-2 ring-inset ring-primary-500' : ''}
                      `}
                    >
                      <span className={`
                        text-sm font-medium
                        ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-900'}
                        ${isTodayDate ? 'text-red-500 font-bold' : ''}
                      `}>
                        {format(day, 'd')}
                      </span>

                      {dayTasks.length > 0 && isCurrentMonth && (
                        <div className="mt-1 space-y-1">
                          {dayTasks.slice(0, 3).map((task, taskIdx) => {
                            const color = getCategoryColor(task.categoryId);
                            return (
                              <div
                                key={taskIdx}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate bg-gray-50 text-gray-700 border-l-2"
                                style={{ borderLeftColor: color }}
                                title={task.title}
                              >
                                {task.title}
                              </div>
                            );
                          })}
                          {dayTasks.length > 3 && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              +{dayTasks.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Category legend */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 items-center">
                <span className="text-xs text-gray-500 font-medium">Categories:</span>
                {legendCategories.length === 0 ? (
                  <span className="text-xs text-gray-400">No tasks this month</span>
                ) : (
                  legendCategories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#6B7280' }} />
                      <span className="text-xs text-gray-600">{cat.name}</span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Selected Date Tasks */}
          <div className="lg:col-span-1">
            <Card className="p-5 h-full">
              {selectedDate ? (
                <>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  {selectedDateTasks.length > 0 ? (
                    <div className="space-y-3">
                      {selectedDateTasks.map(task => {
                        const color = getCategoryColor(task.categoryId);
                        return (
                          <button
                            key={task.id}
                            onClick={() => {
                              setSelectedTask(task);
                              setShowDetailModal(true);
                            }}
                            className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {task.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {getCategoryName(task.categoryId)}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-400">No tasks scheduled</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <ClipboardList className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">Select a date to view tasks</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showDetailModal && createPortal(
        <div className="fixed inset-0 z-[9999]">
          <TaskDetailModal
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedTask(null);
            }}
            task={selectedTask}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default Calendar;
