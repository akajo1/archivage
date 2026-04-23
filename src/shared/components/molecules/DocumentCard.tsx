import { useNavigate } from 'react-router-dom';
import type { Document } from '../../../features/documents/types/document.types';
import { BadgePill } from '../atoms/BadgePill';
import { ConfidentialityTag } from '../atoms/ConfidentialityTag';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard = ({ document }: DocumentCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/documents/${document.id}`)}
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-indigo-200"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="flex-1 font-semibold text-gray-900 truncate">{document.title}</h3>
        <BadgePill name={document.badge.name} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <ConfidentialityTag level={document.confidentiality.level} />
        <span className="text-xs text-gray-400">
          {new Date(document.createdAt).toLocaleDateString('fr-FR')}
        </span>
      </div>
      <p className="mt-2 text-xs text-gray-500">Par {document.createdBy.name}</p>
    </div>
  );
};

