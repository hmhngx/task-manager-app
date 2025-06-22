import React, { useEffect, useState } from 'react';
import { Task, TaskStatus, TaskPriority, TaskType, CreateTaskDto, UpdateTaskDto } from '../types/Task';
import { User } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useAppDispatch } from '../store';
import { fetchTasks, setFilters, setSortConfig, setPage, setRowsPerPage } from '../store/tasksSlice';
import { useTaskSocket } from '../hooks/useTaskSocket';
import taskService from '../services/taskService';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskForm from './TaskForm';
import TaskDetails from './TaskDetails';
import Button from './ui/Button';
import TablePagination from '@mui/material/TablePagination';
import { format } from 'date-fns';
import dayjs from 'dayjs';

interface TaskListProps {
  selectedDate: Date | null;
  isAdmin: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate, isAdmin }) => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { tasks, loading, filters, sortConfig, page, rowsPerPage } = useSelector((state: RootState) => state.tasks);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // WebSocket integration for real-time updates
  const { isConnected } = useTaskSocket({
    onTaskUpdate: (task) => {
      console.log('Task updated in real-time:', task);
    },
    onTaskCreated: (task) => {
      console.log('Task created in real-time:', task);
    },
    onTaskDeleted: (taskId) => {
      console.log('Task deleted in real-time:', taskId);
    },
    onStatusChange: (taskId, oldStatus, newStatus) => {
      console.log(`Task ${taskId} status changed from ${oldStatus} to ${newStatus}`);
    },
    onAssignment: (taskId, assigneeId, assignerId) => {
      console.log(`Task ${taskId} assigned to ${assigneeId} by ${assignerId}`);
    },
  });

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch, selectedDate]);

  const handleCreateTask = async (taskData: CreateTaskDto | UpdateTaskDto) => {
    try {
      const createdTask = await taskService.createTask(taskData as CreateTaskDto);
      setShowCreateForm(false);
      // No need to manually refresh - WebSocket will handle the update
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      return undefined
    }
  };

  const handleSort = (key: keyof Task) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    dispatch(setSortConfig({ key, direction }));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
    dispatch(setPage(0));
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

  const paginatedTasks = filteredAndSortedTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-lg text-gray-500">Loading tasks...</div>;
  }

  return (
    <div className="p-0 md:p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-700">Tasks</h1>
          {/* WebSocket connection status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live updates enabled' : 'Connecting...'}
            </span>
          </div>
        </div>
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
            {paginatedTasks.map((task, idx) => (
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
                    ? dayjs(task.deadline).format('MMM DD, YYYY HH:mm')
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
        <TablePagination
          component="div"
          count={filteredAndSortedTasks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
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