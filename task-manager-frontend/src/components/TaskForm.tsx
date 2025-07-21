import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskPriority, TaskType, CreateTaskDto, UpdateTaskDto } from '../types/Task';
import { User, getUserDisplayName } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { createTask, updateTask, getTaskById } from '../services/taskService';
import { getAllUsers } from '../services/userService';
import Button from './ui/Button';
import AestheticSelect from './ui/AestheticSelect';
import AestheticInput from './ui/AestheticInput';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface TaskFormProps {
  task?: Task;
  onSubmit?: (task: CreateTaskDto | UpdateTaskDto) => Promise<Task | undefined>;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateTaskDto>({
    title: task?.title || '',
    description: task?.description || '',
    type: task?.type || TaskType.FEATURE,
    priority: task?.priority || TaskPriority.MEDIUM,
    labels: task?.labels || [],
    deadline: task?.deadline ? new Date(task.deadline) : undefined,
    assignee: task?.assignee?.id || '',
    parentTask: task?.parentTask?.id || '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [parentTasks, setParentTasks] = useState<Task[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const navigate = useNavigate();

  // Icon helper functions
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

  const getUserIcon = () => (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const getTaskIcon = () => (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, taskData] = await Promise.all([
          getAllUsers(),
          task?.id ? getTaskById(task.id) : null
        ]);
        setUsers(usersData);
        if (taskData) {
          setFormData({
            title: taskData.title,
            description: taskData.description,
            type: taskData.type,
            priority: taskData.priority,
            labels: taskData.labels,
            deadline: taskData.deadline ? new Date(taskData.deadline) : undefined,
            assignee: taskData.assignee?.id || '',
            parentTask: taskData.parentTask?.id || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [task?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (newValue: dayjs.Dayjs | null) => {
    setFormData((prev) => ({ ...prev, deadline: newValue?.toDate() || undefined }));
  };

  const handleAddLabel = () => {
    if (newLabel && !formData.labels?.includes(newLabel)) {
      setFormData((prev) => ({
        ...prev,
        labels: [...(prev.labels || []), newLabel],
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (label: string) => {
    setFormData((prev) => ({
      ...prev,
      labels: prev.labels?.filter((l) => l !== label),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        deadline: formData.deadline,
        assignee: formData.assignee || undefined,
        parentTask: formData.parentTask || undefined,
      };

      if (onSubmit) {
        // If onSubmit is provided, let the parent component handle everything
        await onSubmit(submitData);
      } else if (task?.id) {
        // Update existing task
        await updateTask(task.id, submitData);
        navigate('/app');
      } else {
        // Create new task (standalone form)
        await createTask(submitData);
        navigate('/app');
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-lg mx-auto max-h-[90vh] overflow-y-auto p-2 rounded-lg shadow-lg bg-white">
      <form onSubmit={handleSubmit} className="space-y-2">
        <AestheticInput
          label="Title"
          value={formData.title || ''}
          onChange={val => setFormData(prev => ({ ...prev, title: val }))}
        />

        <AestheticInput
          label="Description"
          value={formData.description || ''}
          onChange={val => setFormData(prev => ({ ...prev, description: val }))}
          multiline
          rows={3}
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <AestheticSelect
              options={Object.values(TaskType).map(type => ({
                value: type,
                label: type.charAt(0).toUpperCase() + type.slice(1),
                icon: getTypeIcon(type)
              }))}
              value={formData.type}
              onChange={(value) => setFormData(prev => ({ ...prev, type: value as TaskType }))}
              label="Type"
              size="md"
              variant="filled"
            />
          </div>

          <div>
            <AestheticSelect
              options={Object.values(TaskPriority).map(priority => ({
                value: priority,
                label: priority.charAt(0).toUpperCase() + priority.slice(1),
                icon: getPriorityIcon(priority)
              }))}
              value={formData.priority}
              onChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
              label="Priority"
              size="md"
              variant="filled"
            />
          </div>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-xs font-medium text-gray-700">
            Deadline
          </label>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              value={formData.deadline ? dayjs(formData.deadline) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  className: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs',
                }
              }}
            />
          </LocalizationProvider>
        </div>

        {user?.role === 'admin' && (
          <div>
            <AestheticSelect
              options={[
                { value: '', label: 'Unassigned', icon: getUserIcon() },
                ...users.map(user => ({
                  value: user.id || '',
                  label: getUserDisplayName(user),
                  icon: getUserIcon()
                }))
              ]}
              value={formData.assignee || ''}
              onChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
              label="Assignee"
              size="md"
              variant="filled"
              showSearch={true}
              maxHeight="240px"
            />
          </div>
        )}

        <div>
          <AestheticSelect
            options={[
              { value: '', label: 'None', icon: getTaskIcon() },
              ...parentTasks.map(task => ({
                value: task.id || '',
                label: task.title,
                icon: getTaskIcon()
              }))
            ]}
            value={formData.parentTask || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, parentTask: value }))}
            label="Parent Task"
            size="md"
            variant="outlined"
            showSearch={true}
            maxHeight="240px"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Labels</label>
          <div className="mt-1 flex items -center space-x-2">
            <AestheticInput
              label="Add a label"
              value={newLabel}
              onChange={setNewLabel}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
              className="flex-1"
            />
            <button
              type="button"
              onClick={handleAddLabel}
              className="inline-flex items-center px-3 py-2 border border-transparent text-xs leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.labels?.map((label) => (
              <span
                key={label}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 animate-fadeIn"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveLabel(label)}
                  className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <span className="sr-only">Remove label</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm; 