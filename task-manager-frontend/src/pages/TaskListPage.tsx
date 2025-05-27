import React, { useState } from 'react';
import TaskList from '../components/TaskList';
import { Task } from '../types';

const TaskListPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    deadline: null as Date | null,
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.description || !newTask.deadline) {
      return;
    }

    const task: Task = {
      _id: Math.random().toString(36).substr(2, 9), // Temporary ID
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      deadline: newTask.deadline,
      status: 'todo',
      userId: "temp-user-id",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      category: '',
      deadline: null,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TaskList selectedDate={selectedDate} />
    </div>
  );
};

export default TaskListPage;
