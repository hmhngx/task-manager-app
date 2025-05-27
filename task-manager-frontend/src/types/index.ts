export interface Task {
  _id: string;
  title: string;
  description: string;
  category?: string;
  deadline: Date;
  status: 'todo' | 'done' | 'late';
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStats {
  todo: number;
  done: number;
  late: number;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  category?: string;
  deadline: Date;
  status: 'todo' | 'done' | 'late';
  userId?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  category?: string;
  deadline?: Date;
  status?: 'todo' | 'done' | 'late';
}

export interface User {
  id: string;
  username: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}
