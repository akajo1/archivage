import { ParticipantRole } from './mail-routing.types';

export interface RoutingTemplateStep {
  order: number;
  role: ParticipantRole;
}

export interface RoutingTemplate {
  id: string;
  name: string;
  description?: string;
  steps: RoutingTemplateStep[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoutingTemplatePayload {
  name: string;
  description?: string;
  steps: RoutingTemplateStep[];
  isDefault?: boolean;
}

export interface UpdateRoutingTemplatePayload {
  name?: string;
  description?: string;
  steps?: RoutingTemplateStep[];
  isDefault?: boolean;
}

