export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 