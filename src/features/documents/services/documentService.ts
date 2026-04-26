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
  attachments: (document.attachments ?? []).map((a) => ({
    ...a,
    fileUrl: a.fileUrl.startsWith('http') ? a.fileUrl : `${apiBaseUrl}${a.fileUrl}`,
  })),
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
    if (payload.reference) formData.append('reference', payload.reference);
    if (payload.description) formData.append('description', payload.description);
    if (payload.content) formData.append('content', payload.content);
    formData.append('badge_id', payload.badge_id);
    formData.append('confidentiality_id', payload.confidentiality_id);
    if (payload.file) formData.append('file', payload.file);
    const { data } = await apiClient.post<Document>('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const doc = normalizeDocument(data);
    // Upload annexes separately if any
    if (payload.annexes && payload.annexes.length > 0) {
      return documentService.uploadAnnexes(doc.id, payload.annexes);
    }
    return doc;
  },
  update: async (id: string, payload: UpdateDocumentPayload): Promise<Document> => {
    const formData = new FormData();
    if (payload.title) formData.append('title', payload.title);
    if (payload.reference !== undefined) formData.append('reference', payload.reference ?? '');
    if (payload.description !== undefined) formData.append('description', payload.description ?? '');
    if (payload.content !== undefined) formData.append('content', payload.content ?? '');
    if (payload.badge_id) formData.append('badge_id', payload.badge_id);
    if (payload.confidentiality_id) formData.append('confidentiality_id', payload.confidentiality_id);
    if (payload.file) formData.append('file', payload.file);
    const { data } = await apiClient.put<Document>(`/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const doc = normalizeDocument(data);
    // Upload new annexes if any
    if (payload.annexes && payload.annexes.length > 0) {
      return documentService.uploadAnnexes(doc.id, payload.annexes);
    }
    return doc;
  },
  uploadAnnexes: async (id: string, files: File[]): Promise<Document> => {
    const formData = new FormData();
    for (const f of files) formData.append('annexes', f);
    const { data } = await apiClient.post<Document>(`/documents/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeDocument(data);
  },
  deleteAttachment: async (docId: string, attachmentId: string): Promise<void> => {
    await apiClient.delete(`/documents/${docId}/attachments/${attachmentId}`);
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};
