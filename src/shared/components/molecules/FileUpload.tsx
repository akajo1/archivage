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
      className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-indigo-400 transition-colors"
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {value ? (
        <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
          <span>📄</span>
          <span className="font-medium truncate max-w-xs">{value.name}</span>
        </div>
      ) : (
        <div className="text-gray-400">
          <p className="text-sm font-medium">Cliquer pour uploader un fichier</p>
          <p className="text-xs mt-1">PDF, Word, Image...</p>
        </div>
      )}
    </div>
  );
};

