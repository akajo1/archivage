import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import DOMPurify from 'dompurify';
import {
  RiArrowLeftLine, RiCheckLine, RiCloseLine, RiSaveLine,
  RiEyeLine, RiPencilLine, RiInformationLine,
  RiFileTextLine, RiAttachment2, RiBookmarkLine,
  RiAlignLeft, RiUploadCloud2Line,
} from 'react-icons/ri';
import { documentService } from '../services/documentService';
import { badgeService } from '../../badges/services/badgeService';
import { confidentialityService } from '../../confidentiality/services/confidentialityService';
import type { CreateDocumentPayload } from '../types/document.types';
import type { Badge } from '../../badges/types/badge.types';
import type { Confidentiality } from '../../confidentiality/types/confidentiality.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { FormField } from '../../../shared/components/molecules/FormField';
import { FileUpload } from '../../../shared/components/molecules/FileUpload';
import { MultiFileUpload } from '../../../shared/components/molecules/MultiFileUpload';
import { RichTextEditor } from '../../../shared/components/molecules/RichTextEditor';
import { Spinner } from '../../../shared/components/atoms/Spinner';

type ContentMode = 'upload' | 'write';

interface FormValues {
  title: string;
  reference: string;
  description: string;
  badge_id: string;
  confidentiality_id: string;
}

const DRAFT_KEY = 'doc_draft';

