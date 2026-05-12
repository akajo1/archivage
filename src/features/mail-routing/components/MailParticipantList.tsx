import React from 'react';
import type { MailParticipant, User } from '../types/mail-routing.types';
import { ParticipantRole } from '../types/mail-routing.types';

interface MailParticipantListProps {
  participants: MailParticipant[];
  currentUser?: User;
}

const ROLE_LABELS: Record<ParticipantRole, string> = {
  [ParticipantRole.RECEIVER]:  '👤 Destinataire',
  [ParticipantRole.ASSIGNEE]:  '✅ Assigné',
  [ParticipantRole.REVIEWER]:  '🔍 Réviseur',
  [ParticipantRole.APPROVER]:  '✓ Approbateur',
  [ParticipantRole.CC]:        '📋 Copie (CC)',
  [ParticipantRole.OBSERVER]:  '👁 Observateur',
};

const ROLE_COLORS: Record<ParticipantRole, string> = {
  [ParticipantRole.RECEIVER]:  'bg-blue-100 text-blue-700',
  [ParticipantRole.ASSIGNEE]:  'bg-green-100 text-green-700',
  [ParticipantRole.REVIEWER]:  'bg-purple-100 text-purple-700',
  [ParticipantRole.APPROVER]:  'bg-amber-100 text-amber-700',
  [ParticipantRole.CC]:        'bg-[#edf4f8] text-[#456882]',
  [ParticipantRole.OBSERVER]:  'bg-gray-100 text-gray-600',
};

export const MailParticipantList: React.FC<MailParticipantListProps> = ({ participants, currentUser }) => {
  if (!participants || participants.length === 0) {
    return <p className="text-sm text-[#7aaac4]">Aucun participant.</p>;
  }

  return (
    <div className="space-y-2">
      {participants.map((p) => (
        <div key={p.id} className="flex items-center justify-between rounded-xl border border-[#dde8f0] bg-[#f4f7fa] px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#1B3C53]">
              {p.user?.name ?? '—'}
              {currentUser?.id === p.userId && (
                <span className="ml-1.5 text-xs text-[#2FA084]">(vous)</span>
              )}
            </p>
            <p className="truncate text-xs text-[#7aaac4]">{p.user?.email ?? ''}</p>
          </div>
          <div className="ml-2 flex shrink-0 flex-col items-end gap-1">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${ROLE_COLORS[p.role] ?? 'bg-gray-100 text-gray-600'}`}>
              {ROLE_LABELS[p.role] ?? p.role}
            </span>
            {p.completedAt && (
              <span className="text-[10px] font-medium text-[#2FA084]">✓ Complété</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
