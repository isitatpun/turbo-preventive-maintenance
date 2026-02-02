import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Circle
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
import Card from '../common/Card';
import Badge from '../common/Badge';
import useTaskStore from '../../store/taskStore';
import { TASK_STATUS, USER_ROLES } from '../data/constants';

const statusColors = {
  [TASK_STATUS.OPEN]: 'bg-blue-500',
  [TASK_STATUS.IN_PROGRESS]: 'bg-yellow-500',
  [TASK_STATUS.PENDING_APPROVAL]: 'bg-purple-500',
  [TASK_STATUS.COMPLETED]: 'bg-green-500',
  [TASK_STATUS.ISSUE]: 'bg-red-500',
  [TASK_STATUS.SKIPPED]: 'bg-gray-400'
};

const CalendarView = ({ onDateSelect, onTaskClick, filterUserId = null }) => {
  const { tasks } = useTaskStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filter tasks based on user if provided
  const filteredTasks = useMemo(() => {
    if (filterUserId) {
      return tasks.filter(t => t.assigneeId === filterUserId);
    }
    return tasks;
  }, [tasks, filterUserId]);

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return filteredTasks.filter(task => 
      isSameDay(parseISO(task.dueDate), date)
    );
  };

  // Calendar navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

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
  const selectedDateTasks = getTasksForDate(selectedDate);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card padding="lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium text-primary-500 hover:bg-primary-50 rounded-apple transition-colors"
              >
                Today
              </button>
              <button
                onClick={prevMonth}
                className="p-2 rounded-apple hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-apple hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day} 
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  className={`
                    relative min-h-[80px] p-2 rounded-apple text-left transition-all
                    ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                    ${isSelected ? 'bg-primary-50 ring-2 ring-primary-500' : 'hover:bg-gray-50'}
                    ${isTodayDate && !isSelected ? 'bg-accent-50' : ''}
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${isTodayDate ? 'text-accent-500' : ''}
                    ${isSelected ? 'text-primary-500' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Task Indicators */}
                  {dayTasks.length > 0 && isCurrentMonth && (
                    <div className="mt-1 space-y-1">
                      {dayTasks.slice(0, 3).map((task, taskIdx) => (
                        <div 
                          key={taskIdx}
                          className={`
                            h-1.5 rounded-full ${statusColors[task.status]}
                          `}
                          title={task.title}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-xs text-gray-400">
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
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Status Legend</p>
            <div className="flex flex-wrap gap-4">
              {Object.entries(TASK_STATUS).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[value]}`} />
                  <span className="text-xs text-gray-600 capitalize">
                    {value.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Date Tasks */}
      <div className="lg:col-span-1">
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-900">
              {format(selectedDate, 'EEEE, MMM d')}
            </h3>
          </div>

          {selectedDateTasks.length > 0 ? (
            <div className="space-y-3">
              {selectedDateTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick && onTaskClick(task)}
                  className="w-full text-left p-3 rounded-apple bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <Badge status={task.status} className="mt-1" />
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${statusColors[task.status]}`} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No tasks scheduled</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;