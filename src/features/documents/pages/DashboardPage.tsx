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
  tab: string;
  body: string;
  spine: string;
  bodyBorder: string;
  label: string;
  labelBg: string;
  labelText: string;
  dotsColor: string;
  countBg: string;
  countText: string;
}> = {
  critique: {
    tab:        'bg-[#BD114A]',
    body:       'bg-[#fdf2f6]',
    spine:      'bg-[#d4316a]',
    bodyBorder: 'border-[#f4a8bf]',
    label:      'Critique',
    labelBg:    'bg-[#fce8ef]',
    labelText:  'text-[#BD114A]',
    dotsColor:  'bg-[#f4a8bf]',
    countBg:    'bg-[#BD114A]',
    countText:  'text-white',
  },
  normal: {
    tab:        'bg-[#2FA084]',
    body:       'bg-[#f0faf6]',
    spine:      'bg-[#3db898]',
    bodyBorder: 'border-[#9fd8c8]',
    label:      'Normal',
    labelBg:    'bg-[#d4f0e8]',
    labelText:  'text-[#2FA084]',
    dotsColor:  'bg-[#9fd8c8]',
    countBg:    'bg-[#2FA084]',
    countText:  'text-white',
  },
  faible: {
    tab:        'bg-[#456882]',
    body:       'bg-[#edf4f8]',
    spine:      'bg-[#5a7d99]',
    bodyBorder: 'border-[#a8c8de]',
    label:      'Faible',
    labelBg:    'bg-[#dbeaf3]',
    labelText:  'text-[#234C6A]',
    dotsColor:  'bg-[#a8c8de]',
    countBg:    'bg-[#456882]',
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
      ? [{ label: 'Nouveau document', icon: RiAddLine, to: '/documents/new', color: 'bg-[#234C6A] text-white hover:bg-[#1B3C53]' }]
      : []),
    { label: 'Tous les documents', icon: RiFileList2Line, to: '/documents', color: 'bg-[#edf4f8] text-[#456882] hover:bg-[#dbeaf3]' },
    ...(isAdmin
      ? [
          { label: 'Utilisateurs', icon: RiTeamLine, to: '/users', color: 'bg-[#edf4f8] text-[#456882] hover:bg-[#dbeaf3]' },
          { label: 'Roles & permissions', icon: RiShieldKeyholeLine, to: '/roles', color: 'bg-[#edf4f8] text-[#456882] hover:bg-[#dbeaf3]' },
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
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Bonjour, {user?.name ?? 'utilisateur'} 👋
            </h1>
            <p className="mt-1 text-sm text-[#a8c8de]">
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
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#1B3C53]">
              <RiFolder3Line className="h-5 w-5 text-[#234C6A]" />
              Groupes d'archivage
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => {
                const theme = folderTheme[badge.name as BadgeName] ?? {
                  tab: 'bg-[#234C6A]', body: 'bg-[#edf4f8]', spine: 'bg-[#456882]',
                  bodyBorder: 'border-[#c4d4df]', label: badge.name,
                  labelBg: 'bg-[#dbeaf3]', labelText: 'text-[#234C6A]',
                  dotsColor: 'bg-[#c4d4df]', countBg: 'bg-[#234C6A]', countText: 'text-white',
                };
                const count = docsByBadge[badge.id]?.length ?? 0;
                const isSelected = selectedBadgeId === badge.id;

                return (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadgeId(badge.id)}
                    className="group relative cursor-pointer text-left transition-all duration-200 hover:-translate-y-1.5"
                    style={{ filter: isSelected ? 'drop-shadow(0 6px 14px rgba(27,60,83,0.25))' : 'drop-shadow(0 3px 8px rgba(27,60,83,0.12))' }}
                  >
                    {/* Back panel (stacked paper illusion) */}
                    <div className={`absolute inset-x-2 bottom-[-4px] h-full rounded-sm border ${theme.bodyBorder} opacity-50`}
                         style={{ background: 'rgba(180,200,220,0.35)' }} />

                    {/* Folder shape */}
                    <div className={`relative overflow-visible rounded-sm border ${theme.bodyBorder} ${theme.body}`}
                         style={{ boxShadow: isSelected ? `0 0 0 2.5px #234C6A, 0 2px 0 #7aaac4` : '0 2px 0 #7aaac4' }}>

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
                            className="pointer-events-none absolute inset-0 opacity-[0.04]"
                            style={{
                              backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 19px, #234C6A 19px, #234C6A 20px)',
                              backgroundPositionY: '40px',
                            }}
                          />

                          {/* Header row */}
                          <div className="relative flex items-start justify-between gap-2">
                            <div>
                              <p className="font-['Georgia',_serif] text-base font-bold text-[#1B3C53]">
                                {theme.label}
                              </p>
                              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[#456882]">
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
                            <p className="mt-0.5 text-[10px] text-[#456882]">
                                Cliquer pour consulter
                              </p>
                          </div>

                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="mt-3 flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-[#234C6A]" />
                              <span className="text-[10px] font-semibold text-[#234C6A]">Sélectionné</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {badges.length === 0 && (
                <div className="col-span-3 rounded-2xl border border-[#c4d4df] bg-[#edf4f8] p-6 text-center text-sm text-[#456882]">
                  Aucun groupe accessible.
                </div>
              )}
            </div>
          </section>

          {/* Documents from selected category */}
          {selectedBadge && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[#1B3C53]">
                  <RiFileTextLine className="h-5 w-5 text-[#234C6A]" />
                  Documents{' '}
                  <BadgePill name={selectedBadge.name as BadgeName} />
                </h2>
                <Link
                  to={`/documents?badge_id=${selectedBadge.id}`}
                  className="flex items-center gap-1 text-xs font-medium text-[#234C6A] hover:text-[#1B3C53]"
                >
                  Voir tout <RiArrowRightLine className="h-3.5 w-3.5" />
                </Link>
              </div>

              {selectedDocs.length === 0 ? (
                <div className="rounded-2xl border border-[#c4d4df] bg-[#edf4f8] px-6 py-10 text-center">
                  <RiFolder3Line className="mx-auto mb-2 h-8 w-8 text-[#7aaac4]" />
                  <p className="text-sm text-[#456882]">Aucun document dans cette categorie.</p>
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
                <div className="divide-y divide-[#dde8f0] overflow-hidden rounded-2xl border border-[#c4d4df] bg-white">
                  {selectedDocs.slice(0, 8).map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#f4f7fa]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#dbeaf3] text-[#234C6A]">
                        <RiFileTextLine className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1B3C53] group-hover:text-[#234C6A]">
                          {doc.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[#456882]">
                          Par {doc.createdBy?.name ?? '—'} · {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <ConfidentialityTag level={doc.confidentiality?.level ?? 'public'} />
                      </div>
                      <RiArrowRightLine className="h-4 w-4 shrink-0 text-[#7aaac4] transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                  {selectedDocs.length > 8 && (
                    <div className="px-5 py-3 text-center">
                      <Link
                        to={`/documents?badge_id=${selectedBadge.id}`}
                        className="text-xs font-medium text-[#234C6A] hover:underline"
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
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#1B3C53]">
                <RiTimeLine className="h-5 w-5 text-[#234C6A]" />
                Documents récents
              </h2>
              {recentDocs.length === 0 ? (
                <div className="rounded-2xl border border-[#c4d4df] bg-[#edf4f8] px-6 py-8 text-center text-sm text-[#456882]">
                  Aucun document récent.
                </div>
              ) : (
                <div className="divide-y divide-[#dde8f0] overflow-hidden rounded-2xl border border-[#c4d4df] bg-white">
                  {recentDocs.map((doc) => (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f4f7fa]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dbeaf3] text-[#234C6A]">
                        <RiFileTextLine className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#1B3C53]">{doc.title}</p>
                        <p className="text-xs text-[#456882]">{formatDate(doc.createdAt)}</p>
                      </div>
                      <BadgePill name={doc.badge?.name as BadgeName} />
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Shortcuts */}
            <section>
              <h2 className="mb-3 text-base font-semibold text-[#1B3C53]">Raccourcis</h2>
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
              <div className="mt-5 rounded-2xl border border-[#c4d4df] bg-[#edf4f8] p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#456882]">Résumé</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#456882]">Total documents</span>
                    <span className="font-semibold text-[#1B3C53]">{documents.length}</span>
                  </div>
                  {badges.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm">
                      <span className="capitalize text-[#456882]">{b.name}</span>
                      <span className="font-semibold text-[#1B3C53]">{docsByBadge[b.id]?.length ?? 0}</span>
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

