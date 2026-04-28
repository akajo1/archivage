import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { FirstLoginChangePasswordPayload } from '../types/auth.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { FormField } from '../../../shared/components/molecules/FormField';

type FormValues = FirstLoginChangePasswordPayload & { confirmPassword: string };

export const FirstLoginChangePasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const prefilledEmail =
    (location.state as { email?: string } | undefined)?.email ?? '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { email: prefilledEmail },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError('');
      await authService.firstLoginChangePassword({
        email: data.email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccessMessage('Mot de passe changé. Connectez-vous avec votre nouveau mot de passe.');
      setTimeout(() => navigate('/login'), 1300);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(
        error?.response?.data?.message ??
          'Impossible de changer le mot de passe initial.',
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="arch-card rounded-3xl p-8">
          <h1 className="mb-1 text-2xl font-bold text-[#1B3C53]">Premiere connexion</h1>
          <p className="mb-6 text-sm text-[#456882]">
            Pour securiser votre compte, vous devez definir un nouveau mot de passe.
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
            <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                {...register('email', { required: "L'email est requis" })}
                error={errors.email?.message}
              />
            </FormField>

            <FormField
              label="Mot de passe initial"
              htmlFor="currentPassword"
              required
              error={errors.currentPassword?.message}
            >
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                {...register('currentPassword', {
                  required: 'Le mot de passe initial est requis',
                })}
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
                  minLength: { value: 6, message: 'Minimum 6 caracteres' },
                })}
                error={errors.newPassword?.message}
              />
            </FormField>

            <FormField
              label="Confirmer le nouveau mot de passe"
              htmlFor="confirmPassword"
              required
              error={errors.confirmPassword?.message}
            >
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'La confirmation est requise',
                  validate: (value) =>
                    value === newPassword || 'Les mots de passe ne correspondent pas',
                })}
                error={errors.confirmPassword?.message}
              />
            </FormField>

            <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
              Changer le mot de passe
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-[#456882]">
            Retour a la <Link to="/login" className="font-medium text-[#234C6A] hover:underline">connexion</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

