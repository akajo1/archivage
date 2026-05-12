import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { MailRoutingStatus } from '../types/mail-routing.types';
import type {
  MailRouting,
  InitializeRoutingPayload,
  ForwardRoutingPayload,
  VerifyRoutingPayload,
  RejectRoutingPayload,
  AddParticipantPayload,
  AddCommentPayload,
  TimelineEvent,
  MailComment,
} from '../types/mail-routing.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class MailRoutingClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE}/mail-routings`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Initialize a new routing for a document
   */
  async initializeRouting(payload: InitializeRoutingPayload): Promise<MailRouting> {
    const response = await this.client.post('/initialize', payload);
    return response.data;
  }

  /**
   * Get routing details
   */
  async getRouting(routingId: string): Promise<MailRouting> {
    const response = await this.client.get(`/${routingId}`);
    return response.data;
  }

  /**
   * Get routing timeline (combined actions + comments)
   */
  async getRoutingTimeline(routingId: string): Promise<TimelineEvent[]> {
    const response = await this.client.get(`/${routingId}/timeline`);
    return response.data;
  }

  /**
   * Forward document to next person
   */
  async forwardRouting(routingId: string, payload: ForwardRoutingPayload): Promise<MailRouting> {
    const response = await this.client.post(`/${routingId}/forward`, payload);
    return response.data;
  }

  /**
   * Verify/validate document
   */
  async verifyRouting(routingId: string, payload: VerifyRoutingPayload): Promise<MailRouting> {
    const response = await this.client.post(`/${routingId}/verify`, payload);
    return response.data;
  }

  /**
   * Reject document
   */
  async rejectRouting(routingId: string, payload: RejectRoutingPayload): Promise<MailRouting> {
    const response = await this.client.post(`/${routingId}/reject`, payload);
    return response.data;
  }

  /**
   * Return document to sender
   */
  async returnRouting(routingId: string, payload: VerifyRoutingPayload): Promise<MailRouting> {
    const response = await this.client.post(`/${routingId}/return`, payload);
    return response.data;
  }

  /**
   * Add comment to routing
   */
  async addComment(routingId: string, payload: AddCommentPayload): Promise<MailComment> {
    const response = await this.client.post(`/${routingId}/comments`, payload);
    return response.data;
  }

  /**
   * Add participant (CC/observer)
   */
  async addParticipant(routingId: string, payload: AddParticipantPayload) {
    const response = await this.client.post(`/${routingId}/participants`, payload);
    return response.data;
  }

  /**
   * Get user inbox
   */
  async getUserInbox(status?: MailRoutingStatus): Promise<MailRouting[]> {
    const params = status ? { status } : {};
    const response = await this.client.get('/inbox/me', { params });
    return response.data;
  }
}

export const mailRoutingClient = new MailRoutingClient();

