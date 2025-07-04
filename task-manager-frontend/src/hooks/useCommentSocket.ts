import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Comment } from '../types';

interface UseCommentSocketOptions {
  taskId: string;
  onCommentAdded?: (comment: Comment) => void;
  onCommentReplied?: (comment: Comment) => void;
  onCommentEdited?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
  onCommentVoted?: (comment: Comment) => void;
}

export const useCommentSocket = (options: UseCommentSocketOptions) => {
  const { taskSocket } = useWebSocket();
  const [comments, setComments] = useState<Comment[]>([]);
  const { taskId, onCommentAdded, onCommentReplied, onCommentEdited, onCommentDeleted, onCommentVoted } = options;

  // Handle comment events
  useEffect(() => {
    if (!taskSocket) return;

    const handleCommentAdded = (data: { 
      comment: Comment; 
      taskId: string; 
      author: string; 
      timestamp: string 
    }) => {
      console.log('Comment added via WebSocket:', data);
      if (data.taskId === taskId) {
        setComments(prev => [data.comment, ...prev]);
        onCommentAdded?.(data.comment);
      }
    };

    const handleCommentReplied = (data: { 
      comment: Comment; 
      taskId: string; 
      author: string; 
      parentCommentId: string;
      timestamp: string 
    }) => {
      console.log('Comment replied via WebSocket:', data);
      if (data.taskId === taskId) {
        setComments(prev => [data.comment, ...prev]);
        onCommentReplied?.(data.comment);
      }
    };

    const handleCommentEdited = (data: { 
      comment: Comment; 
      taskId: string; 
      editor: string; 
      timestamp: string 
    }) => {
      console.log('Comment edited via WebSocket:', data);
      if (data.taskId === taskId) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === data.comment._id
              ? data.comment 
              : comment
          )
        );
        onCommentEdited?.(data.comment);
      }
    };

    const handleCommentDeleted = (data: { 
      commentId: string; 
      taskId: string; 
      deleter: string; 
      timestamp: string 
    }) => {
      console.log('Comment deleted via WebSocket:', data);
      if (data.taskId === taskId) {
        setComments(prev => 
          prev.filter(comment => 
            comment._id !== data.commentId
          )
        );
        onCommentDeleted?.(data.commentId);
      }
    };

    const handleCommentVoted = (data: { 
      comment: Comment; 
      taskId: string; 
      voter: string; 
      voteType: string;
      timestamp: string 
    }) => {
      console.log('Comment voted via WebSocket:', data);
      if (data.taskId === taskId) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === data.comment._id
              ? data.comment 
              : comment
          )
        );
        onCommentVoted?.(data.comment);
      }
    };

    // Listen for comment events
    taskSocket.on('comment:added', handleCommentAdded);
    taskSocket.on('comment:replied', handleCommentReplied);
    taskSocket.on('comment:edited', handleCommentEdited);
    taskSocket.on('comment:deleted', handleCommentDeleted);
    taskSocket.on('comment:voted', handleCommentVoted);

    return () => {
      taskSocket.off('comment:added', handleCommentAdded);
      taskSocket.off('comment:replied', handleCommentReplied);
      taskSocket.off('comment:edited', handleCommentEdited);
      taskSocket.off('comment:deleted', handleCommentDeleted);
      taskSocket.off('comment:voted', handleCommentVoted);
    };
      }, [taskSocket, taskId, onCommentAdded, onCommentReplied, onCommentEdited, onCommentDeleted, onCommentVoted]);

  return {
    comments,
    setComments,
    isConnected: !!taskSocket?.connected,
  };
}; 