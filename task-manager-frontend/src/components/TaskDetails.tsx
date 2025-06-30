import React, { useState, useEffect, useCallback } from 'react';
import { Task, User } from '../types/Task';
import { getUserId, getUserDisplayName } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import taskService, { canRequestTask, getTaskRequestRestrictionMessage } from '../services/taskService';
import TaskForm from './TaskForm';
import Button from './ui/Button';
import dayjs from 'dayjs';

interface TaskDetailsProps {
  taskId: string;
  onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId, onClose }) => {
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchTaskDetails = useCallback(async () => {
    try {
      const taskData = await taskService.getTaskById(taskId);
      if (!taskData || !taskData.title) {
        console.error('Fetched task is missing required fields:', taskData);
      }
      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task details:', error);
      setTask(null);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTaskDetails();
    if (user?.role === 'admin') {
      taskService.getAvailableUsers().then((users) => {
        setAvailableUsers(users.filter((u: any) => u.role === 'user'));
      });
    }
  }, [fetchTaskDetails, user]);

  const handleUpdateTask = async (updatedTask: any) => {
    try {
      await taskService.updateTask(taskId, updatedTask);
      await fetchTaskDetails();
      setIsEditing(false);
      return taskService.getTaskById(taskId);
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await taskService.createComment(taskId, newComment);
      setNewComment('');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      await taskService.uploadAttachment(taskId, selectedFile);
      setSelectedFile(null);
      fetchTaskDetails();
    } catch (error) {   
      console.error('Error uploading file:', error);
    }
  };

  const handleRequestTask = async () => {
    console.log('🔄 User clicked "Request Assignment" button');
    console.log('📋 Task ID:', taskId);
    console.log('👤 Current user object:', user);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
      console.log('📡 Sending task request to backend...');
      await taskService.requestTask(taskId);
      console.log('✅ Task request sent successfully');
      fetchTaskDetails();
    } catch (error) {
      console.error('❌ Error requesting task:', error);
    }
  };

  const handleApproveRequest = async (requesterId: string) => {
    console.log('✅ Admin clicked "Approve" button');
    console.log('📋 Task ID:', taskId);
    console.log('👤 Requester ID:', requesterId);
    console.log('👨‍💼 Admin user object:', user);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
      console.log('📡 Sending approval request to backend...');
      await taskService.approveRequest(taskId, requesterId);
      console.log('✅ Request approved successfully');
      await fetchTaskDetails();
    } catch (error) {
      console.error('❌ Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requesterId: string) => {
    console.log('❌ Admin clicked "Reject" button');
    console.log('📋 Task ID:', taskId);
    console.log('👤 Requester ID:', requesterId);
    console.log('👨‍💼 Admin user object:', user);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
      console.log('📡 Sending rejection request to backend...');
      await taskService.rejectRequest(taskId, requesterId);
      console.log('✅ Request rejected successfully');
      await fetchTaskDetails();
    } catch (error) {
      console.error('❌ Error rejecting request:', error);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedAssignee) return;
    try {
      await taskService.updateTask(taskId, { assignee: selectedAssignee });
      setSelectedAssignee('');
      await fetchTaskDetails();
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await taskService.deleteAttachment(attachmentId);
      fetchTaskDetails();
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const handleRemoveAssignment = async () => {
    try {
      await taskService.updateTask(taskId, { assignee: null });
      await fetchTaskDetails();
    } catch (error) {
      console.error('Error removing assignment:', error);
    }
  };

  const handleDownloadAttachment = async (attachmentId: string) => {
    setDownloadingId(attachmentId);
    try {
      const { blob, filename } = await taskService.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download attachment.');
      console.error(error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleMarkAsCompleted = async () => {
    await handleUpdateTask({ status: 'done' });
  };

  const handleMarkAsLate = async () => {
    await handleUpdateTask({ status: 'late' });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!task || !task.title) {
    return <div>Task not found or missing data</div>;
  }

  if (isEditing) {
    return (
      <div className="p-4">
        <TaskForm task={task} onSubmit={handleUpdateTask} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <p className="text-gray-600">{task.description}</p>
        </div>
        <div className="flex space-x-2">
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Details</h3>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-sm text-gray-500">Type</dt>
              <dd>{task.type}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Priority</dt>
              <dd>{task.priority}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  task.status === 'done'
                    ? 'bg-green-100 text-green-800'
                    : task.status === 'late'
                    ? 'bg-red-100 text-red-800'
                    : task.status === 'pending_approval'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {task.status}
                </span>
                {user?.role === 'admin' && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      onClick={handleMarkAsCompleted}
                      variant="primary"
                      className="shadow-neon-green focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                      aria-label="Mark as Completed"
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      onClick={handleMarkAsLate}
                      variant="danger"
                      className="shadow-neon-red focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      aria-label="Mark as Late"
                    >
                      Mark as Late
                    </Button>
                  </div>
                )}
              </dd>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Assigned to:</span>
              <span className="font-medium">
                {task.assignee ? getUserDisplayName(task.assignee) : 'Unassigned'}
              </span>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Deadline</dt>
              <dd>{task.deadline ? dayjs(task.deadline).format('MMM DD, YYYY HH:mm') : 'No deadline'}</dd>
            </div>
          </dl>
        </div>
        <div>
          <h3 className="font-semibold">Labels</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {task.labels.map((label) => (
              <span
                key={label}
                className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {task.parentTask && (
        <div>
          <h3 className="font-semibold">Parent Task</h3>
          <p>{task.parentTask.title}</p>
        </div>
      )}

      {task.subtasks.length > 0 && (
        <div>
          <h3 className="font-semibold">Subtasks</h3>
          <ul className="mt-2 space-y-2">
            {task.subtasks.map((subtask, idx) => (
              <li key={subtask.id || subtask._id || idx} className="p-2 bg-gray-50 rounded">
                {subtask.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold">Comments</h3>
        <div className="mt-2 space-y-4">
          {task.comments.map((comment, idx) => (
            <div key={comment.id ?? idx} className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium">{getUserDisplayName(comment.author)}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {comment.isEdited && (
                    <span className="text-sm text-gray-500 ml-2">(edited)</span>
                  )}
                </div>
              </div>
              <p className="mt-1">{comment.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <label htmlFor="newComment" className="block text-sm font-medium text-gray-700">
            Add Comment
          </label>
          <textarea
            id="newComment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Comment
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Attachments</h3>
        <div className="mt-2 space-y-4">
          {Array.isArray(task.attachments) && task.attachments.map((attachment, idx) => {
            const key = (attachment && typeof attachment === 'object' && ('id' in attachment ? attachment.id : (attachment as any)._id)) || attachment || idx;
            if (attachment && typeof attachment === 'object' && (attachment.originalName || attachment.url)) {
              return (
                <div key={key} className="flex items-start justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">{attachment.originalName}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleString() : ''}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({Math.round(attachment.size / 1024)} KB)
                      </span>
                    </div>
                    {attachment.mimeType?.startsWith('image/') && (
                      <div className="mt-3">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={attachment.thumbnail || attachment.url}
                            alt={attachment.originalName}
                            className="max-w-[200px] max-h-[200px] rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          />
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => handleDownloadAttachment(attachment.id || (attachment as any)._id)}
                          className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                          disabled={downloadingId === (attachment.id || (attachment as any)._id)}
                        >
                          {downloadingId === (attachment.id || (attachment as any)._id) ? 'Downloading...' : 'Download'}
                        </button>
                        {user && getUserId(user) === (attachment.uploadedBy?.id || attachment.uploadedBy) && (
                          <button
                            onClick={() => handleDeleteAttachment(attachment.id || (attachment as any)._id)}
                            className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            }
            // fallback for string or unknown object
            return (
              <div key={key} className="flex items-start justify-between bg-gray-50 p-4 rounded-lg">
                <span>Attachment</span>
              </div>
            );
          })}
        </div>

        {/* Only show upload for admin */}
        {user?.role === 'admin' && (
          <div className="mt-4">
            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">
              Upload File
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                id="fileUpload"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Upload
              </button>
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        {user?.role === 'admin' && (
          <>
            <label htmlFor="assignUserSelect" className="sr-only">Assign to user</label>
            <select
              id="assignUserSelect"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="px-2 py-1 border rounded"
            >
              <option value="">Unassigned</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>{getUserDisplayName(u)}</option>
              ))}
            </select>
            <button
              onClick={handleAssignTask}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={selectedAssignee === (task.assignee?.id || '')}
            >
              Assign to
            </button>
            {task.assignee && (
              <button
                onClick={handleRemoveAssignment}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-2"
              >
                Remove Assignment
              </button>
            )}
          </>
        )}
        {user?.role !== 'admin' && user && (
          <>
            {/* Only show Request Assignment button if user is not assigned, not creator, and not already a requester */}
            {!task.assignee || getUserId(task.assignee) !== getUserId(user) ? (
              task.creator && getUserId(task.creator) !== getUserId(user) ? (
                // Check if task can be requested
                !canRequestTask(task) ? (
                  <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded border border-gray-300">
                    {getTaskRequestRestrictionMessage(task)}
                  </div>
                ) : task.requesters.some(requester => {
                  const requesterId = typeof requester === 'string' ? requester : getUserId(requester as User);
                  return requesterId === getUserId(user);
                }) ? (
                  <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded border border-yellow-300">
                    You have already requested this task
                  </div>
                ) : (
                  <button
                    onClick={handleRequestTask}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Request Assignment
                  </button>
                )
              ) : (
                <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded border border-gray-300">
                  You cannot request your own task
                </div>
              )
            ) : (
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded border border-blue-300">
                You are already assigned to this task
              </div>
            )}
          </>
        )}
        {task.requesters.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Pending Requests</h4>
            {task.requesters.map((requester, idx) => {
              const requesterId = typeof requester === 'string' ? requester : getUserId(requester as User);
              const requesterName = typeof requester === 'string' ? 'User' : getUserDisplayName(requester as User);

              if (!requesterId) {
                console.error('Invalid requester ID:', requester);
                return null;
              }

              return (
                <div key={requesterId ?? idx} className="flex items-center space-x-2">
                  <span>{requesterName}</span>
                  {user?.role === 'admin' && typeof requesterId === 'string' && (
                    <>
                      <button
                        onClick={() => handleApproveRequest(requesterId)}
                        className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(requesterId)}
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails; 