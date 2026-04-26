import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import html2pdf from 'html2pdf.js';
import {
  RiArrowLeftLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiAttachment2,
} from 'react-icons/ri';
import { documentService } from '../services/documentService';
import type { Document } from '../types/document.types';
import { BadgePill } from '../../../shared/components/atoms/BadgePill';
import { ConfidentialityTag } from '../../../shared/components/atoms/ConfidentialityTag';
import { Button } from '../../../shared/components/atoms/Button';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { useAuthStore } from '../../auth/store/authStore';

export const DocumentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;

    let active = true;

    documentService.getById(id)
      .then((data) => {
        if (active) {
          setDocument(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Document introuvable ou acces refuse.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Supprimer ce document definitivement ?')) return;
    await documentService.delete(id);
    navigate('/documents');
  };

  const exportPdf = async () => {
    if (!contentRef.current || !document) return;
    await html2pdf()
      .set({
        margin: 10,
        filename: `${document.title}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(contentRef.current)
      .save();
  };

  const exportWord = () => {
    if (!document) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${document.content || ''}</body></html>`;
    const blob = new Blob([html], {
      type: 'application/msword;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl">⚠️</span>
        <p className="mt-4 text-lg font-medium text-[#8b3e34]">Document introuvable.</p>
        <Button className="mt-4" onClick={() => navigate('/documents')}>Retour</Button>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl">⚠️</span>
        <p className="mt-4 text-lg font-medium text-[#8b3e34]">{error || 'Document introuvable'}</p>
        <Button className="mt-4" onClick={() => navigate('/documents')}>Retour</Button>
      </div>
    );
  }

  const canEdit = user?.role === 'admin' || document.createdBy.id === user?.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 rounded-full border border-[#d8cab3] bg-[#f8f0e3] px-4 py-2 text-sm font-medium text-[#6b5a45] shadow-sm transition hover:bg-[#eedfc8]"
      >
        <RiArrowLeftLine className="h-4 w-4" /> Retour a la liste
      </button>

      <div className="arch-card overflow-hidden rounded-3xl">
        <div className="bg-linear-to-br from-[#efe2cb] via-[#eadac1] to-[#e2cfb2] px-8 py-8 border-b border-[#d8cab3]">
          <div className="flex items-start justify-between gap-4">
            <h1 className="flex-1 text-2xl font-bold leading-snug text-[#2f2a24]">{document.title}</h1>
            <BadgePill name={document.badge.name} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <ConfidentialityTag level={document.confidentiality.level} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b border-[#e2d5c0] px-8 py-5 text-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9a8a77]">Auteur</p>
            <p className="mt-1 font-medium text-[#5a4b38]">{document.createdBy.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9a8a77]">Cree le</p>
            <p className="mt-1 font-medium text-[#5a4b38]">
              {new Date(document.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="space-y-4 px-8 py-6">
          {document.fileUrl && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#d5c3a7] bg-[#f3e8d5] px-4 py-3">
              <RiAttachment2 className="shrink-0 text-xl text-[#806444]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#5a4b38]">Fichier joint</p>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#77593a] hover:underline"
                >
                  <RiDownloadLine className="h-3 w-3" /> Telecharger le fichier
                </a>
              </div>
            </div>
          )}

          {document.content && (
            <div className="rounded-2xl border border-[#dccdb8] bg-[#f8f0e3]/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#5a4b38]">Contenu du document</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => void exportPdf()}>
                    <RiFilePdfLine className="h-3.5 w-3.5" /> PDF
                  </Button>
                  <Button size="sm" variant="secondary" onClick={exportWord}>
                    <RiFileWordLine className="h-3.5 w-3.5" /> Word
                  </Button>
                </div>
              </div>
              <div
                ref={contentRef}
                className="prose max-w-none text-sm text-[#3f352a]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(document.content) }}
              />
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex justify-end gap-3 border-t border-[#e2d5c0] bg-[#f4ecdf] px-8 py-4">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/documents/${document.id}/edit`)}>
              <RiPencilLine className="h-3.5 w-3.5" /> Modifier
            </Button>
            {user?.role === 'admin' && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <RiDeleteBinLine className="h-3.5 w-3.5" /> Supprimer
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

