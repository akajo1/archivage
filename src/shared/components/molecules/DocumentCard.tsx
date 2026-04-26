import { useNavigate } from 'react-router-dom';
import { RiEyeLine, RiPencilLine, RiDeleteBinLine, RiAttachment2 } from 'react-icons/ri';
import type { Document } from '../../../features/documents/types/document.types';
import { BadgePill } from '../atoms/BadgePill';
import { ConfidentialityTag } from '../atoms/ConfidentialityTag';
import { Button } from '../atoms/Button';

interface DocumentCardProps {
  document: Document;
  canManage?: boolean;
  onDelete?: (id: string) => void;
}

const previewHeights = ['h-36', 'h-44', 'h-52', 'h-60'];

const badgeGradients: Record<string, string> = {
  critique: 'from-[#f2d6cf] via-[#efd8d2] to-[#e8c2ba]',
  normal: 'from-[#dde7df] via-[#d7e3d9] to-[#c8d9cd]',
  faible: 'from-[#efe4d2] via-[#e8dcc8] to-[#dfcfb5]',
};

const getPreviewHeight = (id: string) => {
  const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return previewHeights[seed % previewHeights.length];
};

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const getPreviewCopy = (document: Document) => {
  if (document.content) {
    const text = stripHtml(document.content);
    if (text.length > 0) return text;
  }
  return 'Cliquez pour consulter les details de ce document.';
};

export const DocumentCard = ({ document, canManage = false, onDelete }: DocumentCardProps) => {
  const navigate = useNavigate();

  const previewHeight = getPreviewHeight(document.id);
  const previewCopy = getPreviewCopy(document);
  const gradient = badgeGradients[document.badge.name] ?? 'from-[#eadbc4] via-[#e6d7c0] to-[#deccb0]';

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.(document.id);
  };

  return (
    <div
      onClick={() => navigate(`/documents/${document.id}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#d8cab3] bg-[#fffaf2] shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Preview area */}
      <div className={`relative ${previewHeight} bg-linear-to-br ${gradient} p-5`}>
        <p className="line-clamp-5 max-w-[88%] text-sm font-[430] leading-relaxed text-[#4b3d30]">
          {previewCopy}
        </p>
        {document.fileUrl && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-[#fffcf5]/90 px-2.5 py-1 text-[11px] font-medium text-[#69553f] backdrop-blur-sm shadow-sm">
            <RiAttachment2 className="h-3 w-3" /> Fichier
          </span>
        )}
      </div>

      {/* Body */}
      <div className="space-y-2.5 p-4">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-[#2f2a24]">
          {document.title}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          <BadgePill name={document.badge.name} />
          <ConfidentialityTag level={document.confidentiality.level} />
        </div>

        <div className="flex items-center justify-between text-xs text-[#8b7b67]">
          <span>{document.createdBy.name}</span>
          <span>{new Date(document.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>

        {/* Actions — hidden on desktop until hover */}
        <div className="flex items-center justify-end gap-1.5 pt-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); navigate(`/documents/${document.id}`); }}
          >
            <RiEyeLine className="h-3.5 w-3.5" /> Voir
          </Button>
          {canManage && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); navigate(`/documents/${document.id}/edit`); }}
            >
              <RiPencilLine className="h-3.5 w-3.5" /> Modifier
            </Button>
          )}
          {canManage && onDelete && (
            <Button size="sm" variant="danger" onClick={handleDelete}>
              <RiDeleteBinLine className="h-3.5 w-3.5" /> Supprimer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