/* ─── Section card helper ─── */
const SectionCard = ({
  icon, title, children, badge,
}: { icon: React.ReactNode; title: string; children: React.ReactNode; badge?: string }) => (
  <div className="overflow-hidden rounded-2xl border border-[#dde8f0] bg-white shadow-sm">
    <div className="flex items-center gap-2.5 border-b border-[#dde8f0] bg-[#f4f7fa] px-5 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dbeaf3] text-[#234C6A]">
        {icon}
      </span>
      <span className="text-sm font-semibold text-[#1B3C53]">{title}</span>
      {badge && (
        <span className="ml-auto rounded-full bg-[#dbeaf3] px-2 py-0.5 text-[10px] font-medium text-[#234C6A]">
          {badge}
        </span>
      )}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ─── Mode selector card ─── */
const ModeOption = ({
  active, onClick, icon, title, description,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-1 flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all ${
      active
        ? 'border-[#234C6A] bg-[#edf4f8] shadow-md'
        : 'border-[#dde8f0] bg-white hover:border-[#a8c8de] hover:bg-[#f4f7fa]'
    }`}
  >
    <span className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
      active ? 'bg-[#234C6A] text-white' : 'bg-[#edf4f8] text-[#456882]'
    }`}>
      {icon}
    </span>
    <div>
      <p className={`text-sm font-semibold ${active ? 'text-[#1B3C53]' : 'text-[#456882]'}`}>{title}</p>
      <p className="mt-0.5 text-xs text-[#7aaac4]">{description}</p>
    </div>
    {active && (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#234C6A] text-white">
        <RiCheckLine className="h-3 w-3" />
      </span>
    )}
  </button>
);

interface DocumentFormPageProps {
  embedded?: boolean;
  onCancel?: () => void;
  onSaved?: () => void;
}

export const DocumentFormPage = ({
  embedded = false,
  onCancel,
  onSaved,
}: DocumentFormPageProps = {}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [confidentialities, setConfidentialities] = useState<Confidentiality[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [annexes, setAnnexes] = useState<File[]>([]);
  const [contentMode, setContentMode] = useState<ContentMode | null>(() => {
    if (isEdit) return 'write';
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return null;
      const draft = JSON.parse(saved) as { mode?: ContentMode };
      return draft.mode ?? null;
    } catch {
      return null;
    }
  });
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);
  const [content, setContent] = useState<string>(() => {
    if (isEdit) return '<p></p>';
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as { content?: string };
        if (draft.content) return draft.content;
      }
    } catch { /* ignore */ }
    return '<p></p>';
  });
  const [loading, setLoading] = useState(isEdit);
  const [apiError, setApiError] = useState('');
  const [modeError, setModeError] = useState('');
  const [contentError, setContentError] = useState('');
  const [fileError, setFileError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const watchedTitle = useWatch({ control, name: 'title', defaultValue: '' });

  useEffect(() => {
    Promise.all([badgeService.getAll(), confidentialityService.getAll()])
      .then(([b, c]) => { setBadges(b); setConfidentialities(c); });
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      documentService.getById(id).then((doc) => {
        reset({
          title: doc.title,
          reference: doc.reference ?? '',
          description: doc.description ?? '',
          badge_id: doc.badge.id,
          confidentiality_id: doc.confidentiality.id,
        });
        setContent(doc.content || '<p></p>');
        setExistingFileUrl(doc.fileUrl ?? null);
        // Auto-detect mode: if doc has a fileUrl and no content, default to upload
        if (doc.fileUrl && (!doc.content || doc.content === '<p></p>')) {
          setContentMode('upload');
        } else {
          setContentMode('write');
        }
        setLoading(false);
      });
    } else {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const draft = JSON.parse(saved) as { title?: string };
          if (draft.title) reset({ title: draft.title });
        }
      } catch { /* ignore */ }
    }
  }, [id, isEdit, reset]);

  // Auto-save draft
  useEffect(() => {
    if (isEdit) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: watchedTitle, content, mode: contentMode }));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch { /* ignore */ }
    }, 1500);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [watchedTitle, content, contentMode, isEdit]);

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError('');
      setModeError('');
      setContentError('');
      setFileError('');

      if (!contentMode) {
        setModeError('Choisissez comment créer l\'archive : upload ou rédaction.');
        return;
      }

      const plainContent = content
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .trim();

      if (contentMode === 'upload' && !file && !existingFileUrl) {
        setFileError('Le fichier principal est requis en mode upload.');
        return;
      }

      if (contentMode === 'write' && !plainContent) {
        setContentError('Le contenu est requis en mode rédaction.');
        return;
      }

      const payload: CreateDocumentPayload = {
        ...data,
        content: contentMode === 'write' ? content : '',
        file: contentMode === 'upload' ? (file ?? undefined) : undefined,
        annexes: annexes.length > 0 ? annexes : undefined,
      };
      if (isEdit && id) {
        await documentService.update(id, payload);
      } else {
        await documentService.create(payload);
        localStorage.removeItem(DRAFT_KEY);
      }
      onSaved?.();
      if (embedded) return;
      navigate('/documents');
    } catch {
      setApiError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className={embedded ? 'mx-auto max-w-3xl px-2 py-2' : 'mx-auto max-w-3xl px-4 py-8'}>
      {/* Breadcrumb */}
      {!embedded && <div className="mb-4 flex items-center gap-2 text-sm text-[#456882]">
        <Link to="/" className="hover:text-[#234C6A]">Accueil</Link>
        <span>/</span>
        <Link to="/documents" className="hover:text-[#234C6A]">Documents</Link>
        <span>/</span>
        <span className="font-medium text-[#1B3C53]">{isEdit ? 'Modifier' : 'Nouveau document'}</span>
      </div>}

      {!embedded && <button
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-1.5 rounded-full border border-[#c4d4df] bg-[#edf4f8] px-4 py-2 text-sm font-medium text-[#456882] shadow-sm transition hover:bg-[#dbeaf3]"
      >
        <RiArrowLeftLine className="h-4 w-4" /> Retour
      </button>}

      {/* Hero Header */}
      <div className="arch-hero mb-6 overflow-hidden rounded-3xl border-b border-[#1a3850]">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEdit ? 'Modifier le document' : 'Nouvelle archive'}
              </h1>
              <p className="mt-0.5 text-sm text-[#a8c8de]">
                {isEdit
                  ? 'Mettez à jour les informations du document.'
                  : 'Remplissez les champs et choisissez comment créer votre archive.'}
              </p>
            </div>
            {!isEdit && draftSaved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2FA084]/20 px-3 py-1 text-xs font-medium text-[#5ecbaf]">
                <RiCheckLine className="h-3.5 w-3.5" /> Brouillon sauvegardé
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {apiError && (
          <div className="rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">{apiError}</div>
        )}

        {/* ── Section 1 : Informations générales ── */}
        <SectionCard icon={<RiBookmarkLine className="h-4 w-4" />} title="Informations générales">
          <div className="space-y-4">
            <FormField label="Titre du document" htmlFor="title" required error={errors.title?.message}>
              <Input
                id="title"
                placeholder="Rapport annuel 2025..."
                {...register('title', { required: 'Le titre est requis' })}
                error={errors.title?.message}
              />
            </FormField>

            <FormField label="Référence / Numéro de dossier" htmlFor="reference">
              <Input
                id="reference"
                placeholder="REF-2025-001"
                {...register('reference')}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Badge d'importance" htmlFor="badge_id" required error={errors.badge_id?.message}>
                <select
                  id="badge_id"
                  {...register('badge_id', { required: 'Sélectionnez un badge' })}
                  className="arch-select w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                >
                  <option value="">-- Choisir un badge --</option>
                  {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.badge_id && <p className="mt-1 text-xs text-[#BD114A]">{errors.badge_id.message}</p>}
              </FormField>

              <FormField label="Confidentialité" htmlFor="confidentiality_id" required error={errors.confidentiality_id?.message}>
                <select
                  id="confidentiality_id"
                  {...register('confidentiality_id', { required: 'Sélectionnez un niveau' })}
                  className="arch-select w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
                >
                  <option value="">-- Choisir un niveau --</option>
                  {confidentialities.map((c) => <option key={c.id} value={c.id}>{c.level}</option>)}
                </select>
                {errors.confidentiality_id && <p className="mt-1 text-xs text-[#BD114A]">{errors.confidentiality_id.message}</p>}
              </FormField>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 2 : Description ── */}
        <SectionCard icon={<RiAlignLeft className="h-4 w-4" />} title="Description additionnelle" badge="Optionnel">
          <textarea
            id="description"
            {...register('description')}
            rows={3}
            placeholder="Résumé, contexte, objet du document..."
            className="arch-select w-full resize-none rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#234C6A]/30"
          />
        </SectionCard>

        {/* ── Section 3 : Mode selector ── */}
        <div className="overflow-hidden rounded-2xl border border-[#dde8f0] bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-[#dde8f0] bg-[#f4f7fa] px-5 py-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#dbeaf3] text-[#234C6A]">
              <RiFileTextLine className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-[#1B3C53]">Contenu de l'archive</span>
            <span className="ml-auto rounded-full bg-[#234C6A] px-2 py-0.5 text-[10px] font-medium text-white">
              Choisir le mode
            </span>
          </div>

          <div className="p-5">
            {modeError && (
              <div className="mb-3 rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">
                {modeError}
              </div>
            )}

            {/* Mode picker */}
            <div className="mb-5 flex gap-3">
              <ModeOption
                active={contentMode === 'upload'}
                onClick={() => {
                  setContentMode('upload');
                  setModeError('');
                  setContentError('');
                }}
                icon={<RiUploadCloud2Line className="h-6 w-6" />}
                title="Uploader un fichier"
                description="Importez un PDF, Word, Excel ou image existant"
              />
              <ModeOption
                active={contentMode === 'write'}
                onClick={() => {
                  setContentMode('write');
                  setModeError('');
                  setFileError('');
                }}
                icon={<RiPencilLine className="h-6 w-6" />}
                title="Rédiger le contenu"
                description="Créez le texte directement dans l'éditeur"
              />
            </div>

            {/* ── Upload mode ── */}
            {contentMode === 'upload' && (
              <div className="space-y-2">
                <FileUpload
                  onChange={(selected) => {
                    setFile(selected);
                    setFileError('');
                  }}
                  value={file}
                  label="Cliquer ou glisser le fichier principal"
                />
                {fileError && <p className="text-xs text-[#BD114A]">{fileError}</p>}
              </div>
            )}

            {/* ── Write mode ── */}
            {contentMode === 'write' && (
              <div className="space-y-3">
                <RichTextEditor
                  value={content}
                  onChange={(next) => {
                    setContent(next);
                    setContentError('');
                  }}
                />
                {contentError && <p className="text-xs text-[#BD114A]">{contentError}</p>}

                {/* Inline preview toggle */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#c4d4df] bg-[#edf4f8] px-3 py-1.5 text-xs font-medium text-[#456882] hover:bg-[#dbeaf3]"
                  >
                    <RiEyeLine className="h-3.5 w-3.5" />
                    {previewOpen ? 'Masquer l\'aperçu' : 'Aperçu'}
                  </button>
                </div>

                {previewOpen && (
                  <div className="rounded-xl border border-[#c4d4df] bg-[#f4f7fa] p-5">
                    {watchedTitle && (
                      <h3 className="mb-3 text-base font-bold text-[#1B3C53]">{watchedTitle}</h3>
                    )}
                    {content && content !== '<p></p>' ? (
                      <div
                        className="prose prose-sm max-w-none text-[#1B3C53] [&_a]:text-[#234C6A] [&_img]:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-[#456882]">
                        <RiInformationLine className="h-4 w-4 text-[#7aaac4]" />
                        Aucun contenu à prévisualiser.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Section 4 : Fichiers annexes (always visible) ── */}
        <SectionCard
          icon={<RiAttachment2 className="h-4 w-4" />}
          title="Fichiers annexes"
          badge={annexes.length > 0 ? `${annexes.length} fichier(s)` : 'Optionnel'}
        >
          <MultiFileUpload value={annexes} onChange={setAnnexes} />
        </SectionCard>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={() => (embedded ? onCancel?.() : navigate(-1))}
            className="flex-1 rounded-xl"
          >
            <RiCloseLine className="h-4 w-4" /> {embedded ? 'Fermer' : 'Annuler'}
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-1 rounded-xl">
            {isEdit
              ? <><RiSaveLine className="h-4 w-4" /> Enregistrer</>
              : <><RiCheckLine className="h-4 w-4" /> Créer</>}
          </Button>
        </div>
      </form>
    </div>
  );
};

