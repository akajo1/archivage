import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import type { ResetPasswordPayload } from '../types/auth.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { FormField } from '../../../shared/components/molecules/FormField';
import { useState } from 'react';

type FormValues = {
  newPassword: string;
  confirmPassword: string;
};

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const token = searchParams.get('token') ?? '';

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>();
  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      setApiError('Token de réinitialisation manquant ou invalide.');
      return;
    }
    try {
      setApiError('');
      const payload: ResetPasswordPayload = { token, newPassword: data.newPassword };
      await authService.resetPassword(payload);
      navigate('/login', { state: { message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.' } });
    } catch {
      setApiError('Token invalide ou expiré. Veuillez faire une nouvelle demande.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-linear-to-br from-[#1B3C53] via-[#234C6A] to-[#2d5a7b] p-12 text-white">
        <div className="flex items-center gap-2 text-xl font-bold">
          <span>📁</span>
          <span>Archivage</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">Créez un nouveau mot de passe.</h2>
          <p className="mt-4 text-base leading-relaxed text-[#a8c8de]">
            Choisissez un mot de passe fort pour sécuriser votre compte.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 opacity-30">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={`rounded-2xl bg-white/20 ${i % 3 === 0 ? 'h-24' : i % 3 === 1 ? 'h-32' : 'h-20'}`} />
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-transparent p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <span className="text-4xl">📁</span>
            <h1 className="mt-2 text-2xl font-bold text-[#1B3C53]">Archivage</h1>
          </div>

          <div className="arch-card rounded-3xl p-8">
            <h2 className="mb-1 text-2xl font-bold text-[#1B3C53]">Nouveau mot de passe</h2>
            <p className="mb-6 text-sm text-[#456882]">
              Définissez votre nouveau mot de passe (minimum 6 caractères).
            </p>

            {!token && (
              <div className="mb-4 rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">
                Lien de réinitialisation invalide. Veuillez faire une nouvelle demande.
              </div>
            )}

            {apiError && (
              <div className="mb-4 rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField label="Nouveau mot de passe" htmlFor="newPassword" required error={errors.newPassword?.message}>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register('newPassword', {
                    required: 'Le mot de passe est requis',
                    minLength: { value: 6, message: 'Minimum 6 caractères' },
                  })}
                  error={errors.newPassword?.message}
                />
              </FormField>

              <FormField label="Confirmer le mot de passe" htmlFor="confirmPassword" required error={errors.confirmPassword?.message}>
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

              <Button type="submit" isLoading={isSubmitting} disabled={!token} className="mt-2 w-full">
                Réinitialiser le mot de passe
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[#456882]">
              <Link to="/login" className="font-medium text-[#234C6A] hover:underline">
                ← Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

