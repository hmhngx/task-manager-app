export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: Date;
  read: boolean;
  priority: NotificationPriority;
  userId?: string;
  taskId?: string;
}

export enum NotificationType {
  TASK_CREATED = 'task_created',
  TASK_UPDATED = 'task_updated',
  TASK_ASSIGNED = 'task_assigned',
  TASK_ASSIGNMENT_REMOVED = 'task_assignment_removed',
  TASK_STATUS_CHANGED = 'task_status_changed',
  TASK_DELETED = 'task_deleted',
  TASK_REQUEST = 'task_request',
  TASK_REQUEST_CONFIRMATION = 'task_request_confirmation',
  TASK_REQUEST_RESPONSE = 'task_request_response',
  COMMENT_ADDED = 'comment_added',
  COMMENT_REPLIED = 'comment_replied',
  COMMENT_EDITED = 'comment_edited',
  COMMENT_DELETED = 'comment_deleted',
  PARTICIPANT_ADDED = 'participant_added',
  PARTICIPANT_REMOVED = 'participant_removed',
  DEADLINE_APPROACHING = 'deadline_approaching',
  TASK_OVERDUE = 'task_overdue',
  DEADLINE_CHANGED = 'deadline_changed',
  ATTACHMENT_UPLOADED = 'attachment_uploaded',
  ATTACHMENT_DELETED = 'attachment_deleted',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface ServerToClientEvents {
  notification: (notification: NotificationPayload) => void;
  'task:created': (data: { task: any; creator: string; timestamp: Date }) => void;
  'task:updated': (data: { task: any; updater: string; changes: any; timestamp: Date }) => void;
  'task:assigned': (data: {
    task: any;
    assignee: string;
    assigner: string;
    timestamp: Date;
  }) => void;
  'task:assignment_removed': (data: {
    task: any;
    removedAssignee: string;
    remover: string;
    timestamp: Date;
  }) => void;
  'task:status_changed': (data: {
    task: any;
    oldStatus: string;
    newStatus: string;
    updater: string;
    timestamp: Date;
  }) => void;
  'task:deleted': (data: { taskId: string; deleter: string; timestamp: Date }) => void;
  'comment:added': (data: {
    comment: any;
    taskId: string;
    author: string;
    timestamp: Date;
  }) => void;
  'comment:replied': (data: {
    comment: any;
    taskId: string;
    author: string;
    parentCommentId: string;
    timestamp: Date;
  }) => void;
  'comment:edited': (data: {
    comment: any;
    taskId: string;
    editor: string;
    timestamp: Date;
  }) => void;
  'comment:deleted': (data: {
    commentId: string;
    taskId: string;
    deleter: string;
    timestamp: Date;
  }) => void;
  'attachment:uploaded': (data: {
    attachment: any;
    taskId: string;
    uploader: string;
    timestamp: Date;
  }) => void;
  'attachment:deleted': (data: {
    attachmentId: string;
    taskId: string;
    deleter: string;
    fileName: string;
    timestamp: Date;
  }) => void;
  'admin:task_activity': (data: { type: string; task: any; user: string; timestamp: Date }) => void;
  'admin:task_request': (data: { task: any; requester: string; timestamp: Date }) => void;
  'deadline:reminder': (data: { task: any; timestamp: Date }) => void;
  'overdue:alert': (data: { task: any; timestamp: Date }) => void;
}

export interface ClientToServerEvents {
  'subscribe:task': (taskId: string) => void;
  'unsubscribe:task': (taskId: string) => void;
  'subscribe:all-tasks': () => void;
  'subscribe:notifications': () => void;
  'mark:read': (notificationId: string) => void;
  'subscribe:dashboard': () => void;
  'subscribe:user-activity': () => void;
  'subscribe:stats': () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
  };
}
