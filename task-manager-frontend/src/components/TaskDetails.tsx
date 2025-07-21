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
import TaskAI from './TaskAI';
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
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
    setActionLoading(true);
    setActionError(null);
    console.log('🔄 User clicked "Request Assignment" button');
    console.log('📋 Task ID:', taskId);
    console.log('👤 Current user object:', user);
    console.log('⏰ Timestamp:', new Date().toISOString());
    
    try {
      console.log('📡 Sending task request to backend...');
      await taskService.requestTask(taskId);
      console.log('✅ Task request sent successfully');
      await fetchTaskDetails();
    } catch (error: any) {
      setActionError(error?.response?.data?.message || 'Failed to request task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async (requesterId: string) => {
    setActionLoading(true);
    setActionError(null);
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
    } catch (error: any) {
      setActionError(error?.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requesterId: string) => {
    setActionLoading(true);
    setActionError(null);
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
    } catch (error: any) {
      setActionError(error?.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedAssignee || user?.role !== 'admin') return;
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
    if (user?.role !== 'admin') return;
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
    if (user?.role !== 'admin') return;
    setActionLoading(true);
    try {
    await handleUpdateTask({ status: 'done' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsLate = async () => {
    if (user?.role !== 'admin') return;
    setActionLoading(true);
    try {
    await handleUpdateTask({ status: 'late' });
    } finally {
      setActionLoading(false);
    }
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
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-lg text-gray-500">Loading task details...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <span className="text-lg text-red-500">Task not found.</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="p-4">
        <TaskForm task={task} onSubmit={handleUpdateTask} onCancel={() => setIsEditing(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 rounded-2xl shadow-xl bg-white/90">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-indigo-700 mb-2 md:mb-0">{task.title}</h2>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Button onClick={() => setIsEditing(true)} variant="primary" className="transition-all duration-200 hover:scale-105">Edit</Button>
          )}
          <Button onClick={onClose} variant="outline" className="transition-all duration-200 hover:scale-105">Close</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Details Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Details</h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-gray-500">Type</dt>
              <dd className="flex items-center gap-2">
                {/* Add icon if available */}
                <span className="capitalize font-medium text-gray-700">{task.type}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Priority</dt>
              <dd className="flex items-center gap-2">
                <span className="capitalize font-medium text-gray-700">{task.priority}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Status</dt>
              <dd>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700`}>{task.status}</span>
              </dd>
            </div>
            {user?.role === 'admin' && (
              <div className="flex gap-3 mt-3">
                <Button 
                  onClick={handleMarkAsCompleted} 
                  variant="primary" 
                  disabled={actionLoading}
                  className="shadow-neon-green focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-all duration-200 hover:scale-105"
                >
                  {actionLoading ? 'Updating...' : 'Mark as Completed'}
                </Button>
                <Button 
                  onClick={handleMarkAsLate} 
                  variant="danger" 
                  disabled={actionLoading}
                  className="shadow-neon-red focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-all duration-200 hover:scale-105"
                >
                  {actionLoading ? 'Updating...' : 'Mark as Late'}
                </Button>
              </div>
            )}
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-gray-600">Assigned to:</span>
              <span className="font-medium">{task.assignee ? getUserDisplayName(task.assignee) : 'Unassigned'}</span>
            </div>
            
            {/* Request Assignment Button & Status Messages */}
            {user && user.role === 'user' && (
              <div className="mt-4">
                {getTaskRequestRestrictionMessage(task) ? (
                  <div className="text-sm text-red-500 flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded">⛔</span>
                    {getTaskRequestRestrictionMessage(task)}
                  </div>
                ) : task.creator.id === getUserId(user) ? (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">⚠️</span>
                    You cannot request your own task.
                  </div>
                ) : (task.assignee?.id || task.assignee?._id) === getUserId(user) ? (
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✔️</span>
                    You are already assigned to this task.
                  </div>
                ) : task.requesters?.some(requester => (requester.id || requester._id) === getUserId(user)) ? (
                  <div className="text-sm text-blue-600 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">ℹ️</span>
                    You have already requested this task.
                  </div>
                ) : canRequestTask(task) ? (
                  <Button 
                    onClick={handleRequestTask} 
                    variant="primary" 
                    className="w-full transition-all duration-200 hover:scale-105"
                    disabled={actionLoading}
                  >
                    Request Assignment
                  </Button>
                ) : null}
                {actionError && <div className="text-sm text-red-500 mt-2">{actionError}</div>}
              </div>
            )}
            
            {/* Pending Requests Section for Admins */}
            {user?.role === 'admin' && task.requesters && task.requesters.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Pending Requests ({task.requesters.length})</h4>
                <div className="space-y-2">
                  {task.requesters.map((requester) => (
                    <div key={requester.id || requester._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <UserAvatar user={requester} className="h-6 w-6 text-xs" />
                        <span className="text-sm font-medium">{getUserDisplayName(requester)}</span>
                      </div>
                      <div className="flex space-x-2">
                        {(requester.id || requester._id) && (
                          <>
                            <Button
                              onClick={() => handleApproveRequest((requester.id || requester._id) as string)}
                              variant="primary"
                              className="text-xs px-3 py-1"
                              disabled={actionLoading}
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectRequest((requester.id || requester._id) as string)}
                              variant="danger"
                              className="text-xs px-3 py-1"
                              disabled={actionLoading}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <dt className="text-xs text-gray-500">Deadline</dt>
              <dd>{task.deadline ? dayjs(task.deadline).format('MMM DD, YYYY HH:mm') : 'No deadline'}</dd>
            </div>
          </dl>
        </div>
        {/* Labels Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Labels</h3>
          <div className="flex flex-wrap gap-2">
            {task.labels.map((label) => (
              <span key={label} className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full transition-all duration-200 hover:bg-indigo-200 cursor-pointer">{label}</span>
            ))}
          </div>
        </div>
      </div>
      {/* Parent Task & Subtasks */}
      {task.parentTask && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Parent Task</h3>
          <p className="bg-gray-50 rounded px-3 py-2 inline-block">{task.parentTask.title}</p>
        </div>
      )}
      {task.subtasks.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-lg mb-2">Subtasks</h3>
          <ul className="mt-2 space-y-2">
            {task.subtasks.map((subtask, idx) => (
              <li key={subtask.id || subtask._id || idx} className="p-2 bg-gray-50 rounded shadow-sm">{subtask.title}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Comments Section */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-2">Comments</h3>
        <div className="max-h-64 overflow-y-auto pr-2 space-y-4 bg-gray-50 rounded-lg p-4">
          {comments.map((comment, idx) => (
            <CommentItem
              key={comment.id || comment._id || idx}
              comment={comment}
              onCommentEdited={(updatedComment) => { fetchTaskDetails(); }}
              onCommentDeleted={(commentId) => { fetchTaskDetails(); }}
              onCommentVoted={(updatedComment) => {
                setComments(prevComments => updateCommentInTree(prevComments, updatedComment._id || updatedComment.id || '', updatedComment.votes || {}));
              }}
              onReplyAdded={(newReply) => { fetchTaskDetails(); }}
              taskId={taskId}
            />
          ))}
        </div>
        <div className="mt-4">
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
      {/* AI Assistant Section */}
      <TaskAI task={task} />
      
      {/* Attachments Section */}
      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-2">Attachments</h3>
        
        {/* File Upload Section - Only for Admins */}
        {user?.role === 'admin' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Upload Attachment</h4>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                id="file-upload"
                aria-label="Choose file to upload"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile}
                variant="primary"
                className="px-4 py-2 text-sm"
              >
                Upload
              </Button>
            </div>
            {selectedFile && (
              <p className="text-xs text-gray-600 mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {Array.isArray(task.attachments) && task.attachments.map((attachment, idx) => {
            const key = (attachment && typeof attachment === 'object' && attachment._id) || idx;
            if (attachment && typeof attachment === 'object' && (attachment.originalName || attachment.url)) {
              return (
                <div key={key} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300">
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
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="inline-block group">
                          <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <img src={attachment.thumbnail || attachment.url} alt={attachment.originalName} className="max-w-[200px] max-h-[200px] object-cover" />
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
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <AttachmentButton onClick={() => handleDownloadAttachment(attachment._id)} disabled={downloadingId === attachment._id} loading={downloadingId === attachment._id} variant="download">
                      {downloadingId === attachment._id ? 'Downloading...' : 'Download'}
                    </AttachmentButton>
                    {user?.role === 'admin' && (
                      <AttachmentButton onClick={() => handleDeleteAttachment(attachment._id)} variant="delete">Delete</AttachmentButton>
                    )}
                  </div>
                </div>
              );
            }
            return (
              <div key={key} className="flex items-start justify-between bg-gray-50 p-4 rounded-lg">
                <span>Attachment</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails; 