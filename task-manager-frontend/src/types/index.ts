export interface Task {
  _id: string;
  title: string;
  description: string;
  category?: string;
  status: 'todo' | 'in-progress' | 'done' | 'late';
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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
  };
  overdueTasks: number;
}

export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
