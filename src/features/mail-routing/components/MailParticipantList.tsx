import React from 'react';
import { MailParticipant, ParticipantRole, User } from '../types/mail-routing.types';

interface MailParticipantListProps {
  participants: MailParticipant[];
  currentUser?: User;
}

/**
 * Affiche la liste des participants d'un routing
 */
export const MailParticipantList: React.FC<MailParticipantListProps> = ({ participants, currentUser }) => {
  const getRoleLabel = (role: ParticipantRole) => {
    const labels: Record<ParticipantRole, string> = {
      [ParticipantRole.RECEIVER]: '👤 Destinataire',
      [ParticipantRole.ASSIGNEE]: '✅ Assigné',
      [ParticipantRole.REVIEWER]: '🔍 Reviseur',
      [ParticipantRole.APPROVER]: '✓ Approbateur',
      [ParticipantRole.CC]: '📋 CC',
      [ParticipantRole.OBSERVER]: '👁️ Observateur',
    };
    return labels[role] || role;
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900">Participants</h3>
      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-3 border border-gray-200"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {participant.user.name}
                {currentUser?.id === participant.user.id && <span className="ml-2 text-xs text-blue-600">(vous)</span>}
              </p>
              <p className="text-sm text-gray-600">{participant.user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-purple-600">{getRoleLabel(participant.role)}</span>
              {participant.completedAt && (
                <span className="text-xs text-green-600 font-medium">✓ Complété</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

