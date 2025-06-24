export interface WebSocketUser {
  _id: string;
  username: string;
  email: string;
  role: string;
}

export interface SocketData {
  user: WebSocketUser;
}

export interface TaskData {
  _id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  labels: string[];
  deadline?: Date;
  status: string;
  userId: string;
  assignee?: string;
  creator: string;
  parentTask?: string;
  subtasks: string[];
  comments: string[];
  attachments: string[];
  progress: number;
  watchers?: string[];
  requesters?: string[];
  workflow?: {
    status: string;
    transitions: {
      from: string;
      to: string;
      conditions: string[];
    }[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommentData {
  _id: string;
  content: string;
  author: string;
  task: string;
  mentions: string[];
  attachments: string[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskChanges {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  deadline?: Date;
  assignee?: string;
  progress?: number;
  labels?: string[];
  [key: string]: any;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
  priority: string;
}

export interface TaskActivityData {
  type: string;
  task: TaskData;
  user: string;
  timestamp: Date;
  changes?: TaskChanges;
  oldStatus?: string;
  newStatus?: string;
  assignee?: string;
  assigner?: string;
  requester?: string;
  admin?: string;
  approved?: boolean;
}

export interface TaskRequestData {
  task: TaskData;
  requester: string;
  timestamp: Date;
}

export interface DeadlineReminderData {
  task: TaskData;
  timestamp: Date;
}

export interface OverdueAlertData {
  task: TaskData;
  timestamp: Date;
}
