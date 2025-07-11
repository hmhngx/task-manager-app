export enum TaskStatus {
  TODO = 'todo',
  PENDING_APPROVAL = 'pending_approval',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  LATE = 'late',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TaskType {
  TASK = 'task',
  BUG = 'bug',
  FEATURE = 'feature',
  SUBTASK = 'subtask',
}

export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id?: string;
  _id?: string;
  content: string;
  author: User;
  createdAt: Date;
  isEdited: boolean;
  parentComment?: string;
  replies?: Comment[];
  votes?: Record<string, string>; // userId -> "up" | "down"
}

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  thumbnail?: string;
  url: string;
  uploadedBy: User;
  uploadedAt: Date;
  task?: string;
  comment?: string;
}

export interface Task {
  _id?: string;
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  labels: string[];
  deadline?: Date;
  userId: string;
  assignee?: User;
  creator: User;
  parentTask?: Task;
  subtasks: Task[];
  comments: Comment[];
  attachments: Attachment[];
  progress: number;
  watchers: User[];
  requesters: User[];
  workflow?: {
    status: string;
    transitions: {
      from: string;
      to: string;
      conditions: string[];
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStats {
  todo: number;
  done: number;
  late: number;
  in_progress: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  labels?: string[];
  deadline?: Date;
  assignee?: string | null;
  parentTask?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  labels?: string[];
  deadline?: Date;
  assignee?: string | null;
  parentTask?: string;
  progress?: number;
}

export interface WorkflowTransition {
  from: string;
  to: string;
  allowedRoles: string[];
  conditions: Record<string, any>;
  requiresApproval: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  statuses: string[];
  transitions: WorkflowTransition[];
  isActive: boolean;
  createdBy: User;
  approvers: User[];
  createdAt: Date;
  updatedAt: Date;
}
