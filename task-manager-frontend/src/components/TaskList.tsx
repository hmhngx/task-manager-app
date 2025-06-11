import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TaskType, CreateTaskDto, UpdateTaskDto } from '../types/Task';
import { User } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import taskService from '../services/taskService';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';
import Button from './ui/Button';

interface TaskListProps {
  selectedDate: Date | null;
  isAdmin: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate, isAdmin }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    assignee: '',
    search: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Task;
    direction: 'asc' | 'desc';
  } | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (taskData: CreateTaskDto | UpdateTaskDto) => {
    try {
      const newTask = await taskService.createTask(taskData as CreateTaskDto);
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setShowCreateForm(false);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      return undefined;
    }
  };

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
      }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredAndSortedTasks = tasks
    .filter((task) => {
      return (
        (!filters.status || task.status === filters.status) &&
        (!filters.priority || task.priority === filters.priority) &&
        (!filters.type || task.type === filters.type) &&
        (!filters.assignee || task.assignee?.id === filters.assignee) &&
        (!filters.search ||
          task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          task.description?.toLowerCase().includes(filters.search.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center text-lg text-gray-500">Loading tasks...</div>;
  }

  return (
    <div className="p-0 md:p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-indigo-700">Tasks</h1>
        {isAdmin && (
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="primary"
            className="shadow-neon-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 px-6 py-2 text-base"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            }
          >
            Create Task
          </Button>
        )}
      </div>

      {/* Filters/Search */}
      <div className="mb-8 flex flex-wrap gap-4 items-center bg-white/80 backdrop-blur-md rounded-full shadow px-6 py-4 border border-blue-100">
          <input
            type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="p-2 border rounded-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition w-48"
          aria-label="Search tasks"
        />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="p-2 border rounded-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {Object.values(TaskStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="p-2 border rounded-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
          aria-label="Filter by priority"
        >
          <option value="">All Priorities</option>
          {Object.values(TaskPriority).map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="p-2 border rounded-full focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          {Object.values(TaskType).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
          </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white/90 rounded-2xl shadow-xl border border-blue-100">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-purple-100">
              <th className="px-6 py-4 text-left text-base font-semibold text-indigo-700">Title</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-indigo-700">Status</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-indigo-700">Priority</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-indigo-700">Type</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-indigo-700">Deadline</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-indigo-700">Assignee</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-indigo-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTasks.map((task, idx) => (
              <tr
                key={task._id ? task._id : task.id}
                className={`transition-all duration-200 ${idx % 2 === 0 ? 'bg-white/70' : 'bg-blue-50/60'} border-b hover:bg-indigo-50 hover:shadow-lg cursor-pointer`}
                onClick={() => setSelectedTask(task)}
                tabIndex={0}
                aria-label={`View details for task ${task.title}`}
              >
                <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      task.status === TaskStatus.DONE
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : task.status === TaskStatus.LATE
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      task.priority === TaskPriority.HIGH
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : task.priority === TaskPriority.MEDIUM
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                        : 'bg-green-100 text-green-800 border border-green-200'
                  }`}
                >
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 shadow-sm">
                    {task.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString()
                    : 'No deadline'}
                </td>
                <td className="px-6 py-4">
                  {task.assignee?.username || 'Unassigned'}
                </td>
                <td className="px-6 py-4">
                  <Button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                    }}
                    variant="outline"
                    className="text-indigo-600 border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800 px-3 py-1 text-xs"
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
                </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-2xl">
            <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowCreateForm(false)} />
              </div>
            </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <TaskDetails
              taskId={selectedTask._id ? selectedTask._id : selectedTask.id}
              onClose={() => setSelectedTask(null)}
            />
          </div>
      </div>
      )}
    </div>
  );
};

export default TaskList;