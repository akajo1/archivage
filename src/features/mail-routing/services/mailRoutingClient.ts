import apiClient from '../../../shared/utils/apiClient';
import { MailRoutingStatus } from '../types/mail-routing.types';
import type {
  MailRouting,
  InitializeRoutingPayload,
  ForwardRoutingPayload,
  VerifyRoutingPayload,
  RejectRoutingPayload,
  AddParticipantPayload,
  AddCommentPayload,
  CompleteRoutingPayload,
  TimelineEvent,
  MailComment,
} from '../types/mail-routing.types';

const BASE = '/mail-routings';

class MailRoutingClient {
  /** Initialize a new routing for a document */
  async initializeRouting(payload: InitializeRoutingPayload): Promise<MailRouting> {
    const { data } = await apiClient.post(`${BASE}/initialize`, payload);
    return data;
  }

  /** Get routing details */
  async getRouting(routingId: string): Promise<MailRouting> {
    const { data } = await apiClient.get(`${BASE}/${routingId}`);
    return data;
  }

  /** Get routing timeline (combined actions + comments) */
  async getRoutingTimeline(routingId: string): Promise<TimelineEvent[]> {
    const { data } = await apiClient.get(`${BASE}/${routingId}/timeline`);
    return data;
  }

  /** Forward document to next person */
  async forwardRouting(routingId: string, payload: ForwardRoutingPayload): Promise<MailRouting> {
    const { data } = await apiClient.post(`${BASE}/${routingId}/forward`, payload);
    return data;
  }

  /** Verify/validate document */
  async verifyRouting(routingId: string, payload: VerifyRoutingPayload): Promise<MailRouting> {
    const { data } = await apiClient.post(`${BASE}/${routingId}/verify`, payload);
    return data;
  }

  /** Reject document */
  async rejectRouting(routingId: string, payload: RejectRoutingPayload): Promise<MailRouting> {
    const { data } = await apiClient.post(`${BASE}/${routingId}/reject`, payload);
    return data;
  }

  /** Return document to sender */
  async returnRouting(routingId: string, payload: VerifyRoutingPayload): Promise<MailRouting> {
    const { data } = await apiClient.post(`${BASE}/${routingId}/return`, payload);
    return data;
  }

  /** Add comment to routing */
  async addComment(routingId: string, payload: AddCommentPayload): Promise<MailComment> {
    const { data } = await apiClient.post(`${BASE}/${routingId}/comments`, payload);
    return data;
  }

  /** Add participant (CC / observer / reviewer) */
  async addParticipant(
    routingId: string,
    payload: AddParticipantPayload
  ): Promise<unknown> {
    const { data } = await apiClient.post(`${BASE}/${routingId}/participants`, payload);
    return data;
  }

  /** Get user inbox */
  async getUserInbox(status?: MailRoutingStatus): Promise<MailRouting[]> {
    const params = status ? { status } : {};
    const { data } = await apiClient.get(`${BASE}/inbox/me`, { params });
    return data;
  }

  /** Complete routing (and optionally archive document) */
  async completeRouting(routingId: string, payload: CompleteRoutingPayload): Promise<MailRouting> {
    const { data } = await apiClient.post(`${BASE}/${routingId}/complete`, payload);
    return data;
  }
}

export const mailRoutingClient = new MailRoutingClient();
