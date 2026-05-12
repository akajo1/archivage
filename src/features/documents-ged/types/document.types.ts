// Types for Documents Management

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
  changeSummary?: string;
}

export interface DocumentMetadata {
  fileSize?: number;
  mimeType?: string;
  pages?: number;
  language?: string;
}

export interface Document {
  id: string;
  title: string;
  reference?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  status: 'draft' | 'received' | 'in_review' | 'validated' | 'archived' | 'courrier_prepared' | 'courrier_sent';
  documentType?: string;
  senderDepartment?: string;
  senderName?: string;
  receiptDate?: string;
  registrationNumber?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  badge?: Badge;
  badgeId: string;
  confidentiality?: Confidentiality;
  confidentialityId: string;
  attachments: DocumentAttachment[];
  versions: DocumentVersion[];
  metadata?: DocumentMetadata;
  updatedAt: string;
}

export interface DocumentAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: 'critique' | 'normal' | 'faible';
  color: string;
}

export interface Confidentiality {
  id: string;
  level: 'public' | 'interne' | 'confidentiel' | 'secret';
}

// DTOs
export interface CreateDocumentPayload {
  title: string;
  description?: string;
  documentType?: string;
  badgeId: string;
  confidentialityId: string;
  file?: File;
}

export interface UpdateDocumentPayload {
  title?: string;
  description?: string;
  documentType?: string;
  badgeId?: string;
  confidentialityId?: string;
  status?: string;
}

export interface ArchiveDocumentPayload {
  reason: string;
  retentionYears?: number;
}

export interface DocumentListFilters {
  status?: string;
  badgeId?: string;
  confidentialityId?: string;
  search?: string;
  createdByMe?: boolean;
  page?: number;
  limit?: number;
}

export interface DocumentListResponse {
  items: Document[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

