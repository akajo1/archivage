import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
import { Spinner } from '../../../shared/components/atoms/Spinner';
import { useAuthStore } from '../../auth/store/authStore';

interface FormValues {
  title: string;
  badge_id: string;
  confidentiality_id: string;
}

export const DocumentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEdit = Boolean(id);

  const [badges, setBadges] = useState<Badge[]>([]);
  const [confidentialities, setConfidentialities] = useState<Confidentiality[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [apiError, setApiError] = useState('');

  const canCreate = user?.documentAccesses?.includes('create') ?? false;
  const canEdit = user?.documentAccesses?.includes('edit') ?? false;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>();

  useEffect(() => {
    Promise.all([badgeService.getAll(), confidentialityService.getAll()])
      .then(([b, c]) => { setBadges(b); setConfidentialities(c); });
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      documentService.getById(id).then((doc) => {
        reset({ title: doc.title, badge_id: doc.badge.id, confidentiality_id: doc.confidentiality.id });
        setLoading(false);
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError('');
      const payload: CreateDocumentPayload = { ...data, file: file ?? undefined };
      if (isEdit && id) {
        await documentService.update(id, payload);
      } else {
        await documentService.create(payload);
      }
      navigate('/documents');
    } catch {
      setApiError('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if ((!isEdit && !canCreate) || (isEdit && !canEdit)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Vous n'avez pas les permissions necessaires pour {isEdit ? 'editer' : 'creer'} un document.
        </div>
        <div className="mt-4">
          <Button variant="secondary" onClick={() => navigate('/documents')}>
            Retour a la liste
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          ← Retour
        </button>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {isEdit ? 'Modifier le document' : 'Nouveau document'}
        </h1>
      </div>

      <div className="rounded-2xl bg-white p-8 border border-gray-200 shadow-sm">
        {apiError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{apiError}</div>
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

          <FormField label="Badge d'importance" htmlFor="badge_id" required error={errors.badge_id?.message}>
            <select
              id="badge_id"
              {...register('badge_id', { required: 'Sélectionnez un badge' })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choisir un badge --</option>
              {badges.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {errors.badge_id && <p className="text-xs text-red-500">{errors.badge_id.message}</p>}
          </FormField>

          <FormField label="Niveau de confidentialité" htmlFor="confidentiality_id" required error={errors.confidentiality_id?.message}>
            <select
              id="confidentiality_id"
              {...register('confidentiality_id', { required: 'Sélectionnez un niveau' })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choisir un niveau --</option>
              {confidentialities.map((c) => <option key={c.id} value={c.id}>{c.level}</option>)}
            </select>
            {errors.confidentiality_id && <p className="text-xs text-red-500">{errors.confidentiality_id.message}</p>}
          </FormField>

          <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-gray-700">Fichier (optionnel)</label>
            <FileUpload onChange={setFile} value={file} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

