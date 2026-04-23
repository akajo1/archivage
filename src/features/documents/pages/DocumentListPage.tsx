import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { badgeService } from '../../badges/services/badgeService';
import { confidentialityService } from '../../confidentiality/services/confidentialityService';
import type { Document, DocumentFilters } from '../types/document.types';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import { DocumentTable } from '../../../shared/components/organisms/DocumentTable';
import { FilterBar } from '../../../shared/components/molecules/FilterBar';
import { Button } from '../../../shared/components/atoms/Button';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { useAuthStore } from '../../auth/store/authStore';

export const DocumentListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
      const canCreate = user?.documentAccesses?.includes('create') ?? false;

  const [badges, setBadges] = useState<Badge[]>([]);
  const [confidentialities, setConfidentialities] = useState<Confidentiality[]>([]);
  const [filters, setFilters] = useState<DocumentFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([badgeService.getAll(), confidentialityService.getAll()])
      .then(([b, c]) => { setBadges(b); setConfidentialities(c); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    documentService.getAll(filters)
      .then((data) => { if (active) { setDocuments(data); setLoading(false); } })
      .catch(() => { if (active) { setError('Erreur lors du chargement des documents.'); setLoading(false); } });
    return () => { active = false; };
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce document ?')) return;
    await documentService.delete(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">{documents.length} document(s) accessible(s)</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/documents/new')}>
            + Nouveau document
          </Button>
        )}
      </div>

      <div className="mb-6">
        <FilterBar
          badges={badges}
          confidentialities={confidentialities}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <DocumentTable documents={documents} onDelete={handleDelete} />
      )}
    </div>
  );
};


