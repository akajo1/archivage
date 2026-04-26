import apiClient from '../../../shared/utils/apiClient';
import type { Document, CreateDocumentPayload, UpdateDocumentPayload, DocumentFilters } from '../types/document.types';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const normalizeDocument = (document: Document): Document => ({
  ...document,
  fileUrl: document.fileUrl
    ? document.fileUrl.startsWith('http')
      ? document.fileUrl
      : `${apiBaseUrl}${document.fileUrl}`
    : null,
});

export const documentService = {
  getAll: async (filters?: DocumentFilters): Promise<Document[]> => {
    const { data } = await apiClient.get<Document[]>('/documents', { params: filters });
    return data.map(normalizeDocument);
  },
  getById: async (id: string): Promise<Document> => {
    const { data } = await apiClient.get<Document>(`/documents/${id}`);
    return normalizeDocument(data);
  },
  create: async (payload: CreateDocumentPayload): Promise<Document> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    if (payload.content) formData.append('content', payload.content);
    formData.append('badge_id', payload.badge_id);
    formData.append('confidentiality_id', payload.confidentiality_id);
    if (payload.file) formData.append('file', payload.file);
    const { data } = await apiClient.post<Document>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeDocument(data);
  },
  update: async (id: string, payload: UpdateDocumentPayload): Promise<Document> => {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.content !== undefined) formData.append('content', payload.content);
    if (payload.badge_id) formData.append('badge_id', payload.badge_id);
    if (payload.confidentiality_id) formData.append('confidentiality_id', payload.confidentiality_id);
    if (payload.file) formData.append('file', payload.file);
    const { data } = await apiClient.put<Document>(`/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeDocument(data);
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};

