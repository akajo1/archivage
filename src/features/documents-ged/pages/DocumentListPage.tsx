import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Document, DocumentListFilters } from '../types/document.types';
import { Button } from '../../../shared/components/atoms/Button';

/**
 * Page liste documents - Vue principale de gestion documents
 */
export const DocumentListPage: React.FC = () => {
  const [filters, setFilters] = useState<DocumentListFilters>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      received: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      validated: 'bg-green-100 text-green-800',
      archived: 'bg-gray-200 text-gray-700',
      courrier_prepared: 'bg-purple-100 text-purple-800',
      courrier_sent: 'bg-pink-100 text-pink-800',
    };
    return colors[status] || 'bg-gray-100';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: '✏️ Brouillon',
      received: '📥 Reçu',
      in_review: '🔍 En révision',
      validated: '✅ Validé',
      archived: '📦 Archivé',
      courrier_prepared: '📤 Préparé',
      courrier_sent: '✉️ Envoyé',
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header avec bouton nouveau */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📄 Mes Documents</h1>
          <p className="text-gray-600 mt-1">Gestion complète de vos documents</p>
        </div>
        <Link to="/documents/new">
          <Button variant="primary">+ Nouveau Document</Button>
        </Link>
      </div>

      {/* Filtres */}
      <div className="arch-card rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Rechercher..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="received">Reçu</option>
            <option value="in_review">En révision</option>
            <option value="validated">Validé</option>
            <option value="archived">Archivé</option>
          </select>
          <select
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            onChange={(e) => setFilters({ ...filters, confidentialityId: e.target.value })}
          >
            <option value="">Toute confidentialité</option>
            <option value="public">Public</option>
            <option value="interne">Interne</option>
            <option value="confidentiel">Confidentiel</option>
            <option value="secret">Secret</option>
          </select>
          <Button onClick={() => setFilters({})}>Réinitialiser</Button>
        </div>
      </div>

      {/* Documents Table */}
      {documents.length === 0 ? (
        <div className="arch-card rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Aucun document trouvé</p>
          <Link to="/documents/new">
            <Button>Créer le premier document</Button>
          </Link>
        </div>
      ) : (
        <div className="arch-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Titre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Confidentialité</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Créé le</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link to={`/documents/${doc.id}`} className="text-blue-600 hover:underline font-medium">
                      {doc.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {getStatusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {doc.confidentiality ? (
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                        {doc.confidentiality.level.toUpperCase()}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-3 text-sm space-x-2">
                    <Link to={`/documents/${doc.id}`} className="text-blue-600 hover:underline">
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

