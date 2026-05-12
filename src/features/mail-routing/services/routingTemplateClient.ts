import apiClient from '../../../shared/utils/apiClient';
import type {
  RoutingTemplate,
  CreateRoutingTemplatePayload,
  UpdateRoutingTemplatePayload,
} from '../types/routing-template.types';

const BASE = '/routing-templates';

class RoutingTemplateClient {
  /** Get all routing templates */
  async getAll(): Promise<RoutingTemplate[]> {
    const { data } = await apiClient.get<RoutingTemplate[]>(BASE);
    return data;
  }

  /** Get a single routing template */
  async getById(templateId: string): Promise<RoutingTemplate> {
    const { data } = await apiClient.get<RoutingTemplate>(`${BASE}/${templateId}`);
    return data;
  }

  /** Create a new routing template */
  async create(payload: CreateRoutingTemplatePayload): Promise<RoutingTemplate> {
    const { data } = await apiClient.post<RoutingTemplate>(BASE, payload);
    return data;
  }

  /** Update a routing template */
  async update(templateId: string, payload: UpdateRoutingTemplatePayload): Promise<RoutingTemplate> {
    const { data } = await apiClient.patch<RoutingTemplate>(`${BASE}/${templateId}`, payload);
    return data;
  }

  /** Delete a routing template */
  async delete(templateId: string): Promise<void> {
    await apiClient.delete(`${BASE}/${templateId}`);
  }
}

export const routingTemplateClient = new RoutingTemplateClient();

