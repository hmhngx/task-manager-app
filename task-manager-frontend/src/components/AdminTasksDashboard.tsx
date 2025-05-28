import React, { useEffect, useState } from 'react';
import { getAllTasks, deleteTask } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import { User, Task } from '../types';
import { useNavigate, Link } from 'react-router-dom';

const AdminTasksDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchAllTasks();
    // eslint-disable-next-line
  }, [isAdmin]);

  const fetchAllTasks = async () => {
    setLoading(true);
    try {
      const data = await getAllTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete._id);
      setTasks(tasks.filter(t => t._id !== taskToDelete._id));
      setTaskToDelete(null);
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Users' Tasks</h1>
            <p className="mt-2 text-sm text-gray-600">View and manage all tasks created by users</p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No tasks found.</td>
                  </tr>
                )}
                {filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                          {task.userId?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{task.userId}</div>
                          <div className="text-xs text-gray-500">Task ID: {task._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{task.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'done' ? 'bg-green-100 text-green-800' :
                        task.status === 'late' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {task.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                      {task.deadline ? new Date(task.deadline).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteClick(task)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 flex items-center space-x-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {taskToDelete && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-500"
                  title="Close"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete the task <span className="font-medium text-gray-900">{taskToDelete.title}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className={`px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center ${
                    isDeleting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete Task'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTasksDashboard; 