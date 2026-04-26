import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { RiArrowLeftLine, RiCheckLine, RiCloseLine, RiSaveLine } from 'react-icons/ri';
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

export const DocumentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [confidentialities, setConfidentialities] = useState<Confidentiality[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('<p></p>');
  const [loading, setLoading] = useState(isEdit);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>();

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
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError('');
      const payload: CreateDocumentPayload = {
        ...data,
        content,
        file: file ?? undefined,
      };
      if (isEdit && id) {
        await documentService.update(id, payload);
      } else {
        await documentService.create(payload);
      }
      navigate('/documents');
    } catch {
      setApiError('Une erreur est survenue. Veuillez reessayer.');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 rounded-full border border-[#d8cab3] bg-[#f8f0e3] px-4 py-2 text-sm font-medium text-[#6b5a45] shadow-sm transition hover:bg-[#eedfc8]"
      >
        <RiArrowLeftLine className="h-4 w-4" /> Retour
      </button>

      <div className="arch-card overflow-hidden rounded-3xl">
        <div className="bg-linear-to-br from-[#efe2cb] via-[#eadac1] to-[#e2cfb2] px-8 py-6 border-b border-[#dccdb8]">
          <h1 className="text-2xl font-bold text-[#2f2a24]">
            {isEdit ? 'Modifier le document' : 'Nouveau document'}
          </h1>
          <p className="mt-1 text-sm text-[#6f614e]">
            {isEdit ? 'Mettez a jour les informations du document.' : 'Remplissez les informations pour creer un nouveau document.'}
          </p>
        </div>

        <div className="px-8 py-6">
          {apiError && (
            <div className="mb-5 rounded-xl border border-[#d7a59c] bg-[#f3d8d2] p-3 text-sm text-[#8b3e34]">{apiError}</div>
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

            <FormField label="Contenu du document" htmlFor="content">
              <RichTextEditor value={content} onChange={setContent} />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Badge d'importance" htmlFor="badge_id" required error={errors.badge_id?.message}>
                <select
                  id="badge_id"
                  {...register('badge_id', { required: 'Selectionnez un badge' })}
                  className="arch-select w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9a7d58]/40"
                >
                  <option value="">-- Choisir un badge --</option>
                  {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.badge_id && <p className="text-xs text-[#a44b3f]">{errors.badge_id.message}</p>}
              </FormField>

              <FormField label="Confidentialite" htmlFor="confidentiality_id" required error={errors.confidentiality_id?.message}>
                <select
                  id="confidentiality_id"
                  {...register('confidentiality_id', { required: 'Selectionnez un niveau' })}
                  className="arch-select w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9a7d58]/40"
                >
                  <option value="">-- Choisir un niveau --</option>
                  {confidentialities.map((c) => <option key={c.id} value={c.id}>{c.level}</option>)}
                </select>
                {errors.confidentiality_id && <p className="text-xs text-[#a44b3f]">{errors.confidentiality_id.message}</p>}
              </FormField>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="block text-sm font-medium text-[#5e503f]">Fichier (optionnel)</label>
              <FileUpload onChange={setFile} value={file} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1 rounded-xl">
                <RiCloseLine className="h-4 w-4" /> Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="flex-1 rounded-xl">
                {isEdit
                  ? <><RiSaveLine className="h-4 w-4" /> Enregistrer</>
                  : <><RiCheckLine className="h-4 w-4" /> Creer</>
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

