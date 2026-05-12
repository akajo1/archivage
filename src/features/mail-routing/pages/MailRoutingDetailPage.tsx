import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMailRouting } from '../hooks/useMailRouting';
import { MailStatusBadge } from '../components/MailStatusBadge';
import { MailParticipantList } from '../components/MailParticipantList';
import { MailCommentThread } from '../components/MailCommentThread';
import { MailRoutingActions } from '../components/MailRoutingActions';
import { Button } from '../../../shared/components/atoms/Button';

/**
 * Page de détail d'un routing
 */
export const MailRoutingDetailPage: React.FC = () => {
  const { routingId } = useParams<{ routingId: string }>();
  const navigate = useNavigate();
  const { routing, loading, error, refetch } = useMailRouting(routingId);

  if (!routingId) {
    return <div>Erreur: ID du routing manquant</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600">Chargement du document...</p>
        </div>
      </div>
    );
  }

  if (error || !routing) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Erreur: {error || 'Document non trouvé'}</p>
      </div>
    );
  }

  const { document: doc, participants, actions, comments } = routing;

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/mail-routing/inbox')}
          variant="secondary"
          size="sm"
        >
          ← Retour à l'inbox
        </Button>
      </div>

      {/* Document Info Card */}
      <div className="arch-card rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
            {doc.registrationNumber && (
              <p className="text-gray-600 mt-1">N° {doc.registrationNumber}</p>
            )}
          </div>
          <MailStatusBadge status={routing.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">📤 Envoyé par</p>
            <p className="font-medium text-gray-900">{routing.initiatedBy.name}</p>
          </div>
          <div>
            <p className="text-gray-600">👤 Assigné à</p>
            <p className="font-medium text-gray-900">
              {routing.currentAssignee?.name || 'Pas assigné'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">📅 Date de création</p>
            <p className="font-medium text-gray-900">
              {new Date(routing.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          {routing.dueDate && (
            <div>
              <p className="text-gray-600">⏰ Échéance</p>
              <p className="font-medium text-gray-900">
                {new Date(routing.dueDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        {doc.description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-600 text-sm mb-1">Description</p>
            <p className="text-gray-900">{doc.description}</p>
          </div>
        )}

        {routing.notes && (
          <div className="mt-4 pt-4 border-t bg-blue-50 p-3 rounded">
            <p className="text-gray-600 text-sm mb-1">Notes</p>
            <p className="text-gray-900">{routing.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="arch-card rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <MailRoutingActions
          routing={routing}
          onActionComplete={refetch}
        />
      </div>

      {/* Timeline - Combined actions and comments */}
      <div className="grid grid-cols-3 gap-6">
        {/* Participants */}
        <div className="arch-card rounded-lg p-6">
          <MailParticipantList participants={participants} />
        </div>

        {/* Comments & Actions */}
        <div className="col-span-2 space-y-6">
          <div className="arch-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {[...actions, ...comments]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((item, idx) => {
                  const isAction = 'actionType' in item;
                  return (
                    <div key={idx} className="border-l-2 border-gray-300 pl-4 py-2">
                      {isAction ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.actor.name} • {item.actionType.replace(/_/g, ' ').toLowerCase()}
                          </p>
                          {item.note && <p className="text-sm text-gray-600 mt-1">{item.note}</p>}
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.author.name} • Commentaire</p>
                          <p className="text-sm text-gray-600 mt-1">{item.body}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Comments Section */}
          <div className="arch-card rounded-lg p-6">
            <MailCommentThread
              comments={comments}
              routingId={routingId}
              onCommentAdded={refetch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

