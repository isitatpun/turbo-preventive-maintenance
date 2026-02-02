import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User,
  ChevronRight,
  Wind,
  Zap,
  Sun,
  Droplets,
  Building
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import Badge from '../common/Badge';
import useTaskStore from '../../store/taskStore';
import useUserStore from '../../store/userStore';

const categoryIcons = {
  'cat-1': Wind,
  'cat-2': Zap,
  'cat-3': Sun,
  'cat-4': Droplets,
  'cat-5': Building
};

const TaskCard = ({ task, onClick, showAssignee = false }) => {
  const { categories, locations } = useTaskStore();
  const { getUserById } = useUserStore();
  
  const category = categories.find(c => c.id === task.categoryId);
  const location = locations.find(l => l.id === task.locationId);
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;
  
  const CategoryIcon = categoryIcons[task.categoryId] || Building;
  
  const isOverdue = isPast(new Date(task.dueDate)) && !['completed', 'skipped'].includes(task.status);
  const isDueToday = isToday(new Date(task.dueDate));

  return (
    <div
      onClick={onClick}
      className="card-hover p-4 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div 
          className="w-10 h-10 rounded-apple flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${category?.color}15` }}
        >
          <CategoryIcon 
            className="w-5 h-5" 
            style={{ color: category?.color }} 
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-2">
              {task.title}
            </h3>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-primary-500 transition-colors" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge status={task.status} />
            {task.priority === 'high' && (
              <Badge variant="danger">High Priority</Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{location.name}</span>
              </div>
            )}
            {category && (
              <div className="flex items-center gap-1">
                <CategoryIcon className="w-4 h-4" />
                <span>{category.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className={`flex items-center gap-1 text-sm ${
              isOverdue ? 'text-red-500' : isDueToday ? 'text-warning-600' : 'text-gray-500'
            }`}>
              <Calendar className="w-4 h-4" />
              <span>
                {isOverdue ? 'Overdue: ' : isDueToday ? 'Due Today: ' : ''}
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            </div>

            {showAssignee && assignee && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>{assignee.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;