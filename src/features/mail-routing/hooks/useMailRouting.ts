import { useState, useEffect, useCallback } from 'react';
import { MailRouting, MailRoutingStatus, TimelineEvent, MailComment } from '../types/mail-routing.types';
import { mailRoutingClient } from '../services/mailRoutingClient';

/**
 * Hook pour charger les détails d'un routing
 */
export const useMailRouting = (routingId: string | undefined) => {
  const [routing, setRouting] = useState<MailRouting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRouting = useCallback(async () => {
    if (!routingId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await mailRoutingClient.getRouting(routingId);
      setRouting(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load routing');
    } finally {
      setLoading(false);
    }
  }, [routingId]);

  useEffect(() => {
    fetchRouting();
  }, [fetchRouting]);

  return { routing, loading, error, refetch: fetchRouting };
};

/**
 * Hook pour charger la timeline d'un routing
 */
export const useMailRoutingTimeline = (routingId: string | undefined) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    if (!routingId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await mailRoutingClient.getRoutingTimeline(routingId);
      setTimeline(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timeline');
    } finally {
      setLoading(false);
    }
  }, [routingId]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return { timeline, loading, error, refetch: fetchTimeline };
};

/**
 * Hook pour charger l'inbox mail routing de l'utilisateur
 */
export const useMailRoutingInbox = (status?: MailRoutingStatus) => {
  const [routings, setRoutings] = useState<MailRouting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mailRoutingClient.getUserInbox(status);
      setRoutings(data);
      setTotal(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  return { routings, total, loading, error, refetch: fetchInbox };
};

/**
 * Hook pour ajouter un commentaire
 */
export const useAddComment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComment = useCallback(async (routingId: string, body: string, parentCommentId?: string): Promise<MailComment | null> => {
    try {
      setLoading(true);
      setError(null);
      const comment = await mailRoutingClient.addComment(routingId, { body, parentCommentId });
      return comment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add comment';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addComment, loading, error };
};

/**
 * Hook pour forward un document
 */
export const useForwardRouting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forward = useCallback(async (routingId: string, receiverId: string, ccUserIds?: string[], note?: string): Promise<MailRouting | null> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await mailRoutingClient.forwardRouting(routingId, { receiverId, ccUserIds, note });
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to forward routing';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { forward, loading, error };
};

/**
 * Hook pour vérifier un document
 */
export const useVerifyRouting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = useCallback(async (routingId: string, note?: string): Promise<MailRouting | null> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await mailRoutingClient.verifyRouting(routingId, { note });
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify routing';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { verify, loading, error };
};

/**
 * Hook pour rejeter un document
 */
export const useRejectRouting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reject = useCallback(async (routingId: string, rejectionReason: string): Promise<MailRouting | null> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await mailRoutingClient.rejectRouting(routingId, { rejectionReason });
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject routing';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reject, loading, error };
};

