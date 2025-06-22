export interface Task {
  _id: string;
  title: string;
  description: string;
  category?: string;
  status: 'todo' | 'in-progress' | 'done' | 'late';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface TaskStats {
  totalTasks: number;
  statusCounts: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  priorityCounts: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  overdueTasks: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
