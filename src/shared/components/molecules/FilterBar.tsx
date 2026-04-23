import type { Badge } from '../../../features/badges/types/badge.types';
import type { Confidentiality } from '../../../features/confidentiality/types/confidentiality.types';
import type { DocumentFilters } from '../../../features/documents/types/document.types';

interface FilterBarProps {
  badges: Badge[];
  confidentialities: Confidentiality[];
  filters: DocumentFilters;
  onChange: (filters: DocumentFilters) => void;
}

export const FilterBar = ({ badges, confidentialities, filters, onChange }: FilterBarProps) => (
  <div className="flex flex-wrap gap-3">
    <input
      type="text"
      placeholder="Rechercher un document..."
      value={filters.search || ''}
      onChange={(e) => onChange({ ...filters, search: e.target.value })}
      className="min-w-50 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
    <select
      value={filters.badge_id || ''}
      onChange={(e) => onChange({ ...filters, badge_id: e.target.value || undefined })}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Tous les badges</option>
      {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
    </select>
    <select
      value={filters.confidentiality_id || ''}
      onChange={(e) => onChange({ ...filters, confidentiality_id: e.target.value || undefined })}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">Toutes les confidentialités</option>
      {confidentialities.map((c) => <option key={c.id} value={c.id}>{c.level}</option>)}
    </select>
  </div>
);

