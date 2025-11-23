export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  status: MessageStatus;
  attachments?: Attachment[];
  parentMessageId?: string;
  editedAt?: string;
  deletedAt?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  senderName?: string;
  senderProfilePicture?: string;
  isRead?: boolean;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  EDITED = 'EDITED',
  DELETED = 'DELETED'
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  createdBy: string;
  lastMessageAt?: string;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  lastMessage?: string;
  unreadCount?: number;
  participantNames?: string[];
}

export interface Attachment {
  id: string;
  messageId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt?: string;
}

export interface FileAttachment {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}

export interface SendMessageRequest {
  threadId?: string;
  recipientIds?: string[];
  subject?: string;
  content: string;
  messageType?: MessageType;
}

export interface ComposeMessageRequest {
  recipientIds: string[];
  subject: string;
  content: string;
  attachments?: File[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: TargetAudience[];
  priority: AnnouncementPriority;
  validFrom: string;
  validUntil?: string;
  createdBy: string;
  status: AnnouncementStatus;
  tenantId: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  createdByName?: string;
}

export enum TargetAudience {
  ALL = 'ALL',
  STUDENTS = 'STUDENTS',
  TEACHERS = 'TEACHERS',
  PARENTS = 'PARENTS',
  STAFF = 'STAFF'
}

export enum AnnouncementPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  targetAudience: TargetAudience[];
  priority: AnnouncementPriority;
  validFrom: string;
  validUntil?: string;
}
