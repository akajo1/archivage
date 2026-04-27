import { Link } from 'react-router-dom';
import {
  RiEyeLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiAttachment2,
  RiFileTextLine,
} from 'react-icons/ri';
import type { Document } from '../../../features/documents/types/document.types';
import { BadgePill } from '../atoms/BadgePill';
import { ConfidentialityTag } from '../atoms/ConfidentialityTag';
import { IconButton } from '../atoms/IconButton';
import { useNavigate } from 'react-router-dom';

interface DocumentListViewProps {
  documents: Document[];
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  canEdit?: boolean;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export const DocumentListView = ({ documents, onDelete, canDelete, canEdit }: DocumentListViewProps) => {
  const navigate = useNavigate();

  if (documents.length === 0) {
    return (
      <div className="arch-card flex flex-col items-center justify-center rounded-3xl border-dashed py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dbeaf3] text-3xl shadow-sm">
          📂
        </div>
        <p className="mt-5 text-base font-semibold text-[#1B3C53]">Aucun document trouvé</p>
        <p className="mt-1 text-sm text-[#456882]">Modifiez vos filtres ou créez un nouveau document</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#c4d4df] bg-white">
      {/* Header row */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-[#dde8f0] bg-[#edf4f8] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#456882]">
        <span>Titre</span>
        <span>Badge</span>
        <span>Confidentialité</span>
        <span className="hidden sm:block">Date</span>
        <span />
      </div>

      <div className="divide-y divide-[#dde8f0]">
        {documents.map((doc) => {
          return (
            <div
              key={doc.id}
              className="group grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-4 px-5 py-3 transition-colors hover:bg-[#f4f7fa]"
            >
              {/* Title */}
              <Link
                to={`/documents/${doc.id}`}
                className="flex min-w-0 items-center gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dbeaf3] text-[#234C6A]">
                  {doc.fileUrl
                    ? <RiAttachment2 className="h-4 w-4" />
                    : <RiFileTextLine className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1B3C53] group-hover:text-[#234C6A]">
                    {doc.title}
                  </p>
                  <p className="truncate text-xs text-[#456882]">{doc.createdBy?.name ?? '—'}</p>
                </div>
              </Link>

              {/* Badge */}
              <div>
                <BadgePill name={doc.badge?.name as 'critique' | 'normal' | 'faible'} />
              </div>

              {/* Confidentiality */}
              <div>
                <ConfidentialityTag level={doc.confidentiality?.level ?? 'public'} />
              </div>

              {/* Date */}
              <span className="hidden text-xs text-[#456882] sm:block">
                {formatDate(doc.createdAt)}
              </span>

               {/* Actions */}
               <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                 <IconButton
                   icon={<RiEyeLine className="h-3.5 w-3.5" />}
                   label="Voir"
                   onClick={() => navigate(`/documents/${doc.id}`)}
                 />
                  {canEdit && (
                   <IconButton
                     icon={<RiPencilLine className="h-3.5 w-3.5" />}
                     label="Modifier"
                     variant="success"
                     onClick={() => navigate(`/documents/${doc.id}/edit`)}
                   />
                 )}
                  {canDelete && onDelete && (
                   <IconButton
                     icon={<RiDeleteBinLine className="h-3.5 w-3.5" />}
                     label="Supprimer"
                     variant="danger"
                     onClick={() => onDelete(doc.id)}
                   />
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

