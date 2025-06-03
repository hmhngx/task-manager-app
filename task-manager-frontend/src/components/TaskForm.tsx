import React, { useState, useEffect } from 'react';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskType,
  TaskPriority,
  TaskStatus,
} from '../types/Task';
import taskService from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: CreateTaskDto | UpdateTaskDto) => Promise<Task | undefined>;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<{
    title: string;
    description?: string;
    type: TaskType;
    priority: TaskPriority;
    labels?: string[];
    deadline?: string;
    status?: TaskStatus;
    assignee?: string;
    parentTask?: string;
  }>(
    {
      title: task?.title || '',
      description: task?.description || '',
      type: task?.type || TaskType.TASK,
      priority: task?.priority || TaskPriority.MEDIUM,
      labels: task?.labels || [],
      deadline: task?.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      status: task?.status || TaskStatus.TODO,
      assignee: task?.assignee?.id || '',
      parentTask: task?.parentTask?.id || '',
    }
  );

  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [parentTasks, setParentTasks] = useState<Task[]>([]);
  const [newLabel, setNewLabel] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'admin') {
          const users = await taskService.getAvailableUsers();
          setAvailableUsers(users);
        }
        const tasks = await taskService.getAllTasks();
        setParentTasks(tasks);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
    fetchData();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const submitData = {
      ...formData,
      assignee: formData.assignee === '' ? null : formData.assignee,
      deadline: formData.deadline ? new Date(formData.deadline) : undefined,
      parentTask: formData.parentTask || undefined,
    };
    const createdOrUpdatedTask = await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(TaskType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {Object.values(TaskPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
          Deadline
        </label>
        <input
          type="datetime-local"
          id="deadline"
          name="deadline"
          value={formData.deadline || ''}
          onChange={handleDateChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {user?.role === 'admin' && (
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700">
            Assignee
          </label>
          <select
            id="assignee"
            name="assignee"
            value={formData.assignee}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option key="unassigned" value="">Unassigned</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="parentTask" className="block text-sm font-medium text-gray-700">
          Parent Task
        </label>
        <select
          id="parentTask"
          name="parentTask"
          value={formData.parentTask}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option key="none" value="">None</option>
          {parentTasks.map((parentTask) => (
            <option key={parentTask.id} value={parentTask.id}>
              {parentTask.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Labels</label>
        <div className="mt-1 flex items-center space-x-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Add a label"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={handleAddLabel}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.labels?.map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {label}
              <button
                type="button"
                onClick={() => handleRemoveLabel(label)}
                className="ml-1 inline-flex items-center p-0.5 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
              >
                <span className="sr-only">Remove label</span>
                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 