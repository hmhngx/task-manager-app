import { useEffect, useRef } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

interface AttachmentSocketCallbacks {
  onAttachmentUploaded?: (data: {
    attachment: any;
    taskId: string;
    uploader: string;
    timestamp: Date;
  }) => void;
  onAttachmentDeleted?: (data: {
    attachmentId: string;
    taskId: string;
    deleter: string;
    fileName: string;
    timestamp: Date;
  }) => void;
}

interface UseAttachmentSocketProps {
  taskId: string;
  callbacks: AttachmentSocketCallbacks;
}

export const useAttachmentSocket = ({ taskId, callbacks }: UseAttachmentSocketProps) => {
  const { taskSocket, isConnected } = useWebSocket();
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when callbacks change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!taskSocket || !isConnected || !taskId) {
      return;
    }

    console.log('🔗 Setting up attachment WebSocket listeners for task:', taskId);

    // Handle attachment uploaded event
    const handleAttachmentUploaded = (data: any) => {
      console.log('📤 Attachment uploaded event received:', data);
      console.log('📋 Task ID from event:', data.taskId);
      console.log('📋 Current task ID:', taskId);
      
      if (data.taskId === taskId && callbacksRef.current.onAttachmentUploaded) {
        console.log('✅ Processing attachment uploaded event for current task');
        callbacksRef.current.onAttachmentUploaded(data);
      } else {
        console.log('⏭️ Skipping attachment uploaded event - not for current task or no callback');
      }
    };

    // Handle attachment deleted event
    const handleAttachmentDeleted = (data: any) => {
      console.log('🗑️ Attachment deleted event received:', data);
      console.log('📋 Task ID from event:', data.taskId);
      console.log('📋 Current task ID:', taskId);
      
      if (data.taskId === taskId && callbacksRef.current.onAttachmentDeleted) {
        console.log('✅ Processing attachment deleted event for current task');
        callbacksRef.current.onAttachmentDeleted(data);
      } else {
        console.log('⏭️ Skipping attachment deleted event - not for current task or no callback');
      }
    };

    // Add event listeners
    taskSocket.on('attachment:uploaded', handleAttachmentUploaded);
    taskSocket.on('attachment:deleted', handleAttachmentDeleted);

    console.log('✅ Attachment WebSocket listeners set up successfully');

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up attachment WebSocket listeners for task:', taskId);
      taskSocket.off('attachment:uploaded', handleAttachmentUploaded);
      taskSocket.off('attachment:deleted', handleAttachmentDeleted);
    };
  }, [taskSocket, isConnected, taskId]);

  return {
    isConnected,
  };
}; 