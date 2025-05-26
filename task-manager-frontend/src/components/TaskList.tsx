import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Task } from '../types';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TaskListProps {
  selectedDate: Date | null;
}

const TaskList: React.FC<TaskListProps> = ({ selectedDate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    deadline: null as Date | null,
  });
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.description.trim()) return;

    try {
      const createdTask = await createTask({
        title: newTask.title,
        description: newTask.description,
        category: newTask.category || undefined,
        deadline: newTask.deadline ? newTask.deadline.toISOString() : undefined,
      });
      setTasks([...tasks, createdTask]);
      setNewTask({ title: '', description: '', category: '', deadline: null });
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const updatedTask = await updateTask(taskId, { completed: !completed });
      setTasks(tasks.map(task => 
        task._id === taskId ? updatedTask : task
      ));
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  // Filter tasks for the selected day
  const filteredTasks = selectedDate
    ? tasks.filter(task =>
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
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={newTask.category}
            onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <div>
            <label className="block mb-1 font-medium">Deadline (optional)</label>
            <DatePicker
              selected={newTask.deadline}
              onChange={(date) => setNewTask({ ...newTask, deadline: date })}
              showTimeSelect
              dateFormat="Pp"
              className="w-full p-2 border rounded"
              placeholderText="Select deadline"
              isClearable
            />
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
        {filteredTasks.length === 0 && (
          <div className="text-center text-gray-500">No tasks for this day.</div>
        )}
        {filteredTasks.map((task) => (
          <div key={task._id} className="border p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
                {task.category && (
                  <span className="text-sm text-gray-500">{task.category}</span>
                )}
                {task.deadline && (
                  <div className="text-xs text-blue-600 mt-1">
                    Deadline: {new Date(task.deadline).toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleTask(task._id, task.completed)}
                  className={`px-3 py-1 rounded ${
                    task.completed ? 'bg-green-500' : 'bg-gray-500'
                  } text-white`}
                >
                  {task.completed ? 'Completed' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
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