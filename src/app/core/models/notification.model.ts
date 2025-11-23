export interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: string;
  deliveryStatus: string;
  createdAt?: string;
}

export interface NotificationRecipient {
  id: string;
  notificationId: string;
  recipientId: string;
  isRead: boolean;
  readAt?: string;
  deliveryStatus: 'PENDING' | 'DELIVERED' | 'FAILED';
  deliveredAt?: string;
  createdAt: string;
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
  notificationCategory: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  createdAt?: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  deviceType: 'ANDROID' | 'IOS' | 'WEB';
  deviceName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export interface RegisterDeviceRequest {
  token: string;
  deviceType: 'ANDROID' | 'IOS' | 'WEB';
  deviceName?: string;
}
