import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/taskService';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface TaskListProps {
  selectedDate: Date | null;
  isAdmin: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate, isAdmin }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    deadline: null as Date | null,
  });
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      const tasksWithStatus = fetchedTasks.map((task) => ({
        ...task,
        status: task.status || 'todo',
      }));
      setTasks(tasksWithStatus);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newTask.title.trim() ||
      !newTask.description.trim() ||
      !newTask.deadline ||
      !user
    ) {
      setError(
        'Title, description, deadline, and user authentication are required'
      );
      return;
    }

    // Validate that deadline is in the future
    const now = new Date();
    if (newTask.deadline <= now) {
      setError('Deadline must be in the future');
      return;
    }

    try {
      // Create a new Date object to ensure proper date handling
      const deadline = new Date(newTask.deadline);

      const createdTask = await createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        category: newTask.category?.trim() || undefined,
        deadline: deadline,
        status: 'todo',
      });

      setTasks([...tasks, createdTask]);
      setNewTask({ title: '', description: '', category: '', deadline: null });
      setError('');
    } catch (err) {
      console.error('Error creating task:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add task');
      }
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const newStatus = task.status === 'done' ? 'todo' : 'done';
      const updatedTask = await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  const filteredTasks = selectedDate
    ? tasks.filter(
        (task) =>
          task.deadline &&
          new Date(task.deadline).toDateString() === selectedDate.toDateString()
      )
    : tasks;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleAddTask} className="mb-6">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Task description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={newTask.category}
            onChange={(e) =>
              setNewTask({ ...newTask, category: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <div>
            <label className="block mb-1 font-medium">
              Deadline (required)
            </label>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                value={newTask.deadline}
                onChange={(date: Date | null) =>
                  setNewTask({ ...newTask, deadline: date })
                }
                minDateTime={new Date()} // Set minimum date to now
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    placeholder: 'Select deadline',
                    className: 'w-full p-2 border rounded',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'transparent' },
                        '&:hover fieldset': { borderColor: 'transparent' },
                        '&.Mui-focused fieldset': {
                          borderColor: 'transparent',
                        },
                      },
                    },
                  },
                }}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-root': {
                    height: '42px',
                  },
                }}
              />
            </LocalizationProvider>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Add Task
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isAdmin ? 'All Tasks' : 'Your Tasks'}
          </h2>
          {isAdmin && (
            <div className="text-sm text-gray-500">
              Admin View • {filteredTasks.length} tasks
            </div>
          )}
        </div>
        {filteredTasks.length === 0 && (
          <div className="text-center text-gray-500">
            No tasks for this day.
          </div>
        )}
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className={`border p-4 rounded-2xl shadow-lg transition hover:shadow-2xl hover:scale-[1.02] bg-white ${
              task.status === 'late'
                ? 'border-red-400'
                : task.status === 'done'
                  ? 'border-green-400'
                  : 'border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3
                  className={`font-semibold ${
                    task.status === 'done'
                      ? 'line-through text-gray-500'
                      : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </h3>
                <p className="text-gray-600">{task.description}</p>
                {task.category && (
                  <span className="text-sm text-gray-500">{task.category}</span>
                )}
                {task.deadline && (
                  <div
                    className={`text-xs mt-1 ${
                      task.status === 'late' ? 'text-red-600' : 'text-blue-600'
                    }`}
                  >
                    Deadline: {new Date(task.deadline).toLocaleString()}
                  </div>
                )}
                <div
                  className={`text-xs mt-1 ${
                    task.status === 'late'
                      ? 'text-red-600'
                      : task.status === 'done'
                        ? 'text-green-600'
                        : 'text-blue-600'
                  }`}
                >
                  Status: {task?.status ? task.status.toUpperCase() : 'TODO'}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleTask(task._id)}
                  className={`px-3 py-1 rounded-lg transition font-semibold shadow-sm hover:shadow-md active:scale-95 ${
                    task.status === 'done'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                >
                  {task.status === 'done' ? 'Completed' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition shadow-sm hover:shadow-md active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
