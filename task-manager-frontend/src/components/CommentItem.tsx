import React, { useState } from 'react';
import { Comment } from '../types/Task';
import UserAvatar from './UserAvatar';
import taskService, { voteComment as voteCommentApi } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import { getUserId } from '../types/user';

interface CommentItemProps {
  comment: Comment;
  onCommentEdited: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onCommentVoted: (comment: Comment) => void;
  onReplyAdded?: (comment: Comment) => void;
  taskId?: string;
  isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onCommentEdited,
  onCommentDeleted,
  onCommentVoted,
  onReplyAdded,
  taskId,
  isReply = false,
}) => {
  console.log('CommentItem rendered with:', { taskId, commentId: comment._id || comment.id, isReply });
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [repliesCollapsed, setRepliesCollapsed] = useState(false);

  // Fallback user for authorData
  const fallbackUser = {
    _id: '',
    id: '',
    name: 'Unknown User',
    username: 'Unknown User',
    email: '',
    role: 'user' as 'user',
    createdAt: '',
    updatedAt: '',
  };

  const authorData = typeof comment.author === 'object' && comment.author !== null
    ? comment.author
    : fallbackUser;

  const currentUserId = user ? getUserId(user) : '';
  const authorId = typeof comment.author === 'object' && comment.author !== null ? getUserId(comment.author) : comment.author;
  const isAuthor = currentUserId === authorId;
  const canEdit = isAuthor;
  const canDelete = isAuthor || user?.role === 'admin';

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    
    try {
      const updatedComment = await taskService.updateComment(comment._id || comment.id || '', editContent);
      onCommentEdited(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteComment(comment._id || comment.id || '');
      onCommentDeleted(comment._id || comment.id || '');
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !taskId) return;
    
    console.log('Creating reply:', {
      taskId,
      content: replyContent,
      parentCommentId: comment._id || comment.id,
      comment
    });
    
    try {
      const newReply = await taskService.createComment(
        taskId,
        replyContent,
        [],
        comment._id || comment.id || ''
      );
      setReplyContent('');
      setIsReplying(false);
      console.log('Calling onReplyAdded callback...');
      onReplyAdded?.(newReply);
      console.log('onReplyAdded callback called');
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      const updatedComment = await voteCommentApi(comment._id || comment.id || '', voteType);
      onCommentVoted(updatedComment);
    } catch (error) {
      console.error('Error voting on comment:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const getCurrentVote = () => {
    if (!user || !comment.votes) return null;
    const userId = getUserId(user);
    return comment.votes[userId] || null;
  };

  const getVoteCount = () => {
    if (!comment.votes) return 0;
    const upvotes = Object.values(comment.votes).filter(vote => vote === 'up').length;
    const downvotes = Object.values(comment.votes).filter(vote => vote === 'down').length;
    return upvotes - downvotes;
  };

  const currentVote = getCurrentVote();
  const voteCount = getVoteCount();

  return (
    <div className={`${isReply ? 'ml-8' : ''} bg-gray-50 p-4 rounded-lg border border-gray-200`}>
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <UserAvatar user={authorData} className="h-8 w-8" />
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
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Vote Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleVote('up')}
                  disabled={isVoting}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    currentVote === 'up' ? 'text-green-600' : 'text-gray-500'
                  }`}
                  title="Upvote"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                  {voteCount}
                </span>
                
                <button
                  onClick={() => handleVote('down')}
                  disabled={isVoting}
                  className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                    currentVote === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}
                  title="Downvote"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Reply Button */}
              {!isReply && (
                <button
                  onClick={() => {
                    console.log('Reply button clicked for comment:', comment._id || comment.id);
                    setIsReplying(!isReplying);
                  }}
                  className="text-blue-500 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors text-sm"
                  title="Reply to comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
              )}

              {/* Edit Button */}
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors text-sm"
                  title="Edit comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}

              {/* Delete Button */}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors text-sm"
                  title="Delete comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-2">
            {isEditing ? (
              <div className="space-y-2">
                <label htmlFor={`edit-comment-${comment._id || comment.id}`}>Edit Comment</label>
                <textarea
                  id={`edit-comment-${comment._id || comment.id}`}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Edit your comment..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleEdit}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 leading-relaxed">{comment.content}</p>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 space-y-2 border-2 border-blue-200 bg-blue-50 p-3 rounded">
              <label htmlFor={`reply-comment-${comment._id || comment.id}`}>Reply to Comment</label>
              <textarea
                id={`reply-comment-${comment._id || comment.id}`}
                value={replyContent}
                onChange={(e) => {
                  console.log('Reply content changed:', e.target.value);
                  setReplyContent(e.target.value);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Write your reply..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    console.log('Reply button clicked, content:', replyContent);
                    handleReply();
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  disabled={!replyContent.trim()}
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    console.log('Cancel reply clicked');
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {/* Replies Toggle Button */}
              <button
                onClick={() => setRepliesCollapsed(!repliesCollapsed)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors mb-3"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${repliesCollapsed ? 'rotate-90' : '-rotate-90'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span>
                  {repliesCollapsed 
                    ? `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`
                    : `Hide ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`
                  }
                </span>
              </button>
              
              {/* Collapsible Replies Content */}
              {!repliesCollapsed && (
                <div className="space-y-3 border-l-2 border-gray-200 pl-4">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply._id || reply.id}
                      comment={reply}
                      onCommentEdited={onCommentEdited}
                      onCommentDeleted={onCommentDeleted}
                      onCommentVoted={onCommentVoted}
                      onReplyAdded={onReplyAdded}
                      taskId={taskId}
                      isReply={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 