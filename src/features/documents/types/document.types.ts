import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import type { User } from '../../auth/types/auth.types';

export interface DocumentAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  mimeType: string | null;
  createdAt: string;
}

export interface Document {
  id: string;
  title: string;
  reference: string | null;
  description: string | null;
  content: string | null;
  fileUrl: string | null;
  createdAt: string;
  createdBy: User;
  badge: Badge;
  confidentiality: Confidentiality;
  attachments: DocumentAttachment[];
}

export interface CreateDocumentPayload {
  title: string;
  reference?: string;
  description?: string;
  content?: string;
  badge_id: string;
  confidentiality_id: string;
  file?: File;
  annexes?: File[];
}

export type UpdateDocumentPayload = Partial<CreateDocumentPayload>;

export interface DocumentFilters {
  badge_id?: string;
  confidentiality_id?: string;
  search?: string;
}
