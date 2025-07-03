import React, { useState, useEffect, useCallback } from 'react';
import { Task, User } from '../types/Task';
import { getUserId, getUserDisplayName } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useCommentSocket } from '../hooks/useCommentSocket';
import { useAttachmentSocket } from '../hooks/useAttachmentSocket';
import taskService, { canRequestTask, getTaskRequestRestrictionMessage } from '../services/taskService';
import TaskForm from './TaskForm';
import Button from './ui/Button';
import UserAvatar from './UserAvatar';
import dayjs from 'dayjs';

interface TaskDetailsProps {
  taskId: string;
  onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId, onClose }) => {
  const { user } = useAuth();
  const { subscribeToTask, unsubscribeFromTask } = useWebSocket();
  const [task, setTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // WebSocket subscription for real-time comment updates
  const { isConnected: commentSocketConnected } = useCommentSocket({
    taskId,
    onCommentAdded: (comment) => {
      console.log('New comment received via WebSocket:', comment);
      // Refresh task details to get updated comment list
      fetchTaskDetails();
    },
    onCommentEdited: (comment) => {
      console.log('Comment edited via WebSocket:', comment);
      // Refresh task details to get updated comment list
      fetchTaskDetails();
    },
    onCommentDeleted: (commentId) => {
      console.log('Comment deleted via WebSocket:', commentId);
      // Refresh task details to get updated comment list
      fetchTaskDetails();
    },
  });

  // WebSocket subscription for real-time attachment updates
  const { isConnected: attachmentSocketConnected } = useAttachmentSocket({
    taskId,
    callbacks: {
      onAttachmentUploaded: (data) => {
        console.log('📤 New attachment uploaded via WebSocket:', data);
        console.log('📁 Attachment details:', data.attachment);
        console.log('👤 Uploader:', data.uploader);
        // Refresh task details to get updated attachment list
        fetchTaskDetails();
      },
      onAttachmentDeleted: (data) => {
        console.log('🗑️ Attachment deleted via WebSocket:', data);
        console.log('🆔 Deleted attachment ID:', data.attachmentId);
        console.log('📁 Deleted file name:', data.fileName);
        console.log('👤 Deleter:', data.deleter);
        // Refresh task details to get updated attachment list
        fetchTaskDetails();
      },
    },
  });

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

  // Subscribe to task updates via WebSocket
  useEffect(() => {
    if (taskId) {
      subscribeToTask(taskId);
      console.log('Subscribed to task updates for task:', taskId);
    }

    return () => {
      if (taskId) {
        unsubscribeFromTask(taskId);
        console.log('Unsubscribed from task updates for task:', taskId);
      }
    };
  }, [taskId, subscribeToTask, unsubscribeFromTask]);

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

  const handleDeleteComment = async (commentId: string) => {
    try {
      console.log('Attempting to delete comment:', commentId);
      console.log('Current user:', user);
      await taskService.deleteComment(commentId);
      console.log('Comment deleted successfully');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    console.log('📤 Starting file upload...');
    console.log('📋 Task ID:', taskId);
    console.log('📁 File name:', selectedFile.name);
    console.log('📏 File size:', selectedFile.size);
    console.log('👤 Current user:', user);

    try {
      console.log('📡 Sending upload request to backend...');
      await taskService.uploadAttachment(taskId, selectedFile);
      console.log('✅ File uploaded successfully');
      setSelectedFile(null);
      console.log('🔄 Refreshing task details...');
      fetchTaskDetails();
    } catch (error) {   
      console.error('❌ Error uploading file:', error);
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
    console.log('🗑️ Starting attachment deletion...');
    console.log('🆔 Attachment ID:', attachmentId);
    console.log('📋 Task ID:', taskId);
    console.log('👤 Current user:', user);

    try {
      console.log('📡 Sending deletion request to backend...');
      await taskService.deleteAttachment(attachmentId);
      console.log('✅ Attachment deleted successfully');
      console.log('🔄 Refreshing task details...');
      fetchTaskDetails();
    } catch (error) {
      console.error('❌ Error deleting attachment:', error);
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
          {task.comments.map((comment, idx) => {
            // Handle both populated and unpopulated author data
            const authorData = typeof comment.author === 'object' && comment.author !== null 
              ? comment.author 
              : { username: 'Unknown User', _id: comment.author };
            
            return (
            <div key={comment.id || comment._id || idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <UserAvatar user={authorData as User} className="h-8 w-8" />
                </div>
                
                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{authorData.username}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {comment.isEdited && (
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded-full">edited</span>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    <div className="flex items-center space-x-2">
                      {(() => {
                        // Simplified author check - handle both populated and unpopulated author data
                        let isAuthor = false;
                        
                        if (user && comment.author) {
                          const currentUserId = getUserId(user);
                          
                          // Handle populated author object
                          if (typeof comment.author === 'object' && comment.author !== null) {
                            const authorId = (comment.author as any)._id || (comment.author as any).id;
                            isAuthor = currentUserId === authorId;
                          }
                          // Handle author as string ID
                          else if (typeof comment.author === 'string') {
                            isAuthor = currentUserId === comment.author;
                          }
                        }
                        
                        const canDelete = isAuthor || user?.role === 'admin';
                        
                        console.log('Comment deletion check:', {
                          commentId: comment.id || comment._id,
                          commentAuthor: comment.author,
                          commentAuthorType: typeof comment.author,
                          currentUser: user,
                          currentUserId: user ? getUserId(user) : null,
                          isAuthor,
                          canDelete,
                          userRole: user?.role
                        });
                        
                        return canDelete ? (
                          <button
                            onClick={() => {
                              const commentId = comment.id || comment._id;
                              if (commentId) {
                                console.log('Deleting comment:', commentId);
                                handleDeleteComment(commentId);
                              }
                            }}
                            className="text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors text-sm"
                            title="Delete comment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
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
            placeholder="Write your comment here..."
          />
          <button
            onClick={handleAddComment}
            className="mt-2 px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-2"
            disabled={!newComment.trim()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Add Comment</span>
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Attachments</h3>
        <div className="mt-2 space-y-4">
          {Array.isArray(task.attachments) && task.attachments.map((attachment, idx) => {
            const key = (attachment && typeof attachment === 'object' && attachment._id) || idx;
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
                    {/* All users can download attachments */}
                    <button
                      onClick={() => handleDownloadAttachment(attachment._id)}
                      className="text-blue-500 hover:text-blue-600 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                      disabled={downloadingId === attachment._id}
                    >
                      {downloadingId === attachment._id ? 'Downloading...' : 'Download'}
                    </button>
                    {/* Only admins can delete attachments */}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteAttachment(attachment._id)}
                        className="text-red-500 hover:text-red-600 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
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