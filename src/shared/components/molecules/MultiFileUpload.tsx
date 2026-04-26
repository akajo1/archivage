import { useRef, useState } from 'react';
import {
  RiUploadCloud2Line,
  RiCloseLine,
  RiFileTextLine,
  RiFilePdfLine,
  RiFileImageLine,
  RiFileExcelLine,
  RiAddLine,
} from 'react-icons/ri';

interface MultiFileUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
}

const getFileIcon = (file: File) => {
  const t = file.type;
  if (t === 'application/pdf') return <RiFilePdfLine className="h-5 w-5 text-[#BD114A]" />;
  if (t.startsWith('image/')) return <RiFileImageLine className="h-5 w-5 text-[#2FA084]" />;
  if (t.includes('spreadsheet') || t.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))
    return <RiFileExcelLine className="h-5 w-5 text-[#2FA084]" />;
  return <RiFileTextLine className="h-5 w-5 text-[#234C6A]" />;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

export const MultiFileUpload = ({
  value,
  onChange,
  accept = '*',
  maxFiles = 20,
}: MultiFileUploadProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    const merged = [...value, ...arr].slice(0, maxFiles);
    onChange(merged);
  };

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-5 text-center transition-colors
          ${dragging ? 'border-[#234C6A] bg-[#dbeaf3]' : 'border-[#c4d4df] bg-[#edf4f8] hover:border-[#456882] hover:bg-[#dbeaf3]'}`}
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 text-[#456882]">
          <RiUploadCloud2Line className="h-8 w-8 text-[#7aaac4]" />
          <p className="text-sm font-medium">
            Glisser-déposer ou cliquer pour ajouter des annexes
          </p>
          <p className="text-xs text-[#7aaac4]">
            PDF, Word, Excel, Images — max {maxFiles} fichiers
          </p>
        </div>
      </div>

      {/* File list */}
      {value.length > 0 && (
        <div className="divide-y divide-[#dde8f0] overflow-hidden rounded-xl border border-[#c4d4df] bg-white">
          {value.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4f8]">
                {getFileIcon(file)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1B3C53]">{file.name}</p>
                <p className="text-xs text-[#456882]">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fce8ef] text-[#BD114A] hover:bg-[#f8c8d8]"
                title="Retirer ce fichier"
              >
                <RiCloseLine className="h-4 w-4" />
              </button>
            </div>
          ))}

          {value.length < maxFiles && (
            <button
              type="button"
              onClick={() => ref.current?.click()}
              className="flex w-full items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-[#234C6A] hover:bg-[#f4f7fa]"
            >
              <RiAddLine className="h-4 w-4" /> Ajouter d'autres fichiers
            </button>
          )}
        </div>
      )}
    </div>
  );
};

