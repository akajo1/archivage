import { useState, useEffect, useCallback } from 'react';
import { MailRoutingStatus } from '../types/mail-routing.types';
import type { MailRouting, TimelineEvent, MailComment } from '../types/mail-routing.types';
import { mailRoutingClient } from '../services/mailRoutingClient';

/**
 * Hook pour charger les détails d'un routing
 */
export const useMailRouting = (routingId: string | undefined) => {
  const [routing, setRouting] = useState<MailRouting | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRouting = useCallback(() => {
    if (!routingId) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => { if (!cancelled) { setLoading(true); setError(null); } })
      .then(() => mailRoutingClient.getRouting(routingId))
      .then((data) => { if (!cancelled) { setRouting(data); setLoading(false); } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load routing');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [routingId]);

  useEffect(() => fetchRouting(), [fetchRouting]);

  return { routing, loading, error, refetch: fetchRouting };
};

/**
 * Hook pour charger la timeline d'un routing
 */
export const useMailRoutingTimeline = (routingId: string | undefined) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(() => {
    if (!routingId) return;
    let cancelled = false;
    Promise.resolve()
      .then(() => { if (!cancelled) { setLoading(true); setError(null); } })
      .then(() => mailRoutingClient.getRoutingTimeline(routingId))
      .then((data) => { if (!cancelled) { setTimeline(data); setLoading(false); } })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load timeline');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [routingId]);

  useEffect(() => fetchTimeline(), [fetchTimeline]);

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

  const fetchInbox = useCallback(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => { if (!cancelled) { setLoading(true); setError(null); } })
      .then(() => mailRoutingClient.getUserInbox(status))
      .then((data) => {
        if (!cancelled) {
          setRoutings(data);
          setTotal(data.length);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load inbox');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [status]);

  useEffect(() => fetchInbox(), [fetchInbox]);

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
      return await mailRoutingClient.addComment(routingId, { body, parentCommentId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
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
      return await mailRoutingClient.forwardRouting(routingId, { receiverId, ccUserIds, note });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to forward routing');
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
      return await mailRoutingClient.verifyRouting(routingId, { note });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify routing');
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
      return await mailRoutingClient.rejectRouting(routingId, { rejectionReason });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject routing');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reject, loading, error };
};

/**
 * Hook pour compléter un routing (et optionnellement archiver le document)
 */
export const useCompleteRouting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = useCallback(async (routingId: string, note?: string, archive?: boolean): Promise<MailRouting | null> => {
    try {
      setLoading(true);
      setError(null);
      return await mailRoutingClient.completeRouting(routingId, { note, archive });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete routing');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { complete, loading, error };
};

