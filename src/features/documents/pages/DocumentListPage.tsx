import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  RiAddLine,
  RiLayoutGridLine,
  RiListCheck2,
  RiArrowUpDownLine,
  RiFileTextLine,
} from 'react-icons/ri';
import { documentService } from '../services/documentService';
import { badgeService } from '../../badges/services/badgeService';
import { confidentialityService } from '../../confidentiality/services/confidentialityService';
import type { Document, DocumentFilters } from '../types/document.types';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import { DocumentTable } from '../../../shared/components/organisms/DocumentTable';
import { DocumentListView } from '../../../shared/components/organisms/DocumentListView';
import { FilterBar } from '../../../shared/components/molecules/FilterBar';
import { Button } from '../../../shared/components/atoms/Button';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { useAuthStore } from '../../auth/store/authStore';

type SortKey = 'date_desc' | 'date_asc' | 'title_asc' | 'title_desc' | 'badge';
type ViewMode = 'grid' | 'list';

const SORT_LABELS: Record<SortKey, string> = {
  date_desc: 'Plus récent',
  date_asc: 'Plus ancien',
  title_asc: 'Titre A → Z',
  title_desc: 'Titre Z → A',
  badge: 'Par badge',
};

const sortDocuments = (docs: Document[], key: SortKey): Document[] => {
  const copy = [...docs];
  switch (key) {
    case 'date_desc': return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'date_asc':  return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'title_asc': return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'title_desc':return copy.sort((a, b) => b.title.localeCompare(a.title));
    case 'badge':     return copy.sort((a, b) => (a.badge?.name ?? '').localeCompare(b.badge?.name ?? ''));
    default:          return copy;
  }
};

export const DocumentListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();

  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [confidentialities, setConfidentialities] = useState<Confidentiality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('date_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Sync filters with URL params
  const filters: DocumentFilters = useMemo(() => ({
    badge_id: searchParams.get('badge_id') || undefined,
    confidentiality_id: searchParams.get('confidentiality_id') || undefined,
    search: searchParams.get('search') || undefined,
  }), [searchParams]);

  const handleFiltersChange = (f: DocumentFilters) => {
    const params = new URLSearchParams();
    if (f.badge_id) params.set('badge_id', f.badge_id);
    if (f.confidentiality_id) params.set('confidentiality_id', f.confidentiality_id);
    if (f.search) params.set('search', f.search);
    setSearchParams(params);
  };

  useEffect(() => {
    Promise.all([badgeService.getAll(), confidentialityService.getAll()])
      .then(([b, c]) => { setBadges(b); setConfidentialities(c); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    documentService.getAll(filters)
      .then((data) => { if (active) { setAllDocuments(data); setLoading(false); } })
      .catch(() => { if (active) { setError('Erreur lors du chargement des documents.'); setLoading(false); } });
    return () => { active = false; };
  }, [filters]);

  const documents = useMemo(() => sortDocuments(allDocuments, sortKey), [allDocuments, sortKey]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Supprimer ce document ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#a44b3f',
      cancelButtonColor: '#806444',
    });
    if (!result.isConfirmed) return;
    try {
      await documentService.delete(id);
      setAllDocuments((prev) => prev.filter((d) => d.id !== id));
      void Swal.fire({ title: 'Supprimé !', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch {
      void Swal.fire({ title: 'Erreur', text: 'Impossible de supprimer ce document.', icon: 'error' });
    }
  };

  const canCreate = user?.documentAccesses?.includes('create') || user?.role === 'admin';
  const activeBadge = badges.find((b) => b.id === filters.badge_id);

  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of badges) counts[b.id] = allDocuments.filter((d) => d.badge?.id === b.id).length;
    return counts;
  }, [allDocuments, badges]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="arch-hero relative overflow-hidden rounded-3xl px-6 py-7 shadow-sm sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2f2a24] sm:text-3xl">
              Documents archivés
            </h1>
            <p className="mt-1 text-sm text-[#6f614e]">
              {loading ? '…' : `${documents.length} document(s)`}
              {activeBadge ? ` · badge ${activeBadge.name}` : ''}
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => navigate('/documents/new')} className="rounded-full px-5">
              <RiAddLine className="h-4 w-4" /> Nouveau document
            </Button>
          )}
        </div>

        {/* Badge quick-filter tabs */}
        {badges.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleFiltersChange({ ...filters, badge_id: undefined })}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                !filters.badge_id
                  ? 'bg-[#806444] text-amber-50 shadow-sm'
                  : 'bg-[#f0e5d3] text-[#6b5840] hover:bg-[#e5d7c1]'
              }`}
            >
              <RiFileTextLine className="h-3.5 w-3.5" /> Tous ({allDocuments.length})
            </button>
            {badges.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleFiltersChange({ ...filters, badge_id: b.id })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filters.badge_id === b.id
                    ? 'bg-[#806444] text-amber-50 shadow-sm'
                    : 'bg-[#f0e5d3] text-[#6b5840] hover:bg-[#e5d7c1]'
                }`}
              >
                {b.name} ({badgeCounts[b.id] ?? 0})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <FilterBar
            badges={badges}
            confidentialities={confidentialities}
            filters={filters}
            onChange={handleFiltersChange}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Sort */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSortMenu((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d8cab3] bg-[#f8f0e3] px-3.5 py-2 text-xs font-medium text-[#69553e] transition-colors hover:bg-[#eee0ca]"
            >
              <RiArrowUpDownLine className="h-3.5 w-3.5" />
              {SORT_LABELS[sortKey]}
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-xl border border-[#d8cab3] bg-[#fffaf2] shadow-lg">
                {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setSortKey(key); setShowSortMenu(false); }}
                    className={`w-full px-4 py-2.5 text-left text-xs transition-colors hover:bg-[#f3e9d8] ${key === sortKey ? 'font-semibold text-[#806444]' : 'text-[#4a3b2b]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-full border border-[#d8cab3] bg-[#f8f0e3]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vue grille"
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#806444] text-amber-50' : 'text-[#69553e] hover:bg-[#eee0ca]'}`}
            >
              <RiLayoutGridLine className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Vue liste"
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#806444] text-amber-50' : 'text-[#69553e] hover:bg-[#eee0ca]'}`}
            >
              <RiListCheck2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showSortMenu && <div className="fixed inset-0 z-20" onClick={() => setShowSortMenu(false)} />}

      {error && (
        <div className="rounded-xl border border-[#d7a59c] bg-[#f3d8d2] p-3 text-sm text-[#8b3e34]">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : viewMode === 'grid' ? (
        <DocumentTable documents={documents} onDelete={handleDelete} />
      ) : (
        <DocumentListView documents={documents} onDelete={handleDelete} />
      )}
    </div>
  );
};
