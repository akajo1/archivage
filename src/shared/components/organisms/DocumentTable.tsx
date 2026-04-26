import type { Document } from '../../../features/documents/types/document.types';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { DocumentCard } from '../molecules/DocumentCard';

interface DocumentTableProps {
  documents: Document[];
  onDelete?: (id: string) => void;
  canDelete?: boolean;
  canEdit?: boolean;
}

export const DocumentTable = ({ documents, onDelete, canDelete, canEdit }: DocumentTableProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  if (documents.length === 0) {
    return (
      <div className="arch-card flex flex-col items-center justify-center rounded-3xl border-dashed py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eadbc4] text-3xl shadow-sm">
          🗂️
        </div>
        <p className="mt-5 text-base font-semibold text-[#4f3f2f]">Aucun document trouvé</p>
        <p className="mt-1 text-sm text-[#8f7f6a]">Modifiez vos filtres ou créez un nouveau document</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          canManage={canEdit || isAdmin || doc.createdBy?.id === user?.id}
          onDelete={canDelete || isAdmin ? onDelete : undefined}
        />
      ))}
    </div>
  );
};
