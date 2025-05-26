export interface Task {
  _id: string;
  title: string;
  description: string;
  category?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  category?: string;
  deadline?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  category?: string;
  completed?: boolean;
  deadline?: string;
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
