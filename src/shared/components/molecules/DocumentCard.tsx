import { useNavigate } from 'react-router-dom';
import { RiPencilLine, RiDeleteBinLine, RiEyeLine, RiAttachment2 } from 'react-icons/ri';
import type { Document } from '../../../features/documents/types/document.types';
import type { ConfidentialityLevel } from '../../../features/confidentiality/types/confidentiality.types';

interface DocumentCardProps {
  document: Document;
  canManage?: boolean;
  onDelete?: (id: string) => void;
}

type BadgeName = 'critique' | 'normal' | 'faible';

/* ── Folder tab colour per badge ── */
const tabColors: Record<BadgeName, { tab: string; spine: string; paper: string; stamp: string; stampText: string }> = {
  critique: {
    tab: 'bg-[#BD114A]',
    spine: 'bg-[#d4316a]',
    paper: 'bg-[#ffffff]',
    stamp: 'border-[#BD114A] text-[#BD114A]',
    stampText: 'CRITIQUE',
  },
  normal: {
    tab: 'bg-[#2FA084]',
    spine: 'bg-[#3db898]',
    paper: 'bg-[#fafffe]',
    stamp: 'border-[#2FA084] text-[#2FA084]',
    stampText: 'NORMAL',
  },
  faible: {
    tab: 'bg-[#456882]',
    spine: 'bg-[#5a7d99]',
    paper: 'bg-[#f8fbfd]',
    stamp: 'border-[#456882] text-[#456882]',
    stampText: 'FAIBLE',
  },
};

const confidentialityStamp: Record<ConfidentialityLevel, { label: string; color: string }> = {
  public:       { label: 'PUBLIC',       color: 'border-[#2FA084] text-[#2FA084]' },
  interne:      { label: 'INTERNE',      color: 'border-[#456882] text-[#456882]' },
  confidentiel: { label: 'CONFIDENTIEL', color: 'border-[#8a6a1a] text-[#8a6a1a]' },
  secret:       { label: 'SECRET',       color: 'border-[#BD114A] text-[#BD114A]' },
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/* Generate a short reference code from id */
const refCode = (id: string) => {
  const num = id.replace(/\D/g, '').slice(0, 6).padStart(6, '0');
  const year = new Date().getFullYear();
  return `REF-${year}-${num || id.slice(0, 6).toUpperCase()}`;
};

export const DocumentCard = ({ document, canManage = false, onDelete }: DocumentCardProps) => {
  const navigate = useNavigate();
  const badgeName = (document.badge?.name ?? 'faible') as BadgeName;
  const colors = tabColors[badgeName] ?? tabColors.faible;
  const confLevel = (document.confidentiality?.level ?? 'public') as ConfidentialityLevel;
  const stamp = confidentialityStamp[confLevel];

  const previewText = document.content
    ? stripHtml(document.content).slice(0, 220)
    : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(document.id);
  };

  return (
    <div
      onClick={() => navigate(`/documents/${document.id}`)}
      className="group relative cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:rotate-[-0.4deg]"
      style={{ filter: 'drop-shadow(0 4px 10px rgba(27,60,83,0.14))' }}
    >
      {/* Stack shadow layers */}
      <div className="absolute inset-x-1 bottom-[-4px] h-full rounded-b-lg border border-[#b8cfde] bg-[#dbeaf3] opacity-60" />
      <div className="absolute inset-x-2 bottom-[-7px] h-full rounded-b-lg border border-[#a8c4d8] bg-[#cce0ed] opacity-40" />

      {/* Main folder card */}
      <div className="relative overflow-hidden rounded-t-sm rounded-b-lg border border-[#b8cfde] bg-[#edf4f8]"
           style={{ boxShadow: '0 2px 0 #7aaac4, inset 0 1px 0 rgba(255,255,255,0.7)' }}>

        {/* ── Folder Tab ── */}
        <div className="flex h-7 items-end">
          <div className={`relative flex h-full w-28 items-center justify-center rounded-t-md px-3 ${colors.tab}`}
               style={{ clipPath: 'polygon(0 100%, 0 30%, 8% 0, 92% 0, 100% 30%, 100% 100%)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
              {colors.stampText}
            </span>
          </div>
          <div className="flex-1 border-b border-[#b8cfde]" />
          <span className="mr-2 pb-0.5 font-mono text-[9px] text-[#7aaac4]">{refCode(document.id)}</span>
        </div>

        {/* ── Left spine accent ── */}
        <div className="flex">
          <div className={`w-2 shrink-0 ${colors.spine} opacity-70`} />

          {/* ── Paper body ── */}
          <div className={`relative flex-1 ${colors.paper}`}>
            {/* Ruled lines */}
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 19px, #234C6A 19px, #234C6A 20px)',
                backgroundPositionY: '28px',
              }}
            />

            {/* Content preview */}
            <div className="relative z-10 min-h-[130px] px-4 pt-3 pb-2">
              {previewText ? (
                <p className="font-['Georgia',serif] line-clamp-6 text-[12.5px] leading-[20px] text-[#1B3C53] opacity-75">
                  {previewText}
                </p>
              ) : (
                <p className="font-['Georgia',serif] text-[12px] italic leading-[20px] text-[#7aaac4]">
                  Aucun contenu texte dans ce document.
                </p>
              )}
            </div>

            {/* ── Confidentiality stamp (rotated, bottom-right) ── */}
            <div className="pointer-events-none absolute bottom-3 right-3 rotate-[-12deg] select-none">
              <div className={`rounded-sm border-2 px-2.5 py-0.5 text-[9px] font-extrabold tracking-[3px] opacity-75 ${stamp.color}`}>
                {stamp.label}
              </div>
            </div>

            {/* Attachment indicator */}
            {document.fileUrl && (
              <div className="absolute left-3 bottom-3 flex items-center gap-1 text-[10px] text-[#456882]">
                <RiAttachment2 className="h-3 w-3" />
                <span className="font-medium">PJ</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer strip ── */}
        <div className="border-t border-[#b8cfde] bg-[#dbeaf3] px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-[12.5px] font-bold leading-tight text-[#1B3C53]">
              {document.title}
            </h3>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#456882]">
            <span className="italic">{document.createdBy?.name ?? '—'}</span>
            <span className="font-mono tabular-nums">
              {new Date(document.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* ── Hover action overlay ── */}
        <div className="absolute inset-0 flex items-center justify-center gap-2.5 rounded-b-lg bg-[#1B3C53]/70 opacity-0 backdrop-blur-[2px] transition-all duration-200 group-hover:opacity-100">
          <button type="button" title="Consulter" aria-label="Consulter"
            onClick={(e) => { e.stopPropagation(); navigate(`/documents/${document.id}`); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1B3C53] shadow-lg hover:bg-[#edf4f8]">
            <RiEyeLine className="h-4 w-4" />
          </button>
          {canManage && (
            <button type="button" title="Modifier" aria-label="Modifier"
              onClick={(e) => { e.stopPropagation(); navigate(`/documents/${document.id}/edit`); }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#234C6A] text-white shadow-lg hover:bg-[#1B3C53]">
              <RiPencilLine className="h-4 w-4" />
            </button>
          )}
          {canManage && onDelete && (
            <button type="button" title="Supprimer" aria-label="Supprimer"
              onClick={handleDelete}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#BD114A] text-white shadow-lg hover:bg-[#a10d3f]">
              <RiDeleteBinLine className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
