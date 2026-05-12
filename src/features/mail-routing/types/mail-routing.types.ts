// Types for Mail Routing System

export enum MailRoutingStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  FORWARDED = 'forwarded',
  INTERVENING = 'intervening',
  AWAITING_VERIFICATION = 'awaiting_verification',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  RETURNED = 'returned',
  COMPLETED = 'completed',
}

export enum MailActionType {
  FORWARD = 'forward',
  ADD_CC = 'add_cc',
  ASSIGN = 'assign',
  COMMENT = 'comment',
  VERIFY = 'verify',
  REJECT = 'reject',
  RETURN_TO_SENDER = 'return_to_sender',
  MARK_COMPLETE = 'mark_complete',
  ARCHIVE = 'archive',
}

export enum ParticipantRole {
  RECEIVER = 'receiver',
  ASSIGNEE = 'assignee',
  REVIEWER = 'reviewer',
  APPROVER = 'approver',
  CC = 'cc',
  OBSERVER = 'observer',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  RECEIVED = 'received',
  IN_REVIEW = 'in_review',
  VALIDATED = 'validated',
  ARCHIVED = 'archived',
  COURRIER_PREPARED = 'courrier_prepared',
  COURRIER_SENT = 'courrier_sent',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  departmentId?: string;
}

export interface Document {
  id: string;
  title: string;
  reference?: string;
  description?: string;
  status: DocumentStatus;
  fileUrl?: string;
  createdAt: string;
  createdBy: User;
  documentType?: string;
  senderDepartment?: string;
  senderName?: string;
  receiptDate?: string;
  registrationNumber?: string;
}

export interface MailParticipant {
  id: string;
  userId: string;
  user: User;
  role: ParticipantRole;
  joinedAt: string;
  completedAt?: string;
}

export interface MailRoutingAction {
  id: string;
  actionType: MailActionType;
  actor: User;
  targetUser?: User;
  previousStatus?: MailRoutingStatus;
  newStatus?: MailRoutingStatus;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MailComment {
  id: string;
  body: string;
  author: User;
  parentCommentId?: string;
  replies?: MailComment[];
  createdAt: string;
  updatedAt: string;
}

export interface MailRouting {
  id: string;
  documentId: string;
  document: Document;
  status: MailRoutingStatus;
  initiatedBy: User;
  currentAssignee?: User;
  dueDate?: string;
  notes?: string;
  participants: MailParticipant[];
  actions: MailRoutingAction[];
  comments: MailComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  type: 'action' | 'comment';
  timestamp: string;
  [key: string]: unknown;
}

// DTOs for API requests
export interface InitializeRoutingPayload {
  documentId: string;
  dueDate?: string;
  notes?: string;
}

export interface ForwardRoutingPayload {
  receiverId: string;
  ccUserIds?: string[];
  note?: string;
}

export interface VerifyRoutingPayload {
  note?: string;
}

export interface RejectRoutingPayload {
  rejectionReason: string;
}

export interface AddParticipantPayload {
  userId: string;
  role: ParticipantRole | string;
}

export interface AddCommentPayload {
  body: string;
  parentCommentId?: string;
}

export interface CompleteRoutingPayload {
  note?: string;
  archive?: boolean;
}

