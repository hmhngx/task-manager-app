import { Task } from '../types';
import Button from './ui/Button';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'todo':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending_approval':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'late':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-orange-400';
    case 'low':
      return 'bg-green-400';
    default:
      return 'bg-gray-400';
  }
};

const getPriorityTextColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'text-red-800';
    case 'medium':
      return 'text-orange-800';
    case 'low':
      return 'text-green-800';
    default:
      return 'text-gray-800';
  }
};

export default function TaskCard({
  task,
  onComplete,
  onDelete,
}: TaskCardProps) {
  const formattedDeadline = task.deadline 
    ? format(new Date(task.deadline), 'MMM dd, yyyy')
    : 'No deadline';

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 overflow-hidden transform hover:-translate-y-1">
      {/* Priority indicator bar */}
      <div className={`h-1.5 ${getPriorityColor(task.priority || '')} w-full`}></div>
      
      <div className="p-5">
        {/* Header with status and priority */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col gap-2">
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ').toUpperCase()}
            </span>
            {task.priority && (
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)} text-white`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              title={task.status === 'done' ? 'Mark as not completed' : 'Mark as completed'}
              onClick={() => onComplete(task._id)}
              variant={task.status === 'done' ? 'primary' : 'outline'}
              className="p-1.5 rounded-full hover:bg-green-50 transition-colors"
              aria-label={task.status === 'done' ? 'Mark as not completed' : 'Mark as completed'}
              leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            />
            <Button
              type="button"
              title="Delete task"
              onClick={() => onDelete(task._id)}
              variant="danger"
              className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
              aria-label="Delete task"
              leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
            />
          </div>
        </div>

        {/* Task title and description */}
        <div className="mb-4">
          <h3 
            className={`text-xl font-bold mb-2 group-hover:text-indigo-700 transition-colors ${
              task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {task.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
          <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">Due: {formattedDeadline}</span>
          </div>
          
          {task.category && (
            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
              {task.category}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
          {task.status !== 'done' ? (
            <button
              onClick={() => onComplete(task._id)}
              className="inline-flex items-center px-3.5 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Mark Complete
            </button>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Completed
            </span>
          )}
          
          <button
            onClick={() => onDelete(task._id)}
            className="inline-flex items-center px-3.5 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
