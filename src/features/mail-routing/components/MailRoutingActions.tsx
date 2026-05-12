import React, { useState } from 'react';
import type { MailRouting } from '../types/mail-routing.types';
import { MailRoutingStatus } from '../types/mail-routing.types';
import { useForwardRouting, useVerifyRouting, useRejectRouting } from '../hooks/useMailRouting';
import { Button } from '../../../shared/components/atoms/Button';
import { Modal } from '../../../shared/components/molecules/Modal';

interface MailRoutingActionsProps {
  routing: MailRouting;
  currentUserId?: string;
  onActionComplete?: () => void;
}

/**
 * Boutons d'actions pour un routing (forward, verify, reject, return)
 */
export const MailRoutingActions: React.FC<MailRoutingActionsProps> = ({
  routing,
  currentUserId,
  onActionComplete,
}) => {
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [forwardNote, setForwardNote] = useState('');
  const [verifyNote, setVerifyNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const { forward, loading: forwardLoading } = useForwardRouting();
  const { verify, loading: verifyLoading } = useVerifyRouting();
  const { reject, loading: rejectLoading } = useRejectRouting();

  const isCurrentAssignee = currentUserId === routing.currentAssignee?.id;
  const canAct = isCurrentAssignee && [
    MailRoutingStatus.PENDING,
    MailRoutingStatus.FORWARDED,
    MailRoutingStatus.RETURNED,
  ].includes(routing.status);

  const handleForward = async () => {
    // In a real app, would show a user selector modal
    const receiverId = 'receiver-id'; // Placeholder
    const result = await forward(routing.id, receiverId, [], forwardNote);
    if (result) {
      setShowForwardModal(false);
      setForwardNote('');
      onActionComplete?.();
    }
  };

  const handleVerify = async () => {
    const result = await verify(routing.id, verifyNote);
    if (result) {
      setShowVerifyModal(false);
      setVerifyNote('');
      onActionComplete?.();
    }
  };

  const handleReject = async () => {
    const result = await reject(routing.id, rejectReason);
    if (result) {
      setShowRejectModal(false);
      setRejectReason('');
      onActionComplete?.();
    }
  };

  if (!canAct) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
        <p className="text-sm text-yellow-800">
          {routing.status === MailRoutingStatus.VERIFIED
            ? '✓ Document vérifié'
            : routing.status === MailRoutingStatus.REJECTED
              ? '✗ Document rejeté'
              : !isCurrentAssignee
                ? 'Vous n\'êtes pas assigné à ce document'
                : 'Pas d\'actions disponibles'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setShowForwardModal(true)}
          variant="primary"
          size="sm"
        >
          📤 Envoyer
        </Button>
        <Button
          onClick={() => setShowVerifyModal(true)}
          variant="primary"
          size="sm"
        >
          ✓ Valider
        </Button>
        <Button
          onClick={() => setShowRejectModal(true)}
          variant="danger"
          size="sm"
        >
          ✗ Rejeter
        </Button>
      </div>

      {/* Forward Modal */}
      {showForwardModal && (
        <Modal
          isOpen={showForwardModal}
          onClose={() => setShowForwardModal(false)}
          title="Envoyer le document"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataire
              </label>
              <input
                type="text"
                placeholder="Sélectionner un destinataire..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (optionnel)
              </label>
              <textarea
                value={forwardNote}
                onChange={(e) => setForwardNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleForward}
                isLoading={forwardLoading}
              >
                Envoyer
              </Button>
              <Button
                onClick={() => setShowForwardModal(false)}
                variant="secondary"
              >
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <Modal
          isOpen={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          title="Valider le document"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Êtes-vous sûr de vouloir valider ce document?
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (optionnel)
              </label>
              <textarea
                value={verifyNote}
                onChange={(e) => setVerifyNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleVerify}
                isLoading={verifyLoading}
                variant="primary"
              >
                Valider
              </Button>
              <Button
                onClick={() => setShowVerifyModal(false)}
                variant="secondary"
              >
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Rejeter le document"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motif du rejet *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Expliquer le motif du rejet..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 h-20"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReject}
                isLoading={rejectLoading}
                variant="danger"
                disabled={!rejectReason.trim()}
              >
                Rejeter
              </Button>
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="secondary"
              >
                Annuler
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

