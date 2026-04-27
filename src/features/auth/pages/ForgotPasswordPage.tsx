import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import type { ForgotPasswordPayload } from '../types/auth.types';
import { Button } from '../../../shared/components/atoms/Button';
import { Input } from '../../../shared/components/atoms/Input';
import { FormField } from '../../../shared/components/molecules/FormField';
import { useState } from 'react';

export const ForgotPasswordPage = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordPayload>();

  const onSubmit = async (data: ForgotPasswordPayload) => {
    try {
      setApiError('');
      await authService.forgotPassword(data);
      setSuccessMessage(
        'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.',
      );
    } catch {
      setApiError('Une erreur est survenue. Veuillez réessayer.');
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
          <h2 className="text-4xl font-bold leading-tight">Récupérez l'accès à votre compte.</h2>
          <p className="mt-4 text-base leading-relaxed text-[#a8c8de]">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
            <h2 className="mb-1 text-2xl font-bold text-[#1B3C53]">Mot de passe oublié</h2>
            <p className="mb-6 text-sm text-[#456882]">
              Saisissez votre email pour recevoir un lien de réinitialisation.
            </p>

            {apiError && (
              <div className="mb-4 rounded-xl border border-[#f4a8bf] bg-[#fce8ef] p-3 text-sm text-[#BD114A]">
                {apiError}
              </div>
            )}

            {successMessage ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-[#b8d8c0] bg-[#eaf6ed] p-4 text-sm text-[#2a6b3f]">
                  {successMessage}
                </div>
                <Link
                  to="/login"
                  className="block w-full rounded-xl border border-[#c4d4df] py-2.5 text-center text-sm font-medium text-[#234C6A] hover:bg-[#edf4f8] transition-colors"
                >
                  Retour à la connexion
                </Link>
              </div>
            ) : (
              <>
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

                  <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
                    Envoyer le lien
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-[#456882]">
                  <Link to="/login" className="font-medium text-[#234C6A] hover:underline">
                    ← Retour à la connexion
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

