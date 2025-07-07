import React, { useState, useEffect, useCallback } from 'react';
import { Task, User, Comment } from '../types/Task';
import { getUserId, getUserDisplayName } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useCommentSocket } from '../hooks/useCommentSocket';
import { useAttachmentSocket } from '../hooks/useAttachmentSocket';
import taskService, { canRequestTask, getTaskRequestRestrictionMessage } from '../services/taskService';
import TaskForm from './TaskForm';
import Button from './ui/Button';
import UserAvatar from './UserAvatar';
import { CommentItem } from './CommentItem';
import AttachmentButton from './ui/AttachmentButton';
import CommentBox from './ui/CommentBox';
import AestheticSelect from './ui/AestheticSelect';
import dayjs from 'dayjs';

interface TaskDetailsProps {
  taskId: string;
  onClose: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId, onClose }) => {
  const { user } = useAuth();
  const { subscribeToTask, unsubscribeFromTask } = useWebSocket();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Icon helper function
  const getUserIcon = () => (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  // WebSocket subscription for real-time comment updates
  const { isConnected: commentSocketConnected } = useCommentSocket({
    taskId,
    onCommentAdded: (comment) => {
      console.log('New comment received via WebSocket:', comment);
      // Refresh task details to get updated comment list
      fetchTaskDetails();
    },
    onCommentReplied: (comment) => {
      console.log('New reply received via WebSocket:', comment);
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
    onCommentVoted: (comment) => {
      console.log('Comment voted via WebSocket:', comment);
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
      console.log('Fetching task details for taskId:', taskId);
      const taskData = await taskService.getTaskById(taskId);
      if (!taskData || !taskData.title) {
        console.error('Fetched task is missing required fields:', taskData);
      }
      console.log('Fetched task data:', taskData);
      
      // Fetch comments separately to get nested structure
      console.log('Fetching comments separately for nested structure...');
      const commentsData = await taskService.getTaskComments(taskId);
      console.log('Comments data received:', commentsData);
      
      setTask(taskData);
      setComments(commentsData);
      console.log('Comments set from separate endpoint:', commentsData);
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
      await taskService.createComment(taskId, newComment, [], undefined);
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

  // Helper function to update a comment and its replies recursively
  const updateCommentInTree = (comments: Comment[], targetId: string, updatedVotes: Record<string, string>): Comment[] => {
    return comments.map(comment => {
      if (comment._id === targetId || comment.id === targetId) {
        return { ...comment, votes: updatedVotes };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, targetId, updatedVotes)
        };
      }
      return comment;
    });
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
          {comments.map((comment, idx) => (
            <CommentItem
              key={comment.id || comment._id || idx}
              comment={comment}
              onCommentEdited={(updatedComment) => {
                console.log('Comment edited:', updatedComment);
                fetchTaskDetails();
              }}
              onCommentDeleted={(commentId) => {
                console.log('Comment deleted:', commentId);
                fetchTaskDetails();
              }}
              onCommentVoted={(updatedComment) => {
                console.log('Comment voted:', updatedComment);
                // Update the specific comment in the comments array (including nested replies)
                setComments(prevComments => 
                  updateCommentInTree(prevComments, updatedComment._id || updatedComment.id || '', updatedComment.votes || {})
                );
              }}
              onReplyAdded={(newReply) => {
                console.log('Reply added:', newReply);
                console.log('Calling fetchTaskDetails to refresh comments...');
                fetchTaskDetails();
              }}
              taskId={taskId}
            />
          ))}
        </div>
        <div className="mt-6">
          <CommentBox
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleAddComment}
            placeholder="Write your comment here..."
            label="Add Comment"
            rows={3}
            showCharacterCount={true}
            maxLength={1000}
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold">Attachments</h3>
        <div className="mt-2 space-y-4">
          {Array.isArray(task.attachments) && task.attachments.map((attachment, idx) => {
            const key = (attachment && typeof attachment === 'object' && attachment._id) || idx;
            if (attachment && typeof attachment === 'object' && (attachment.originalName || attachment.url)) {
              return (
                <div key={key} className="flex items-start justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-900">{attachment.originalName}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{attachment.uploadedAt ? new Date(attachment.uploadedAt).toLocaleString() : ''}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>{Math.round(attachment.size / 1024)} KB</span>
                      </span>
                    </div>
                    {attachment.mimeType?.startsWith('image/') && (
                      <div className="mt-4">
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block group"
                        >
                          <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <img
                              src={attachment.thumbnail || attachment.url}
                              alt={attachment.originalName}
                              className="max-w-[200px] max-h-[200px] object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* All users can download attachments */}
                    <AttachmentButton
                      onClick={() => handleDownloadAttachment(attachment._id)}
                      disabled={downloadingId === attachment._id}
                      loading={downloadingId === attachment._id}
                      variant="download"
                    >
                      {downloadingId === attachment._id ? 'Downloading...' : 'Download'}
                    </AttachmentButton>
                    {/* Only admins can delete attachments */}
                    {user?.role === 'admin' && (
                      <AttachmentButton
                        onClick={() => handleDeleteAttachment(attachment._id)}
                        variant="delete"
                      >
                        Delete
                      </AttachmentButton>
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
            <div className="flex items-center space-x-2">
              <AestheticSelect
                options={[
                  { value: '', label: 'Unassigned', icon: getUserIcon() },
                  ...availableUsers.map(user => ({
                    value: user.id || '',
                    label: getUserDisplayName(user),
                    icon: getUserIcon()
                  }))
                ]}
                value={selectedAssignee}
                onChange={setSelectedAssignee}
                placeholder="Select user"
                size="sm"
                variant="filled"
                className="w-48"
                showSearch={true}
              />
              <Button
                onClick={handleAssignTask}
                disabled={selectedAssignee === (task.assignee?.id || '')}
                variant="primary"
                size="sm"
              >
                Assign to
              </Button>
              {task.assignee && (
                <Button
                  onClick={handleRemoveAssignment}
                  variant="secondary"
                  size="sm"
                >
                  Remove Assignment
                </Button>
              )}
            </div>
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