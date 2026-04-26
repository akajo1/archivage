import { useRef } from 'react';

interface FileUploadProps {
  onChange: (file: File | null) => void;
  value?: File | null;
  accept?: string;
}

export const FileUpload = ({ onChange, value, accept = '*' }: FileUploadProps) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => ref.current?.click()}
      className="cursor-pointer rounded-lg border-2 border-dashed border-[#ccb997] bg-[#f8f0e3] p-6 text-center transition-colors hover:border-[#9a7d58]"
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {value ? (
        <div className="flex items-center justify-center gap-2 text-sm text-[#6f563a]">
          <span>📄</span>
          <span className="max-w-xs truncate font-medium">{value.name}</span>
        </div>
      ) : (
        <div className="text-[#8f7f6a]">
          <p className="text-sm font-medium">Cliquer pour uploader un fichier</p>
          <p className="mt-1 text-xs">PDF, Word, Image...</p>
        </div>
      )}
    </div>
  );
};
