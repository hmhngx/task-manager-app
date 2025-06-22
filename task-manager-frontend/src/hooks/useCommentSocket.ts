import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { Comment } from '../types';

interface UseCommentSocketOptions {
  taskId: string;
  onCommentAdded?: (comment: Comment) => void;
  onCommentEdited?: (comment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

export const useCommentSocket = (options: UseCommentSocketOptions) => {
  const { taskSocket } = useWebSocket();
  const [comments, setComments] = useState<Comment[]>([]);
  const { taskId, onCommentAdded, onCommentEdited, onCommentDeleted } = options;

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

    // Listen for comment events
    taskSocket.on('comment:added', handleCommentAdded);
    taskSocket.on('comment:edited', handleCommentEdited);
    taskSocket.on('comment:deleted', handleCommentDeleted);

    return () => {
      taskSocket.off('comment:added', handleCommentAdded);
      taskSocket.off('comment:edited', handleCommentEdited);
      taskSocket.off('comment:deleted', handleCommentDeleted);
    };
  }, [taskSocket, taskId, onCommentAdded, onCommentEdited, onCommentDeleted]);

  return {
    comments,
    setComments,
    isConnected: !!taskSocket?.connected,
  };
}; 