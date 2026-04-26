import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import DOMPurify from 'dompurify';
import { RiArrowLeftLine, RiCheckLine, RiCloseLine, RiSaveLine, RiEyeLine, RiPencilLine, RiInformationLine } from 'react-icons/ri';
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
import { RichTextEditor } from '../../../shared/components/molecules/RichTextEditor';
import { Spinner } from '../../../shared/components/atoms/Spinner';

interface FormValues {
  title: string;
  badge_id: string;
  confidentiality_id: string;
}

const DRAFT_KEY = 'doc_draft';

export const DocumentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [confidentialities, setConfidentialities] = useState<Confidentiality[]>([]);
  const [file, setFile] = useState<File | null>(null);
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
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
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
        reset({ title: doc.title, badge_id: doc.badge.id, confidentiality_id: doc.confidentiality.id });
        setContent(doc.content || '<p></p>');
        setLoading(false);
      });
    } else {
      // Restore draft title for new docs
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
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title: watchedTitle, content }));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch { /* ignore */ }
    }, 1500);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  }, [watchedTitle, content, isEdit]);

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError('');
      const payload: CreateDocumentPayload = { ...data, content, file: file ?? undefined };
      if (isEdit && id) {
        await documentService.update(id, payload);
      } else {
        await documentService.create(payload);
        localStorage.removeItem(DRAFT_KEY);
      }
      navigate('/documents');
    } catch {
      setApiError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-sm text-[#456882]">
        <Link to="/" className="hover:text-[#234C6A]">Accueil</Link>
        <span>/</span>
        <Link to="/documents" className="hover:text-[#234C6A]">Documents</Link>
        <span>/</span>
        <span className="font-medium text-[#1B3C53]">{isEdit ? 'Modifier' : 'Nouveau document'}</span>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-1.5 rounded-full border border-[#c4d4df] bg-[#edf4f8] px-4 py-2 text-sm font-medium text-[#456882] shadow-sm transition hover:bg-[#dbeaf3]"
      >
        <RiArrowLeftLine className="h-4 w-4" /> Retour
      </button>

      <div className="arch-card overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="arch-hero px-8 py-6 border-b border-[#1a3850]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEdit ? 'Modifier le document' : 'Nouveau document'}
              </h1>
              <p className="mt-0.5 text-sm text-[#a8c8de]">
                {isEdit ? 'Mettez à jour les informations du document.' : 'Remplissez les informations pour créer un nouveau document.'}
              </p>
            </div>
            {!isEdit && draftSaved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2FA084]/20 px-3 py-1 text-xs font-medium text-[#5ecbaf]">
                <RiCheckLine className="h-3.5 w-3.5" /> Brouillon sauvegardé
              </span>
            )}
          </div>

          {/* Tab bar (edit / preview) */}
          <div className="mt-5 flex gap-1">
            <button
              type="button"
              onClick={() => setTab('edit')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                tab === 'edit'
                  ? 'bg-white text-[#1B3C53]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <RiPencilLine className="h-3.5 w-3.5" /> Éditeur
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                tab === 'preview'
                  ? 'bg-white text-[#1B3C53]'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <RiEyeLine className="h-3.5 w-3.5" /> Aperçu
            </button>
          </div>
        </div>

        {tab === 'preview' ? (
          /* ── Preview tab ── */
          <div className="px-8 py-6">
            {watchedTitle && (
              <h2 className="mb-4 text-xl font-bold text-[#1B3C53]">{watchedTitle}</h2>
            )}
            {content && content !== '<p></p>' ? (
              <div
                className="prose prose-sm max-w-none text-[#1B3C53] [&_img]:rounded-xl [&_a]:text-[#234C6A]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[#c4d4df] bg-[#edf4f8] px-6 py-10 text-center">
                <RiInformationLine className="mx-auto mb-2 h-6 w-6 text-[#7aaac4]" />
                <p className="text-sm text-[#456882]">Aucun contenu à prévisualiser.</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Edit tab ── */
          <div className="px-8 py-6">
            {apiError && (
              <div className="mb-5 rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">{apiError}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <FormField label="Titre du document" htmlFor="title" required error={errors.title?.message}>
                <Input
                  id="title"
                  placeholder="Rapport annuel 2025..."
                  {...register('title', { required: 'Le titre est requis' })}
                  error={errors.title?.message}
                />
              </FormField>

              {/* Badge + Confidentiality */}
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

              <FormField label="Contenu du document" htmlFor="content">
                <RichTextEditor value={content} onChange={setContent} />
              </FormField>

              <div className="flex flex-col gap-1.5">
                <label className="block text-sm font-medium text-[#456882]">Fichier (optionnel)</label>
                <FileUpload onChange={setFile} value={file} />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1 rounded-xl">
                  <RiCloseLine className="h-4 w-4" /> Annuler
                </Button>
                <Button type="submit" isLoading={isSubmitting} className="flex-1 rounded-xl">
                  {isEdit
                    ? <><RiSaveLine className="h-4 w-4" /> Enregistrer</>
                    : <><RiCheckLine className="h-4 w-4" /> Créer</>
                  }
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

