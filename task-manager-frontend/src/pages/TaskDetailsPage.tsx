import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskDetails from '../components/TaskDetails';

const TaskDetailsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/dashboard');
  };

  if (!taskId) {
    return <div>Task ID not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <TaskDetails taskId={taskId} onClose={handleClose} />
    </div>
  );
};

export default TaskDetailsPage; 