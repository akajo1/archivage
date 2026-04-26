import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiAddLine } from 'react-icons/ri';
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

export const DocumentListPage = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
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
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="arch-hero relative overflow-hidden rounded-3xl p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#2f2a24]">Documents</h1>
            <p className="mt-1 text-sm text-[#6f614e]">{documents.length} document(s) accessible(s)</p>
          </div>
          <Button onClick={() => navigate('/documents/new')} className="rounded-full px-5">
            <RiAddLine className="h-4 w-4" /> Nouveau document
          </Button>
        </div>

        <FilterBar
          badges={badges}
          confidentialities={confidentialities}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-[#d7a59c] bg-[#f3d8d2] p-3 text-sm text-[#8b3e34]">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <DocumentTable documents={documents} onDelete={handleDelete} />
      )}
    </div>
  );
};
