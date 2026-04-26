import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import html2pdf from 'html2pdf.js';
import Swal from 'sweetalert2';
import {
  RiArrowLeftLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiAttachment2,
  RiPrinterLine,
  RiCalendarLine,
  RiUserLine,
  RiShieldLine,
  RiPriceTag3Line,
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
      .then((data) => { if (active) { setDocument(data); setLoading(false); } })
      .catch(() => { if (active) { setError('Document introuvable ou accès refusé.'); setLoading(false); } });
    return () => { active = false; };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const result = await Swal.fire({
      title: 'Supprimer ce document ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#a44b3f',
      cancelButtonColor: '#806444',
    });
    if (!result.isConfirmed) return;
    try {
      await documentService.delete(id);
      void Swal.fire({ title: 'Supprimé !', icon: 'success', timer: 1200, showConfirmButton: false });
      navigate('/documents');
    } catch {
      void Swal.fire({ title: 'Erreur', text: 'Impossible de supprimer ce document.', icon: 'error' });
    }
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
    const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${document.title}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
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

  const canEdit = user?.role === 'admin' || user?.documentAccesses?.includes('edit') || document.createdBy?.id === user?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb + back */}
      <div className="mb-5 flex items-center gap-2 text-sm text-[#7a6a55]">
        <Link to="/" className="hover:text-[#5e3e27]">Accueil</Link>
        <span>/</span>
        <Link to="/documents" className="hover:text-[#5e3e27]">Documents</Link>
        <span>/</span>
        <span className="max-w-[200px] truncate font-medium text-[#2f2a24]">{document.title}</span>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-1.5 rounded-full border border-[#d8cab3] bg-[#f8f0e3] px-4 py-2 text-sm font-medium text-[#6b5a45] shadow-sm transition hover:bg-[#eedfc8]"
      >
        <RiArrowLeftLine className="h-4 w-4" /> Retour
      </button>

      <div className="arch-card overflow-hidden rounded-3xl">
        {/* Hero banner */}
        <div className="bg-linear-to-br from-[#efe2cb] via-[#eadac1] to-[#e2cfb2] px-8 py-8 border-b border-[#d8cab3]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold leading-snug text-[#2f2a24] sm:text-3xl">{document.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <BadgePill name={document.badge?.name as 'critique' | 'normal' | 'faible'} />
                <ConfidentialityTag level={document.confidentiality?.level ?? 'public'} />
              </div>
            </div>
            {/* Export / action buttons */}
            <div className="flex flex-wrap gap-2">
              {document.content && (
                <>
                  <Button size="sm" variant="secondary" onClick={() => void exportPdf()}>
                    <RiFilePdfLine className="h-3.5 w-3.5" /> PDF
                  </Button>
                  <Button size="sm" variant="secondary" onClick={exportWord}>
                    <RiFileWordLine className="h-3.5 w-3.5" /> Word
                  </Button>
                </>
              )}
              <Button size="sm" variant="secondary" onClick={handlePrint}>
                <RiPrinterLine className="h-3.5 w-3.5" /> Imprimer
              </Button>
            </div>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b border-[#e2d5c0] bg-[#fdf7ee] px-8 py-5 sm:grid-cols-4">
          <div className="flex items-start gap-2">
            <RiUserLine className="mt-0.5 h-4 w-4 shrink-0 text-[#9a8a77]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8a77]">Auteur</p>
              <p className="mt-0.5 text-sm font-medium text-[#5a4b38]">{document.createdBy?.name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RiCalendarLine className="mt-0.5 h-4 w-4 shrink-0 text-[#9a8a77]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8a77]">Créé le</p>
              <p className="mt-0.5 text-sm font-medium text-[#5a4b38]">
                {new Date(document.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RiPriceTag3Line className="mt-0.5 h-4 w-4 shrink-0 text-[#9a8a77]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8a77]">Badge</p>
              <p className="mt-0.5 text-sm font-medium capitalize text-[#5a4b38]">{document.badge?.name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RiShieldLine className="mt-0.5 h-4 w-4 shrink-0 text-[#9a8a77]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9a8a77]">Confidentialité</p>
              <p className="mt-0.5 text-sm font-medium capitalize text-[#5a4b38]">{document.confidentiality?.level ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-5 px-8 py-7">
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
                  <RiDownloadLine className="h-3 w-3" /> Télécharger le fichier
                </a>
              </div>
            </div>
          )}

          {document.content ? (
            <div className="rounded-2xl border border-[#dccdb8] bg-[#f8f0e3]/70 p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#9a8a77]">Contenu du document</p>
              <div
                ref={contentRef}
                className="prose prose-sm max-w-none text-[#3f352a] [&_img]:rounded-xl [&_a]:text-[#806444]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(document.content) }}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#d8cab3] bg-[#f8f3ea] px-6 py-10 text-center">
              <p className="text-sm text-[#7a6a55]">Ce document ne contient pas de contenu texte.</p>
            </div>
          )}
        </div>

        {/* Actions footer */}
        {(canEdit || isAdmin) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2d5c0] bg-[#f4ecdf] px-8 py-4">
            <span className="text-xs text-[#9a8a77]">
              {isAdmin ? 'Accès administrateur' : 'Vous êtes l\'auteur de ce document'}
            </span>
            <div className="flex gap-2">
              {canEdit && (
                <Button variant="secondary" size="sm" onClick={() => navigate(`/documents/${document.id}/edit`)}>
                  <RiPencilLine className="h-3.5 w-3.5" /> Modifier
                </Button>
              )}
              {isAdmin && (
                <Button variant="danger" size="sm" onClick={() => void handleDelete()}>
                  <RiDeleteBinLine className="h-3.5 w-3.5" /> Supprimer
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

