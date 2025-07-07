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
    
    if (!user) return;
    const userId = getUserId(user);
    if (!userId) return;
    
    // Create optimistic update
    const currentVote = comment.votes?.[userId];
    let optimisticVotes = { ...(comment.votes || {}) };
    
    if (currentVote === voteType) {
      // Remove vote if clicking the same type
      delete optimisticVotes[userId];
    } else {
      // Set new vote
      optimisticVotes[userId] = voteType;
    }
    
    // Create optimistic comment update
    const optimisticComment = { ...comment, votes: optimisticVotes };
    onCommentVoted(optimisticComment);
    
    setIsVoting(true);
    try {
      const updatedComment = await voteCommentApi(comment._id || comment.id || '', voteType);
      // Update with actual server response
      onCommentVoted(updatedComment);
    } catch (error) {
      console.error('Error voting on comment:', error);
      // Revert to original state on error
      onCommentVoted(comment);
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
    <div className={`${isReply ? 'ml-8' : ''} bg-gradient-to-r from-white to-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-gray-300`}>
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
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded-full font-medium shadow-sm">edited</span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Vote Buttons */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleVote('up')}
                  disabled={isVoting}
                  className={`p-2 rounded-md transition-all duration-200 transform hover:scale-110 ${
                    currentVote === 'up' 
                      ? 'text-green-600 bg-green-100 shadow-sm' 
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title="Upvote"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <span className={`text-sm font-bold min-w-[24px] text-center px-1 ${
                  voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {voteCount}
                </span>
                
                <button
                  onClick={() => handleVote('down')}
                  disabled={isVoting}
                  className={`p-2 rounded-md transition-all duration-200 transform hover:scale-110 ${
                    currentVote === 'down' 
                      ? 'text-red-600 bg-red-100 shadow-sm' 
                      : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
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
                  className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 text-blue-500 hover:text-blue-600"
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
                  className="p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 text-blue-500 hover:text-blue-600"
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
                  className="p-2 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-105 text-red-500 hover:text-red-600"
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
              <div className="space-y-3 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm">
                <label htmlFor={`edit-comment-${comment._id || comment.id}`} className="block text-sm font-semibold text-blue-800">
                  Edit Comment
                </label>
                <textarea
                  id={`edit-comment-${comment._id || comment.id}`}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  rows={3}
                  placeholder="Edit your comment..."
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 leading-relaxed text-base">{comment.content}</p>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 space-y-3 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl shadow-sm">
              <label htmlFor={`reply-comment-${comment._id || comment.id}`} className="block text-sm font-semibold text-blue-800">
                Reply to Comment
              </label>
              <textarea
                id={`reply-comment-${comment._id || comment.id}`}
                value={replyContent}
                onChange={(e) => {
                  console.log('Reply content changed:', e.target.value);
                  setReplyContent(e.target.value);
                }}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                rows={2}
                placeholder="Write your reply..."
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    console.log('Reply button clicked, content:', replyContent);
                    handleReply();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-sm font-medium"
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
                  className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md text-sm font-medium"
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
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-all duration-200 mb-3 p-2 rounded-lg hover:bg-blue-50 transform hover:scale-105"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${repliesCollapsed ? 'rotate-90' : '-rotate-90'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium">
                  {repliesCollapsed 
                    ? `Show ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`
                    : `Hide ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`
                  }
                </span>
              </button>
              
              {/* Collapsible Replies Content */}
              {!repliesCollapsed && (
                <div className="space-y-3 border-l-2 border-blue-200 pl-6 bg-gradient-to-r from-blue-50/30 to-transparent rounded-r-lg p-4">
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