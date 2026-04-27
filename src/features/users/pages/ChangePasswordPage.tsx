import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../auth/services/authService';
import type { ChangePasswordPayload } from '../../auth/types/auth.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { FormField } from '../../../shared/components/molecules/FormField';
import { useState } from 'react';

type FormValues = ChangePasswordPayload & { confirmPassword: string };

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError('');
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccessMessage('Mot de passe modifié avec succès.');
      reset();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      if (error?.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('Une erreur est survenue. Vérifiez votre mot de passe actuel.');
      }
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-[#456882] hover:text-[#234C6A] hover:underline flex items-center gap-1"
        >
          ← Retour
        </button>
      </div>

      <div className="arch-card rounded-3xl p-8">
        <h1 className="mb-1 text-2xl font-bold text-[#1B3C53]">Changer le mot de passe</h1>
        <p className="mb-6 text-sm text-[#456882]">
          Pour des raisons de sécurité, saisissez votre mot de passe actuel avant d'en définir un nouveau.
        </p>

        {apiError && (
          <div className="mb-4 rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">
            {apiError}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-[#b8d8c0] bg-[#eaf6ed] p-3 text-sm text-[#2a6b3f]">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Mot de passe actuel" htmlFor="currentPassword" required error={errors.currentPassword?.message}>
            <Input
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              {...register('currentPassword', { required: 'Le mot de passe actuel est requis' })}
              error={errors.currentPassword?.message}
            />
          </FormField>

          <FormField label="Nouveau mot de passe" htmlFor="newPassword" required error={errors.newPassword?.message}>
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              {...register('newPassword', {
                required: 'Le nouveau mot de passe est requis',
                minLength: { value: 6, message: 'Minimum 6 caractères' },
              })}
              error={errors.newPassword?.message}
            />
          </FormField>

          <FormField label="Confirmer le nouveau mot de passe" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'La confirmation est requise',
                validate: (value) => value === newPassword || 'Les mots de passe ne correspondent pas',
              })}
              error={errors.confirmPassword?.message}
            />
          </FormField>

          <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
            Modifier le mot de passe
          </Button>
        </form>
      </div>
    </div>
  );
};

