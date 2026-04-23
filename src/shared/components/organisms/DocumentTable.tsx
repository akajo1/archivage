import { useNavigate } from 'react-router-dom';
import type { Document } from '../../../features/documents/types/document.types';
import { BadgePill } from '../atoms/BadgePill';
import { ConfidentialityTag } from '../atoms/ConfidentialityTag';
import { Button } from '../atoms/Button';
import { useAuthStore } from '../../../features/auth/store/authStore';

interface DocumentTableProps {
  documents: Document[];
  onDelete?: (id: string) => void;
}

export const DocumentTable = ({ documents, onDelete }: DocumentTableProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-5xl">📂</span>
        <p className="mt-4 text-lg font-medium">Aucun document trouvé</p>
        <p className="text-sm">Modifiez vos filtres ou créez un nouveau document</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-6 py-3">Titre</th>
            <th className="px-6 py-3">Badge</th>
            <th className="px-6 py-3">Confidentialité</th>
            <th className="px-6 py-3">Auteur</th>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">
                {doc.title}
              </td>
              <td className="px-6 py-4">
                <BadgePill name={doc.badge.name} />
              </td>
              <td className="px-6 py-4">
                <ConfidentialityTag level={doc.confidentiality.level} />
              </td>
              <td className="px-6 py-4 text-gray-600">{doc.createdBy.name}</td>
              <td className="px-6 py-4 text-gray-400">
                {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/documents/${doc.id}`)}>
                    Voir
                  </Button>
                  {(isAdmin || doc.createdBy.id === user?.id) && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/documents/${doc.id}/edit`)}>
                        Modifier
                      </Button>
                      {isAdmin && onDelete && (
                        <Button size="sm" variant="danger" onClick={() => onDelete(doc.id)}>
                          Supprimer
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

