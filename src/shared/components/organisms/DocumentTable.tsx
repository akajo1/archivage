import type { Document } from '../../../features/documents/types/document.types';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { DocumentCard } from '../molecules/DocumentCard';

interface DocumentTableProps {
  documents: Document[];
  onDelete?: (id: string) => void;
}

export const DocumentTable = ({ documents, onDelete }: DocumentTableProps) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  if (documents.length === 0) {
    return (
      <div className="arch-card flex flex-col items-center justify-center rounded-3xl border-dashed py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eadbc4] text-3xl shadow-sm">
          📂
        </div>
        <p className="mt-5 text-base font-semibold text-[#4f3f2f]">Aucun document trouve</p>
        <p className="mt-1 text-sm text-[#8f7f6a]">Modifiez vos filtres ou creez un nouveau document</p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
      {documents.map((doc) => (
        <div key={doc.id} className="mb-4 break-inside-avoid">
          <DocumentCard
            document={doc}
            canManage={isAdmin || doc.createdBy.id === user?.id}
            onDelete={isAdmin ? onDelete : undefined}
          />
        </div>
      ))}
    </div>
  );
};
