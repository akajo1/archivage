import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  RiAddLine,
  RiFileList2Line,
  RiTeamLine,
  RiShieldKeyholeLine,
  RiArrowRightLine,
  RiFolder3Line,
  RiFileTextLine,
  RiTimeLine,
} from 'react-icons/ri';
import { documentService } from '../services/documentService';
import { badgeService } from '../../badges/services/badgeService';
import type { Document } from '../types/document.types';
import type { Badge } from '../../badges/types/badge.types';
import { useAuthStore } from '../../auth/store/authStore';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { Button } from '../../../shared/components/atoms/Button';
import { BadgePill } from '../../../shared/components/atoms/BadgePill';
import { ConfidentialityTag } from '../../../shared/components/atoms/ConfidentialityTag';

type BadgeName = 'critique' | 'normal' | 'faible';

/* ── Folder colour theme per badge ── */
const folderTheme: Record<BadgeName, {
  tab: string;       // folder tab bg
  body: string;      // main folder body bg
  spine: string;     // left spine strip
  bodyBorder: string;
  label: string;     // human label
  labelBg: string;   // sticker label bg
  labelText: string;
  dotsColor: string; // decorative holes
  countBg: string;
  countText: string;
}> = {
  critique: {
    tab:        'bg-[#c94e3f]',
    body:       'bg-[#f5ebe8]',
    spine:      'bg-[#d8645a]',
    bodyBorder: 'border-[#d9a49e]',
    label:      'Critique',
    labelBg:    'bg-[#fdf1ef]',
    labelText:  'text-[#c94e3f]',
    dotsColor:  'bg-[#d9a49e]',
    countBg:    'bg-[#c94e3f]',
    countText:  'text-white',
  },
  normal: {
    tab:        'bg-[#3e7a5c]',
    body:       'bg-[#eef5f1]',
    spine:      'bg-[#56916f]',
    bodyBorder: 'border-[#9dc0b0]',
    label:      'Normal',
    labelBg:    'bg-[#f0f8f4]',
    labelText:  'text-[#3e7a5c]',
    dotsColor:  'bg-[#9dc0b0]',
    countBg:    'bg-[#3e7a5c]',
    countText:  'text-white',
  },
  faible: {
    tab:        'bg-[#8a6a3a]',
    body:       'bg-[#f6f0e6]',
    spine:      'bg-[#a07d4b]',
    bodyBorder: 'border-[#c8b48c]',
    label:      'Faible',
    labelBg:    'bg-[#fdf8f0]',
    labelText:  'text-[#8a6a3a]',
    dotsColor:  'bg-[#c8b48c]',
    countBg:    'bg-[#8a6a3a]',
    countText:  'text-white',
  },
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([badgeService.getAll(), documentService.getAll()])
      .then(([b, d]) => {
        setBadges(b);
        setDocuments(d);
        if (b.length > 0) setSelectedBadgeId(b[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group documents by badge
  const docsByBadge: Record<string, Document[]> = {};
  for (const badge of badges) {
    docsByBadge[badge.id] = documents.filter((d) => d.badge?.id === badge.id);
  }

  const selectedDocs = selectedBadgeId ? (docsByBadge[selectedBadgeId] ?? []) : [];
  const selectedBadge = badges.find((b) => b.id === selectedBadgeId);

  const isAdmin = user?.role === 'admin';
  const canCreate = user?.documentAccesses?.includes('create') || isAdmin;

  const shortcuts = [
    ...(canCreate
      ? [{ label: 'Nouveau document', icon: RiAddLine, to: '/documents/new', color: 'bg-[#806444] text-amber-50 hover:bg-[#684f35]' }]
      : []),
    { label: 'Tous les documents', icon: RiFileList2Line, to: '/documents', color: 'bg-[#f2e7d6] text-[#5e503f] hover:bg-[#e6d5bf]' },
    ...(isAdmin
      ? [
          { label: 'Utilisateurs', icon: RiTeamLine, to: '/users', color: 'bg-[#f2e7d6] text-[#5e503f] hover:bg-[#e6d5bf]' },
          { label: 'Roles & permissions', icon: RiShieldKeyholeLine, to: '/roles', color: 'bg-[#f2e7d6] text-[#5e503f] hover:bg-[#e6d5bf]' },
        ]
      : []),
  ];

  const recentDocs = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Header */}
      <div className="arch-hero relative overflow-hidden rounded-3xl px-6 py-7 shadow-sm sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#2f2a24] sm:text-3xl">
              Bonjour, {user?.name ?? 'utilisateur'} 👋
            </h1>
            <p className="mt-1 text-sm text-[#6f614e]">
              Bienvenue sur votre espace d'archivage. {documents.length} document(s) accessible(s).
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => navigate('/documents/new')} className="rounded-full px-5">
              <RiAddLine className="h-4 w-4" /> Nouveau document
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Archive Groups — folder design */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#4a3b2b]">
              <RiFolder3Line className="h-5 w-5 text-[#806444]" />
              Groupes d'archivage
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => {
                const theme = folderTheme[badge.name as BadgeName] ?? {
                  tab: 'bg-[#806444]', body: 'bg-[#f5ead6]', spine: 'bg-[#a07d4b]',
                  bodyBorder: 'border-[#c8b08a]', label: badge.name,
                  labelBg: 'bg-[#fdf8f0]', labelText: 'text-[#806444]',
                  dotsColor: 'bg-[#c8b08a]', countBg: 'bg-[#806444]', countText: 'text-white',
                };
                const count = docsByBadge[badge.id]?.length ?? 0;
                const isSelected = selectedBadgeId === badge.id;

                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadgeId(badge.id)}
                    className="group relative cursor-pointer text-left transition-all duration-200 hover:-translate-y-1.5"
                    style={{ filter: isSelected ? 'drop-shadow(0 6px 14px rgba(80,55,20,0.22))' : 'drop-shadow(0 3px 8px rgba(80,55,20,0.13))' }}
                  >
                    {/* Back panel (stacked paper illusion) */}
                    <div className={`absolute inset-x-2 bottom-[-4px] h-full rounded-sm border ${theme.bodyBorder} opacity-50`}
                         style={{ background: 'rgba(200,176,140,0.35)' }} />

                    {/* Folder shape */}
                    <div className={`relative overflow-visible rounded-sm border ${theme.bodyBorder} ${theme.body}`}
                         style={{ boxShadow: isSelected ? `0 0 0 2.5px #806444, 0 2px 0 #b9a07a` : '0 2px 0 #b9a07a' }}>

                      {/* ── Folder tab (top left) ── */}
                      <div className="flex h-0 items-end overflow-visible">
                        <div
                          className={`relative -top-[22px] h-[22px] w-32 ${theme.tab} flex items-center justify-center rounded-t-md`}
                          style={{ clipPath: 'polygon(0 100%, 0 25%, 6% 0, 94% 0, 100% 25%, 100% 100%)' }}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-[2px] text-white/90">
                            {theme.label}
                          </span>
                        </div>
                        {/* Tab shadow line to body */}
                        <div className={`h-[1px] flex-1 ${theme.bodyBorder} border-t`} />
                      </div>

                      {/* ── Folder body ── */}
                      <div className="flex">
                        {/* Left spine */}
                        <div className={`flex w-2.5 shrink-0 flex-col items-center gap-3 py-4 ${theme.spine} opacity-60`}>
                          {/* Hole punches */}
                          <div className={`h-2.5 w-2.5 rounded-full border border-white/40 ${theme.dotsColor} shadow-inner`} />
                          <div className={`h-2.5 w-2.5 rounded-full border border-white/40 ${theme.dotsColor} shadow-inner`} />
                        </div>

                        {/* Main content area */}
                        <div className="flex-1 p-4">
                          {/* Ruled lines (paper texture) */}
                          <div
                            className="pointer-events-none absolute inset-0 opacity-[0.05]"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 19px, #6b5033 19px, #6b5033 20px)',
                              backgroundPositionY: '40px',
                            }}
                          />

                          {/* Header row */}
                          <div className="relative flex items-start justify-between gap-2">
                            <div>
                              <p className="font-['Georgia',_serif] text-base font-bold text-[#2a2018]">
                                {theme.label}
                              </p>
                              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[#9a8060]">
                                dossier · {badge.name}
                              </p>
                            </div>
                            {/* Document count badge */}
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow ${theme.countBg} ${theme.countText}`}>
                              {count}
                            </div>
                          </div>

                          {/* Sticker label */}
                          <div className={`relative mt-4 rounded border border-dashed ${theme.bodyBorder} ${theme.labelBg} px-3 py-2`}>
                            <p className={`text-[11px] font-semibold uppercase tracking-wide ${theme.labelText}`}>
                              {count} document{count !== 1 ? 's' : ''} archivé{count !== 1 ? 's' : ''}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#9a8060]">
                              Cliquer pour consulter
                            </p>
                          </div>

                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="mt-3 flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#806444]" />
                              <span className="text-[10px] font-semibold text-[#806444]">Sélectionné</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {badges.length === 0 && (
                <div className="col-span-3 rounded-2xl border border-[#d8cab3] bg-[#f8f3ea] p-6 text-center text-sm text-[#7a6a55]">
                  Aucun groupe accessible.
                </div>
              )}
            </div>
          </section>

          {/* Documents from selected category */}
          {selectedBadge && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#4a3b2b]">
                  <RiFileTextLine className="h-5 w-5 text-[#806444]" />
                  Documents{' '}
                  <BadgePill name={selectedBadge.name as BadgeName} />
                </h2>
                <Link
                  to={`/documents?badge_id=${selectedBadge.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-[#806444] hover:text-[#5e3e27]"
                >
                  Voir tout <RiArrowRightLine className="h-3.5 w-3.5" />
                </Link>
              </div>

              {selectedDocs.length === 0 ? (
                <div className="rounded-2xl border border-[#d8cab3] bg-[#f8f3ea] px-6 py-10 text-center">
                  <RiFolder3Line className="mx-auto mb-2 h-8 w-8 text-[#b5a080]" />
                  <p className="text-sm text-[#7a6a55]">Aucun document dans cette categorie.</p>
                  {canCreate && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-4"
                      onClick={() => navigate('/documents/new')}
                    >
                      <RiAddLine className="h-3.5 w-3.5" /> Créer un document
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-[#e8dccc] overflow-hidden rounded-2xl border border-[#d8cab3] bg-[#fffaf2]">
                  {selectedDocs.slice(0, 8).map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#f7efe2]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edddd1] text-[#806444]">
                        <RiFileTextLine className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#2f2a24] group-hover:text-[#5e3e27]">
                          {doc.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[#7a6a55]">
                          Par {doc.createdBy?.name ?? '—'} · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <ConfidentialityTag level={doc.confidentiality?.level ?? 'public'} />
                      </div>
                      <RiArrowRightLine className="h-4 w-4 shrink-0 text-[#b5a080] transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                  {selectedDocs.length > 8 && (
                    <div className="px-5 py-3 text-center">
                      <Link
                        to={`/documents?badge_id=${selectedBadge.id}`}
                        className="text-xs font-medium text-[#806444] hover:underline"
                      >
                        +{selectedDocs.length - 8} document(s) supplémentaire(s)
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Bottom row: Recent + Shortcuts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent documents */}
            <section className="lg:col-span-2">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#4a3b2b]">
                <RiTimeLine className="h-5 w-5 text-[#806444]" />
                Documents récents
              </h2>
              {recentDocs.length === 0 ? (
                <div className="rounded-2xl border border-[#d8cab3] bg-[#f8f3ea] px-6 py-8 text-center text-sm text-[#7a6a55]">
                  Aucun document récent.
                </div>
              ) : (
                <div className="divide-y divide-[#e8dccc] overflow-hidden rounded-2xl border border-[#d8cab3] bg-[#fffaf2]">
                  {recentDocs.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f7efe2]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edddd1] text-[#806444]">
                        <RiFileTextLine className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#2f2a24]">{doc.title}</p>
                        <p className="text-xs text-[#7a6a55]">{formatDate(doc.createdAt)}</p>
                      </div>
                      <BadgePill name={doc.badge?.name as BadgeName} />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Shortcuts */}
            <section>
              <h2 className="mb-3 text-base font-semibold text-[#4a3b2b]">Raccourcis</h2>
              <div className="space-y-2">
                {shortcuts.map(({ label, icon: Icon, to, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${color}`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {label}
                  </Link>
                ))}
              </div>

              {/* Stats mini widget */}
              <div className="mt-5 rounded-2xl border border-[#d8cab3] bg-[#f5ede0] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#7a6a55]">Résumé</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#5f4e3a]">Total documents</span>
                    <span className="font-semibold text-[#2f2a24]">{documents.length}</span>
                  </div>
                  {badges.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-[#5f4e3a]">{b.name}</span>
                      <span className="font-semibold text-[#2f2a24]">{docsByBadge[b.id]?.length ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

