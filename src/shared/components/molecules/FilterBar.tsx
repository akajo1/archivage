import { RiSearchLine, RiRefreshLine } from 'react-icons/ri';
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
  <div className="arch-panel rounded-2xl p-3 shadow-sm sm:p-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <RiSearchLine className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f7f6b]" />
        <input
          type="text"
          placeholder="Rechercher un document..."
          value={filters.search || ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="arch-input w-full rounded-full py-2.5 pl-10 pr-4 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.badge_id || ''}
          onChange={(e) => onChange({ ...filters, badge_id: e.target.value || undefined })}
          className="arch-select rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9a7d58]/40"
        >
          <option value="">Tous les badges</option>
          {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select
          value={filters.confidentiality_id || ''}
          onChange={(e) => onChange({ ...filters, confidentiality_id: e.target.value || undefined })}
          className="arch-select rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9a7d58]/40"
        >
          <option value="">Toutes les confidentialites</option>
          {confidentialities.map((c) => <option key={c.id} value={c.id}>{c.level}</option>)}
        </select>
        <button
          type="button"
          onClick={() => onChange({})}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#d8cab3] bg-[#f8f0e3] px-4 py-2.5 text-sm font-medium text-[#69553e] transition-colors hover:bg-[#eee0ca]"
        >
          <RiRefreshLine className="h-3.5 w-3.5" />
          Reinitialiser
        </button>
      </div>
    </div>
  </div>
);
