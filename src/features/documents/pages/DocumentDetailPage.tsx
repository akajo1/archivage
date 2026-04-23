import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { documentService } from '../services/documentService';
import type { Document } from '../types/document.types';
import { BadgePill } from '../../../shared/components/atoms/BadgePill';
import { ConfidentialityTag } from '../../../shared/components/atoms/ConfidentialityTag';
import { Button } from '../../../shared/components/atoms/Button';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { useAuthStore } from '../../auth/store/authStore';

export const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    let active = true;

    documentService.getById(id)
      .then((data) => {
        if (active) {
          setDocument(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Document introuvable ou accès refusé.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Supprimer ce document définitivement ?')) return;
    await documentService.delete(id);
    navigate('/documents');
  };

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl">⚠️</span>
        <p className="mt-4 text-lg font-medium text-red-600">Document introuvable.</p>
        <Button className="mt-4" onClick={() => navigate('/documents')}>Retour</Button>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl">⚠️</span>
        <p className="mt-4 text-lg font-medium text-red-600">{error || 'Document introuvable'}</p>
        <Button className="mt-4" onClick={() => navigate('/documents')}>Retour</Button>
      </div>
    );
  }

  const hasEditAccess = user?.documentAccesses?.includes('edit') ?? false;
  const canEdit = hasEditAccess && (user?.role === 'admin' || document.createdBy.id === user?.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        ← Retour à la liste
      </button>

      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-linear-to-r from-indigo-50 to-purple-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 flex-1">{document.title}</h1>
            <BadgePill name={document.badge.name} />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ConfidentialityTag level={document.confidentiality.level} />
          </div>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Auteur</p>
              <p className="mt-1 font-medium text-gray-700">{document.createdBy.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-medium">Date de création</p>
              <p className="mt-1 font-medium text-gray-700">
                {new Date(document.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {document.fileUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Fichier joint</p>
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-indigo-600 hover:underline text-sm"
              >
                📄 Télécharger le fichier
              </a>
            </div>
          )}
        </div>

        {canEdit && (
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/documents/${document.id}/edit`)}>
              Modifier
            </Button>
            {user?.role === 'admin' && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Supprimer
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

