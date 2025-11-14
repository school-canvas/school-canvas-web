export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  actionUrl?: string;
  metadata?: any;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  ASSESSMENT = 'ASSESSMENT',
  ATTENDANCE = 'ATTENDANCE',
  GRADE = 'GRADE',
  MESSAGE = 'MESSAGE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  PAYMENT = 'PAYMENT',
  EVENT = 'EVENT',
  LIBRARY = 'LIBRARY',
  GENERAL = 'GENERAL'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface SendNotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  metadata?: any;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: NotificationType[];
  tenantId: string;
}
