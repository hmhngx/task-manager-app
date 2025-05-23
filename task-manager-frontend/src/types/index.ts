export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  category?: string;
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
