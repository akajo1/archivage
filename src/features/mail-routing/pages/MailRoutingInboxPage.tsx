import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMailRoutingInbox } from '../hooks/useMailRouting';
import { MailStatusBadge } from '../components/MailStatusBadge';
import { Button } from '../../../shared/components/atoms/Button';

/**
 * Page inbox - Liste des documents à traiter
 */
export const MailRoutingInboxPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const { routings, total, loading, error } = useMailRoutingInbox();

  const filteredRoutings = filterStatus
    ? routings.filter((r) => r.status === filterStatus)
    : routings;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600">Chargement de l'inbox...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📮 Mon Inbox</h1>
          <p className="text-gray-600 mt-1">
            {total} document{total > 1 ? 's' : ''} à traiter
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => setFilterStatus('')}
          variant={filterStatus === '' ? 'primary' : 'secondary'}
          size="sm"
        >
          Tous ({total})
        </Button>
        {['pending', 'forwarded', 'in_review'].map((status) => {
          const count = routings.filter((r) => r.status === status).length;
          return (
            <Button
              key={status}
              onClick={() => setFilterStatus(status)}
              variant={filterStatus === status ? 'primary' : 'secondary'}
              size="sm"
            >
              {status.replace(/_/g, ' ').toUpperCase()} ({count})
            </Button>
          );
        })}
      </div>

      {/* Documents List */}
      {filteredRoutings.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">Aucun document à afficher</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRoutings.map((routing) => (
            <div
              key={routing.id}
              onClick={() => navigate(`/mail-routing/${routing.id}`)}
              className="arch-card rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {routing.document.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {routing.document.registrationNumber && (
                      <>N° {routing.document.registrationNumber} • </>
                    )}
                    Envoyé par {routing.initiatedBy.name}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <MailStatusBadge status={routing.status} size="sm" />
                    {routing.dueDate && (
                      <span className="text-xs text-gray-500">
                        📅 Avant le {new Date(routing.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    {routing.comments.length > 0 && (
                      <span className="text-xs text-blue-600 font-medium">
                        💬 {routing.comments.length} commentaire{routing.comments.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(routing.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

