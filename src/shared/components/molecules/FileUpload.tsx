import { useRef, useState } from 'react';
import { RiUploadCloud2Line, RiCloseLine, RiFileTextLine } from 'react-icons/ri';

interface FileUploadProps {
  onChange: (file: File | null) => void;
  value?: File | null;
  accept?: string;
  label?: string;
}

export const FileUpload = ({ onChange, value, accept = '*', label = 'Cliquer ou glisser un fichier' }: FileUploadProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onChange(file);
  };

  return (
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
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {value ? (
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dbeaf3] text-[#234C6A]">
            <RiFileTextLine className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-[#1B3C53]">{value.name}</p>
            <p className="text-xs text-[#456882]">{(value.size / 1024).toFixed(1)} Ko</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fce8ef] text-[#BD114A] hover:bg-[#f8c8d8]"
          >
            <RiCloseLine className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-[#456882]">
          <RiUploadCloud2Line className="h-8 w-8 text-[#7aaac4]" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-[#7aaac4]">PDF, Word, Image, Excel…</p>
        </div>
      )}
    </div>
  );
};
