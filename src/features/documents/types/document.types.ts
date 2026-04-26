import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import type { User } from '../../auth/types/auth.types';

export interface Document {
  id: string;
  title: string;
  content: string | null;
  fileUrl: string | null;
  createdAt: string;
  createdBy: User;
  badge: Badge;
  confidentiality: Confidentiality;
}

export interface CreateDocumentPayload {
  title: string;
  content?: string;
  badge_id: string;
  confidentiality_id: string;
  file?: File;
}

export type UpdateDocumentPayload = Partial<CreateDocumentPayload>;

export interface DocumentFilters {
  badge_id?: string;
  confidentiality_id?: string;
  search?: string;
}

