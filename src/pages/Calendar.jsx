import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  ClipboardList
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
import { TASK_STATUS} from '../data/constants';

const statusColors = {
  [TASK_STATUS.COMPLETED]: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [TASK_STATUS.IN_PROGRESS]: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  [TASK_STATUS.ISSUE]: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  [TASK_STATUS.OPEN]: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  [TASK_STATUS.PENDING_APPROVAL]: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' }
};

const Calendar = () => {
  const { user, isTechnician } = useAuthStore();
  const { tasks, categories } = useTaskStore();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter tasks based on user role
  const filteredTasks = useMemo(() => {
    if (isTechnician()) {
      return tasks.filter(t => t.assigneeId === user?.id);
    }
    return tasks;
  }, [tasks, user, isTechnician]);

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return filteredTasks.filter(task => 
      isSameDay(parseISO(task.dueDate), date)
    );
  };

  // Calendar navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="space-y-6 page-transition">
      {/* Header */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <CalendarIcon className="w-4 h-4" />
        <span>Schedule</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-primary-500 min-w-[160px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div 
                  key={day} 
                  className="text-center text-sm font-semibold text-gray-400 py-3"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
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
                    
                    {/* Task Indicators */}
                    {dayTasks.length > 0 && isCurrentMonth && (
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 3).map((task, taskIdx) => {
                          const colors = statusColors[task.status] || statusColors[TASK_STATUS.OPEN];
                          return (
                            <div 
                              key={taskIdx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${colors.bg} ${colors.text}`}
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

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-600">Complete</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600">Issue</span>
              </div>
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
                      const colors = statusColors[task.status] || statusColors[TASK_STATUS.OPEN];
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
                            <div className={`w-2 h-2 rounded-full mt-1.5 ${colors.dot}`} />
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

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
};

export default Calendar;