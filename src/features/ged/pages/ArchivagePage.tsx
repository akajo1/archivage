import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiArchiveDrawerLine, RiSearchLine, RiDownloadLine,
  RiFileTextLine, RiCalendarLine, RiUserLine,
} from 'react-icons/ri';
import { documentService } from '../../documents/services/documentService';
import type { Document } from '../../documents/types/document.types';
import { BadgePill } from '../../../shared/components/atoms/BadgePill';
import { Spinner } from '../../../shared/components/atoms/Spinner';

export const ArchivagePage: React.FC = () => {
  const [archivedDocs, setArchivedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let cancelled = false;
    documentService.getAll({ status: 'archived' })
      .then((docs) => {
        if (!cancelled) setArchivedDocs(docs);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = archivedDocs.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.reference ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="arch-hero relative overflow-hidden rounded-3xl px-8 py-8 shadow-sm">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">📦 Archivage</h1>
        <p className="mt-1 text-[#a8c8de]">Documents archivés et protégés</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Documents archivés', value: loading ? '…' : archivedDocs.length, color: 'text-orange-600' },
          { label: 'Résultats filtrés',  value: loading ? '…' : filtered.length,      color: 'text-blue-600' },
        ].map((s) => (
          <div key={s.label} className="arch-card rounded-2xl p-5">
            <p className="text-sm text-[#456882]">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="arch-card rounded-2xl p-4">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7aaac4]" />
          <input
            type="text"
            placeholder="Rechercher dans les archives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] py-2.5 pl-9 pr-4 text-sm text-[#1B3C53] placeholder:text-[#7aaac4] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="arch-card rounded-2xl p-12 text-center">
          <RiArchiveDrawerLine className="mx-auto h-12 w-12 text-[#c4d4df]" />
          <p className="mt-4 text-[#456882]">
            {archivedDocs.length === 0
              ? 'Aucun document archivé pour le moment.'
              : 'Aucun résultat pour cette recherche.'}
          </p>
        </div>
      ) : (
        <div className="arch-card overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dde8f0] bg-[#f4f7fa] text-left text-xs font-semibold uppercase tracking-wide text-[#456882]">
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3 hidden md:table-cell">Auteur</th>
                <th className="px-6 py-3 hidden sm:table-cell">Badge</th>
                <th className="px-6 py-3 hidden lg:table-cell">Créé le</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde8f0]">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#f4f7fa] transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <RiFileTextLine className="h-4 w-4 shrink-0 text-[#7aaac4]" />
                      <div>
                        <Link
                          to={`/documents/${doc.id}`}
                          className="font-medium text-[#1B3C53] hover:text-[#234C6A] hover:underline"
                        >
                          {doc.title}
                        </Link>
                        {doc.reference && (
                          <p className="font-mono text-xs text-[#7aaac4]">{doc.reference}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 hidden md:table-cell text-[#456882]">
                    <span className="inline-flex items-center gap-1">
                      <RiUserLine className="h-3.5 w-3.5" />
                      {doc.createdBy?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-3 hidden sm:table-cell">
                    {doc.badge ? (
                      <BadgePill name={doc.badge.name as 'critique' | 'normal' | 'faible'} />
                    ) : '—'}
                  </td>
                  <td className="px-6 py-3 hidden lg:table-cell text-[#456882]">
                    <span className="inline-flex items-center gap-1">
                      <RiCalendarLine className="h-3.5 w-3.5" />
                      {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#edf4f8] px-3 py-1.5 text-xs font-medium text-[#234C6A] hover:bg-[#dbeaf3]"
                      >
                        Voir
                      </Link>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          download
                          className="inline-flex items-center gap-1 rounded-lg bg-[#234C6A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B3C53]"
                        >
                          <RiDownloadLine className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="arch-card rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900 mb-1">💡 À propos de l'archivage</p>
        <ul className="space-y-0.5 text-xs text-blue-800">
          <li>• Les documents archivés sont protégés contre les modifications</li>
          <li>• Consultez un document pour le désarchiver si nécessaire</li>
        </ul>
      </div>
    </div>
  );
};
