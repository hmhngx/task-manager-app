import { Task } from '../types';
import Button from './ui/Button';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'done':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'todo':
      return 'bg-yellow-100 text-yellow-800';
    case 'late':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TaskCard({
  task,
  onComplete,
  onDelete,
}: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
      <div className="p-4">
        {/* Header with status and priority */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status.replace('-', ' ')}
            </span>
            {task.priority && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                {task.priority}
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

        {/* Title and Description */}
        <div className="space-y-2">
          <h3
            className={`text-lg font-semibold ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}
          >
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        </div>

        {/* Footer with metadata */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {task.category}
              </span>
            )}
            {task.deadline && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
