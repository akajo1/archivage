import { useNavigate } from 'react-router-dom';
import { RiPencilLine, RiDeleteBinLine, RiAttachment2, RiEyeLine } from 'react-icons/ri';
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
    tab: 'bg-[#c94e3f]',
    spine: 'bg-[#d8645a]',
    paper: 'bg-[#fffdf8]',
    stamp: 'border-[#c94e3f] text-[#c94e3f]',
    stampText: 'CRITIQUE',
  },
  normal: {
    tab: 'bg-[#3e7a5c]',
    spine: 'bg-[#56916f]',
    paper: 'bg-[#f9fdf9]',
    stamp: 'border-[#3e7a5c] text-[#3e7a5c]',
    stampText: 'NORMAL',
  },
  faible: {
    tab: 'bg-[#8a6a3a]',
    spine: 'bg-[#a07d4b]',
    paper: 'bg-[#fdfaf3]',
    stamp: 'border-[#8a6a3a] text-[#8a6a3a]',
    stampText: 'FAIBLE',
  },
};

const confidentialityStamp: Record<ConfidentialityLevel, { label: string; color: string }> = {
  public:       { label: 'PUBLIC',       color: 'border-[#3e7a5c] text-[#3e7a5c]' },
  interne:      { label: 'INTERNE',      color: 'border-[#7a6a3a] text-[#7a6a3a]' },
  confidentiel: { label: 'CONFIDENTIEL', color: 'border-[#b06b3c] text-[#b06b3c]' },
  secret:       { label: 'SECRET',       color: 'border-[#c94e3f] text-[#c94e3f]' },
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
      style={{ filter: 'drop-shadow(0 4px 8px rgba(80,60,30,0.13))' }}
    >
      {/* Stack shadow layers — give a "pile of papers" feel */}
      <div className="absolute inset-x-1 bottom-[-4px] h-full rounded-b-lg border border-[#c8b99a] bg-[#f0e4cc] opacity-60" />
      <div className="absolute inset-x-2 bottom-[-7px] h-full rounded-b-lg border border-[#bfaa88] bg-[#e8d5b0] opacity-40" />

      {/* Main folder card */}
      <div className="relative overflow-hidden rounded-t-sm rounded-b-lg border border-[#c8b89c] bg-[#f5ead6]"
           style={{ boxShadow: '0 2px 0 #b9a07a, inset 0 1px 0 rgba(255,255,250,0.6)' }}>

        {/* ── Folder Tab ── */}
        <div className="flex h-7 items-end">
          <div className={`relative flex h-full w-28 items-center justify-center rounded-t-md px-3 ${colors.tab}`}
               style={{ clipPath: 'polygon(0 100%, 0 30%, 8% 0, 92% 0, 100% 30%, 100% 100%)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
              {colors.stampText}
            </span>
          </div>
          <div className="flex-1 border-b border-[#c8b89c]" />
          {/* Ref number */}
          <span className="mr-2 pb-0.5 font-mono text-[9px] text-[#a08060]">{refCode(document.id)}</span>
        </div>

        {/* ── Left spine accent ── */}
        <div className="flex">
          <div className={`w-2 shrink-0 ${colors.spine} opacity-70`} />

          {/* ── Paper body ── */}
          <div className={`relative flex-1 ${colors.paper}`}>

            {/* Ruled lines */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 19px, #6b5033 19px, #6b5033 20px)',
                backgroundPositionY: '28px',
              }}
            />

            {/* Content preview */}
            <div className="relative z-10 min-h-[130px] px-4 pt-3 pb-2">
              {previewText ? (
                <p className="font-['Georgia',serif] line-clamp-6 text-[12.5px] leading-[20px] text-[#3a2e1e] opacity-80">
                  {previewText}
                </p>
              ) : (
                <p className="font-['Georgia',serif] text-[12px] italic leading-[20px] text-[#8a7460]">
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
              <div className="absolute left-3 bottom-3 flex items-center gap-1 text-[10px] text-[#8a6a42]">
                <RiAttachment2 className="h-3 w-3" />
                <span className="font-medium">PJ</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer strip ── */}
        <div className="border-t border-[#c8b89c] bg-[#ecdab8] px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-[12.5px] font-bold leading-tight text-[#2f2118]">
              {document.title}
            </h3>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#7a5e3c]">
            <span className="italic">{document.createdBy?.name ?? '—'}</span>
            <span className="font-mono tabular-nums">
              {new Date(document.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* ── Hover action overlay ── */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-b-lg bg-[#2f2118]/60 opacity-0 backdrop-blur-[2px] transition-all duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate(`/documents/${document.id}`); }}
            className="flex items-center gap-1.5 rounded-full bg-[#fffaf2] px-3.5 py-2 text-xs font-semibold text-[#2f2118] shadow-lg hover:bg-white"
          >
            <RiEyeLine className="h-3.5 w-3.5" /> Consulter
          </button>
          {canManage && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate(`/documents/${document.id}/edit`); }}
              className="flex items-center gap-1.5 rounded-full bg-[#806444] px-3.5 py-2 text-xs font-semibold text-amber-50 shadow-lg hover:bg-[#684f35]"
            >
              <RiPencilLine className="h-3.5 w-3.5" /> Modifier
            </button>
          )}
          {canManage && onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-full bg-[#a44b3f] px-3.5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-[#8f3e34]"
            >
              <RiDeleteBinLine className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
