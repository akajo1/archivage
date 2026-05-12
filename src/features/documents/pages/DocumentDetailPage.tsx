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
  RiHashtag,
  RiAlignLeft,
  RiFileTextLine,
  RiEyeLine,
  RiCloseLine,
  RiSendPlane2Line,
  RiArchiveLine,
  RiInboxUnarchiveLine,
} from 'react-icons/ri';
import { documentService } from '../services/documentService';
import type { Document } from '../types/document.types';
import { BadgePill } from '../../../shared/components/atoms/BadgePill';
import { ConfidentialityTag } from '../../../shared/components/atoms/ConfidentialityTag';
import { Button } from '../../../shared/components/atoms/Button';
import { IconButton } from '../../../shared/components/atoms/IconButton';
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { usePermissions } from '../../auth/hooks/usePermissions';
import { mailRoutingClient } from '../../mail-routing/services/mailRoutingClient';

interface DocumentDetailPageProps {
  embedded?: boolean;
  documentId?: string;
  onClose?: () => void;
  onDeleted?: () => void;
}

export const DocumentDetailPage = ({
  embedded = false,
  documentId,
  onClose,
  onDeleted,
}: DocumentDetailPageProps = {}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resolvedId = documentId ?? id;
  const { canEditFeature, canDeleteFeature } = usePermissions();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>('');
  const [showRoutingModal, setShowRoutingModal] = useState(false);
  const [routingDueDate, setRoutingDueDate] = useState('');
  const [routingNotes, setRoutingNotes] = useState('');
  const [routingLoading, setRoutingLoading] = useState(false);

  const openPreview = (url: string, name: string) => {
    setPreviewUrl(url);
    setPreviewName(name);
  };
  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewName('');
  };

  const isImage = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
  const isPdf = (url: string) => /\.pdf$/i.test(url);

  useEffect(() => {
    if (!resolvedId) return;
    let active = true;
    documentService.getById(resolvedId)
      .then((data) => { if (active) { setDocument(data); setLoading(false); } })
      .catch(() => { if (active) { setError('Document introuvable ou accès refusé.'); setLoading(false); } });
    return () => { active = false; };
  }, [resolvedId]);

  const handleDelete = async () => {
    if (!resolvedId) return;
    const result = await Swal.fire({
      title: 'Supprimer ce document ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#BD114A',
      cancelButtonColor: '#456882',
    });
    if (!result.isConfirmed) return;
    try {
      await documentService.delete(resolvedId);
      void Swal.fire({ title: 'Supprimé !', icon: 'success', timer: 1200, showConfirmButton: false });
      onDeleted?.();
      onClose?.();
      if (embedded) return;
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

  if (!resolvedId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl">⚠️</span>
        <p className="mt-4 text-lg font-medium text-[#BD114A]">Document introuvable.</p>
        <Button className="mt-4" onClick={() => navigate('/documents')}>Retour</Button>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="text-5xl">⚠️</span>
        <p className="mt-4 text-lg font-medium text-[#BD114A]">{error || 'Document introuvable'}</p>
        <Button className="mt-4" onClick={() => navigate('/documents')}>Retour</Button>
      </div>
    );
  }

  const canEdit = canEditFeature('documents');
  const canDelete = canDeleteFeature('documents');
  const canRoute = canEditFeature('mail_routing') || canEditFeature('documents');
  const isArchived = document.status === 'archived';

  const handleInitiateRouting = async () => {
    if (!resolvedId) return;
    setRoutingLoading(true);
    try {
      const routing = await mailRoutingClient.initializeRouting({
        documentId: resolvedId,
        dueDate: routingDueDate || undefined,
        notes: routingNotes || undefined,
      });
      setShowRoutingModal(false);
      void Swal.fire({
        title: 'Circuit initié !',
        text: 'Le document est maintenant en circuit de traitement.',
        icon: 'success',
        confirmButtonText: 'Voir le circuit',
        confirmButtonColor: '#234C6A',
        showCancelButton: true,
        cancelButtonText: 'Rester ici',
      }).then((result) => {
        if (result.isConfirmed) navigate(`/mail-routing/${routing.id}`);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'initiation du circuit.';
      void Swal.fire({ title: 'Erreur', text: msg, icon: 'error' });
    } finally {
      setRoutingLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!resolvedId || !document) return;
    const result = await Swal.fire({
      title: 'Archiver ce document ?',
      text: 'Le document sera déplacé dans les archives. Vous pourrez le désarchiver.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, archiver',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#234C6A',
    });
    if (!result.isConfirmed) return;
    try {
      const updated = await documentService.archive(resolvedId);
      setDocument(updated);
      void Swal.fire({ title: 'Archivé !', icon: 'success', timer: 1400, showConfirmButton: false });
    } catch {
      void Swal.fire({ title: 'Erreur', text: 'Impossible d\'archiver ce document.', icon: 'error' });
    }
  };

  const handleUnarchive = async () => {
    if (!resolvedId || !document) return;
    const result = await Swal.fire({
      title: 'Désarchiver ce document ?',
      text: 'Le document sera remis dans la liste des documents actifs.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, désarchiver',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#456882',
    });
    if (!result.isConfirmed) return;
    try {
      const updated = await documentService.unarchive(resolvedId);
      setDocument(updated);
      void Swal.fire({ title: 'Désarchivé !', icon: 'success', timer: 1400, showConfirmButton: false });
    } catch {
      void Swal.fire({ title: 'Erreur', text: 'Impossible de désarchiver ce document.', icon: 'error' });
    }
  };

  return (
    <div className={embedded ? 'mx-auto max-w-4xl px-2 py-2' : 'mx-auto max-w-4xl px-4 py-8'}>
      {/* Breadcrumb + back */}
      {!embedded && <div className="mb-5 flex items-center gap-2 text-sm text-[#456882]">
        <Link to="/" className="hover:text-[#234C6A]">Accueil</Link>
        <span>/</span>
        <Link to="/documents" className="hover:text-[#234C6A]">Documents</Link>
        <span>/</span>
        <span className="max-w-[200px] truncate font-medium text-[#1B3C53]">{document.title}</span>
      </div>}

      {!embedded && <button
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-1.5 rounded-full border border-[#c4d4df] bg-[#edf4f8] px-4 py-2 text-sm font-medium text-[#456882] shadow-sm transition hover:bg-[#dbeaf3]"
      >
        <RiArrowLeftLine className="h-4 w-4" /> Retour
      </button>}

      <div className="arch-card overflow-hidden rounded-3xl">
        {/* Hero banner */}
        <div className="arch-hero px-8 py-8 border-b border-[#1a3850]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold leading-snug text-white sm:text-3xl">{document.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <BadgePill name={document.badge?.name as 'critique' | 'normal' | 'faible'} />
                <ConfidentialityTag level={document.confidentiality?.level ?? 'public'} />
                {isArchived && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-0.5 text-xs font-semibold text-amber-200">
                    <RiArchiveLine className="h-3.5 w-3.5" /> Archivé
                  </span>
                )}
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
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b border-[#dde8f0] bg-[#f4f7fa] px-8 py-5 sm:grid-cols-4">
          <div className="flex items-start gap-2">
            <RiUserLine className="mt-0.5 h-4 w-4 shrink-0 text-[#7aaac4]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Auteur</p>
              <p className="mt-0.5 text-sm font-medium text-[#1B3C53]">{document.createdBy?.name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RiCalendarLine className="mt-0.5 h-4 w-4 shrink-0 text-[#7aaac4]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Créé le</p>
              <p className="mt-0.5 text-sm font-medium text-[#1B3C53]">
                {new Date(document.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RiPriceTag3Line className="mt-0.5 h-4 w-4 shrink-0 text-[#7aaac4]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Badge</p>
              <p className="mt-0.5 text-sm font-medium capitalize text-[#1B3C53]">{document.badge?.name ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <RiShieldLine className="mt-0.5 h-4 w-4 shrink-0 text-[#7aaac4]" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Confidentialité</p>
              <p className="mt-0.5 text-sm font-medium capitalize text-[#1B3C53]">{document.confidentiality?.level ?? '—'}</p>
            </div>
          </div>
          {document.reference && (
            <div className="flex items-start gap-2 col-span-2 sm:col-span-4">
              <RiHashtag className="mt-0.5 h-4 w-4 shrink-0 text-[#7aaac4]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#456882]">Référence</p>
                <p className="mt-0.5 font-mono text-sm font-medium text-[#1B3C53]">{document.reference}</p>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="space-y-5 px-8 py-7">

          {/* Description */}
          {document.description && (
            <div className="rounded-2xl border border-[#c4d4df] bg-[#edf4f8] p-5">
              <div className="mb-2 flex items-center gap-2">
                <RiAlignLeft className="h-4 w-4 text-[#7aaac4]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#456882]">Description</p>
              </div>
              <p className="text-sm text-[#1B3C53] whitespace-pre-line">{document.description}</p>
            </div>
          )}

          {/* Main file */}
          {document.fileUrl && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#c4d4df] bg-[#edf4f8] px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#dbeaf3] text-[#234C6A]">
                <RiFileTextLine className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1B3C53]">Fichier principal</p>
                <p className="text-xs text-[#456882] truncate">{document.fileUrl.split('/').pop()}</p>
              </div>
              <div className="flex items-center gap-2">
                {(isImage(document.fileUrl) || isPdf(document.fileUrl)) && (
                  <button
                    type="button"
                    onClick={() => openPreview(document.fileUrl!, document.title)}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#dbeaf3] px-3 py-1.5 text-xs font-medium text-[#234C6A] hover:bg-[#c8dcea]"
                  >
                    <RiEyeLine className="h-3.5 w-3.5" /> Aperçu
                  </button>
                )}
                <a
                  href={document.fileUrl}
                  download
                  className="inline-flex items-center gap-1 rounded-lg bg-[#234C6A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B3C53]"
                >
                  <RiDownloadLine className="h-3.5 w-3.5" /> Télécharger
                </a>
              </div>
            </div>
          )}

          {/* Content */}
          {document.content ? (
            <div className="rounded-2xl border border-[#c4d4df] bg-[#f4f7fa] p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#456882]">Contenu du document</p>
              <div
                ref={contentRef}
                className="prose prose-sm max-w-none text-[#1B3C53] [&_img]:rounded-xl [&_a]:text-[#234C6A]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(document.content) }}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#c4d4df] bg-[#edf4f8] px-6 py-8 text-center">
              <p className="text-sm text-[#456882]">Ce document ne contient pas de contenu texte.</p>
            </div>
          )}

          {/* Annexes */}
          {document.attachments && document.attachments.length > 0 && (
            <div className="rounded-2xl border border-[#c4d4df] bg-white">
              <div className="flex items-center gap-2 border-b border-[#dde8f0] px-5 py-3">
                <RiAttachment2 className="h-4 w-4 text-[#234C6A]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[#456882]">
                  Fichiers annexes ({document.attachments.length})
                </p>
              </div>
              <div className="divide-y divide-[#dde8f0]">
                {document.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf4f8] text-[#234C6A]">
                      <RiAttachment2 className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1B3C53]">{att.fileName}</p>
                      {att.fileSize && (
                        <p className="text-xs text-[#456882]">
                          {att.fileSize < 1024 * 1024
                            ? `${(att.fileSize / 1024).toFixed(1)} Ko`
                            : `${(att.fileSize / (1024 * 1024)).toFixed(1)} Mo`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {(isImage(att.fileUrl) || isPdf(att.fileUrl)) && (
                        <button
                          type="button"
                          onClick={() => openPreview(att.fileUrl, att.fileName)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#edf4f8] px-3 py-1.5 text-xs font-medium text-[#234C6A] hover:bg-[#dbeaf3]"
                        >
                          <RiEyeLine className="h-3.5 w-3.5" /> Aperçu
                        </button>
                      )}
                      <a
                        href={att.fileUrl}
                        download={att.fileName}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#234C6A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B3C53]"
                      >
                        <RiDownloadLine className="h-3.5 w-3.5" /> Télécharger
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions footer */}
        {(canEdit || canDelete || canRoute) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dde8f0] bg-[#f4f7fa] px-8 py-4">
            <span className="text-xs text-[#456882]">
              Actions autorisees selon vos permissions
            </span>
            <div className="flex flex-wrap gap-2">
              {canRoute && !isArchived && (
                <Button size="sm" variant="secondary" onClick={() => setShowRoutingModal(true)}>
                  <RiSendPlane2Line className="h-3.5 w-3.5" /> Initier un circuit
                </Button>
              )}
              {canEdit && !isArchived && (
                <IconButton
                  icon={<RiPencilLine className="h-4 w-4" />}
                  label="Modifier"
                  variant="default"
                  size="md"
                  onClick={() => navigate(`/documents/${document.id}/edit`)}
                />
              )}
              {canEdit && !isArchived && (
                <button
                  onClick={() => void handleArchive()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
                >
                  <RiArchiveLine className="h-4 w-4" /> Archiver
                </button>
              )}
              {canEdit && isArchived && (
                <button
                  onClick={() => void handleUnarchive()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#c4d4df] bg-[#edf4f8] px-3 py-2 text-sm font-medium text-[#456882] hover:bg-[#dbeaf3] transition"
                >
                  <RiInboxUnarchiveLine className="h-4 w-4" /> Désarchiver
                </button>
              )}
              {canDelete && (
                <IconButton
                  icon={<RiDeleteBinLine className="h-4 w-4" />}
                  label="Supprimer"
                  variant="danger"
                  size="md"
                  onClick={() => void handleDelete()}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Routing Modal */}
      {showRoutingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowRoutingModal(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#dde8f0] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#dde8f0] px-5 py-4">
              <p className="font-semibold text-[#1B3C53]">📤 Initier un circuit de traitement</p>
              <button type="button" onClick={() => setShowRoutingModal(false)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#456882] hover:bg-[#edf4f8]">
                <RiCloseLine className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-sm text-[#456882]">
                Le document <strong className="text-[#1B3C53]">«{document.title}»</strong> sera mis en circuit de traitement. Vous pourrez ensuite le transmettre à d'autres utilisateurs.
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Date d'échéance (optionnel)</label>
                <input
                  type="date"
                  value={routingDueDate}
                  onChange={(e) => setRoutingDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2 text-sm text-[#1B3C53] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#1B3C53]">Notes / instructions (optionnel)</label>
                <textarea
                  value={routingNotes}
                  onChange={(e) => setRoutingNotes(e.target.value)}
                  rows={3}
                  placeholder="Ajouter des instructions pour les destinataires..."
                  className="w-full resize-none rounded-xl border border-[#c4d4df] bg-[#f4f7fa] px-3 py-2 text-sm text-[#1B3C53] placeholder:text-[#7aaac4] focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                />
              </div>
              <div className="rounded-xl bg-[#edf4f8] p-3 text-xs text-[#456882]">
                💡 Après initiation, vous pourrez transmettre le document à d'autres utilisateurs, en copie (CC) ou en lecture seule, et le clôturer en l'archivant.
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => void handleInitiateRouting()}
                  isLoading={routingLoading}
                >
                  <RiSendPlane2Line className="h-4 w-4" /> Initier le circuit
                </Button>
                <Button variant="secondary" onClick={() => setShowRoutingModal(false)}>Annuler</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closePreview}
        >
          <div
            className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between gap-3 border-b border-[#dde8f0] bg-[#f4f7fa] px-5 py-3">
              <p className="truncate text-sm font-semibold text-[#1B3C53]">{previewName}</p>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  download={previewName}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#234C6A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1B3C53]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RiDownloadLine className="h-3.5 w-3.5" /> Télécharger
                </a>
                <button
                  type="button"
                  onClick={closePreview}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4f8] text-[#456882] hover:bg-[#dbeaf3]"
                >
                  <RiCloseLine className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-auto bg-[#1B3C53]/10">
              {isImage(previewUrl) ? (
                <img
                  src={previewUrl}
                  alt={previewName}
                  className="mx-auto max-h-[75vh] object-contain p-4"
                />
              ) : isPdf(previewUrl) ? (
                <iframe
                  src={previewUrl}
                  title={previewName}
                  className="h-[75vh] w-full border-0"
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

