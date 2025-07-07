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
import AestheticSelect from './ui/AestheticSelect';
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

  // Icon helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'pending_approval':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'in_progress':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'done':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'late':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'low':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'high':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'urgent':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'bug':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'feature':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'subtask':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return null;
    }
  };

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
        <AestheticSelect
          options={[
            { value: '', label: 'All Statuses' },
            ...Object.values(TaskStatus).map(status => ({
              value: status,
              label: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
              icon: getStatusIcon(status)
            }))
          ]}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          placeholder="All Statuses"
          size="sm"
          variant="filled"
          className="w-40"
        />
        <AestheticSelect
          options={[
            { value: '', label: 'All Priorities' },
            ...Object.values(TaskPriority).map(priority => ({
              value: priority,
              label: priority.charAt(0).toUpperCase() + priority.slice(1),
              icon: getPriorityIcon(priority)
            }))
          ]}
          value={filters.priority}
          onChange={(value) => handleFilterChange('priority', value)}
          placeholder="All Priorities"
          size="sm"
          variant="filled"
          className="w-40"
        />
        <AestheticSelect
          options={[
            { value: '', label: 'All Types' },
            ...Object.values(TaskType).map(type => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
              icon: getTypeIcon(type)
            }))
          ]}
          value={filters.type}
          onChange={(value) => handleFilterChange('type', value)}
          placeholder="All Types"
          size="sm"
          variant="filled"
          className="w-40"
        />
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
                        : task.status === TaskStatus.PENDING_APPROVAL
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
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