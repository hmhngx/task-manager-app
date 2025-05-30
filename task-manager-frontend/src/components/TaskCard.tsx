import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({
  task,
  onComplete,
  onDelete,
}: TaskCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}
          >
            {task.title}
          </h3>
          <p className="mt-2 text-gray-600">{task.description}</p>
          {task.category && (
            <span className="inline-block mt-3 px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
              {task.category}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            title={
              task.status === 'done'
                ? 'Mark as not completed'
                : 'Mark as completed'
            }
            onClick={() => onComplete(task._id)}
            className={`p-2 rounded-full ${
              task.status === 'done'
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
            } transition-colors`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
          <button
            type="button"
            title="Delete task"
            onClick={() => onDelete(task._id)}
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
